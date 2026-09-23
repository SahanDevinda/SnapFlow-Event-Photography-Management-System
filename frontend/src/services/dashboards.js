import api, { listOf } from './api';

/**
 * The frontend originally called /dashboard/{role} endpoints that do not exist
 * on the backend (every one of them returned 404). These helpers rebuild the
 * exact same metric shapes from the real, secured APIs instead.
 */

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const settled = async (promise, fallback) => {
  try {
    return await promise;
  } catch {
    return fallback;
  }
};

const byEventDateAsc = (a, b) => String(a.eventDate || '').localeCompare(String(b.eventDate || ''));
const byEventDateDesc = (a, b) => String(b.eventDate || '').localeCompare(String(a.eventDate || ''));
const isUpcoming = (d) => !!d && String(d) >= new Date().toISOString().slice(0, 10);

const OPEN_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'];

export async function fetchCustomerDashboard() {
  const [bookingsRes, galleriesRes] = await Promise.all([
    settled(api.get('/bookings/my?page=0&size=100'), null),
    settled(api.get('/galleries/my?page=0&size=100'), null)
  ]);

  const bookings = listOf(bookingsRes);
  const galleries = listOf(galleriesRes);

  return {
    activeBookingsCount: bookings.filter((b) => OPEN_BOOKING_STATUSES.includes(b.status)).length,
    galleriesCount: galleries.length,
    pendingPaymentsCount: bookings.filter(
      (b) => num(b.balanceAmount) > 0 && b.status !== 'CANCELLED'
    ).length,
    totalSpent: bookings.reduce((sum, b) => sum + num(b.paidAmount), 0),
    recentBookings: [...bookings].sort(byEventDateDesc).slice(0, 5),
    recentGalleries: galleries.slice(0, 4)
  };
}

export async function fetchCroDashboard() {
  const [feedbackRes, customersRes, changeRes, bookingsRes] = await Promise.all([
    settled(api.get('/feedback?page=0&size=50'), null),
    settled(api.get('/users/customers'), null),
    settled(api.get('/change-requests/pending'), null),
    settled(api.get('/bookings?page=0&size=50'), null)
  ]);

  const feedback = listOf(feedbackRes);
  const customers = listOf(customersRes);
  const changeRequests = listOf(changeRes);
  const bookings = listOf(bookingsRes);

  const openFeedback = feedback.filter((f) => f.status !== 'RESOLVED');

  return {
    pendingInquiriesCount: openFeedback.length,
    activeCustomersCount: customers.filter((c) => c.active !== false).length,
    pendingChangeRequestsCount: changeRequests.filter((r) => r.status === 'PENDING').length,
    recentInquiries: openFeedback.slice(0, 6),
    recentBookings: [...bookings].sort(byEventDateDesc).slice(0, 5)
  };
}

export async function fetchOperationsDashboard() {
  const [bookingsRes, photographersRes, equipmentRes] = await Promise.all([
    settled(api.get('/bookings?page=0&size=100'), null),
    settled(api.get('/users/photographers'), null),
    settled(api.get('/equipment?page=0&size=100'), null)
  ]);

  const bookings = listOf(bookingsRes);
  const photographers = listOf(photographersRes);
  const equipment = listOf(equipmentRes);

  const upcoming = bookings
    .filter((b) => isUpcoming(b.eventDate) && b.status !== 'CANCELLED')
    .sort(byEventDateAsc);

  return {
    upcomingShootsCount: upcoming.length,
    unassignedShootsCount: upcoming.filter((b) => !(b.assignments || []).length).length,
    activePhotographersCount: photographers.filter((p) => p.active !== false).length,
    equipmentAlertsCount: equipment.filter((e) =>
      ['MAINTENANCE', 'RETIRED'].includes(e.status)
    ).length,
    upcomingEvents: upcoming.slice(0, 8)
  };
}

export async function fetchPhotographerDashboard() {
  const assignments = listOf(await settled(api.get('/assignments/my?page=0&size=100'), null));

  const upcoming = assignments
    .filter((a) => isUpcoming(a.eventDate) && a.status !== 'CANCELLED')
    .sort(byEventDateAsc);
  const completed = assignments.filter((a) => a.status === 'COMPLETED');

  // "Pending uploads" = finished shoots that still have no published gallery.
  const galleryChecks = await Promise.all(
    completed.slice(0, 20).map((a) =>
      settled(api.get(`/galleries/booking/${a.bookingId}`), null)
    )
  );
  const pendingUploadsCount = galleryChecks.filter(
    (g) => !g?.data || g.data.status !== 'PUBLISHED'
  ).length;

  return {
    upcomingShootsCount: upcoming.length,
    completedShootsCount: completed.length,
    pendingUploadsCount,
    upcomingAssignments: upcoming.slice(0, 8)
  };
}

export async function fetchFinanceDashboard() {
  const [paymentsRes, pendingRes, bookingsRes] = await Promise.all([
    settled(api.get('/payments?page=0&size=100'), null),
    settled(api.get('/payments/pending?page=0&size=100'), null),
    settled(api.get('/bookings?page=0&size=100'), null)
  ]);

  const payments = listOf(paymentsRes);
  const pending = listOf(pendingRes);
  const bookings = listOf(bookingsRes);

  return {
    totalRevenue: payments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + num(p.amount), 0),
    pendingVerificationsCount: pending.length,
    outstandingBalanceTotal: bookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + num(b.balanceAmount), 0),
    recentPayments: payments.slice(0, 6)
  };
}

export async function fetchExecutiveDashboard() {
  const [metricsRes, bookingsRes, usersRes, photographersRes] = await Promise.all([
    settled(api.get('/dashboards/executive'), null),
    settled(api.get('/bookings?page=0&size=20'), null),
    settled(api.get('/users?page=0&size=1'), null),
    settled(api.get('/users/photographers'), null)
  ]);

  const metrics = metricsRes?.data || {};
  const bookings = listOf(bookingsRes);
  const photographers = listOf(photographersRes);

  // Backend returns monthlyRevenue as { "Jan 2026": 120000, ... }
  const monthlyRevenue = Object.entries(metrics.monthlyRevenue || {}).map(
    ([month, revenue]) => ({ month, revenue: num(revenue) })
  );

  return {
    totalRevenue: num(metrics.verifiedRevenue),
    totalSales: num(metrics.totalSales),
    outstandingBalance: num(metrics.outstandingBalance),
    totalBookings: num(metrics.totalBookings),
    totalUsers: num(usersRes?.data?.totalElements) || num(metrics.totalCustomers) + num(metrics.totalPhotographers),
    activePhotographersCount: photographers.filter((p) => p.active !== false).length,
    bookingStatusCounts: metrics.bookingStatusCounts || {},
    recentBookings: [...bookings].sort(byEventDateDesc).slice(0, 6),
    monthlyRevenue
  };
}
