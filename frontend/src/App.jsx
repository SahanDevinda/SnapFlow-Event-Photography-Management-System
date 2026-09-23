import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import PackagesPage from './pages/public/PackagesPage';
import PackageDetailPage from './pages/public/PackageDetailPage';
import AvailabilityPage from './pages/public/AvailabilityPage';
import GalleryAccessPage from './pages/public/GalleryAccessPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerPackages from './pages/customer/CustomerPackages';
import BookPackage from './pages/customer/BookPackage';
import CustomerBookingsList from './pages/customer/CustomerBookingsList';
import CustomerBookingDetail from './pages/customer/CustomerBookingDetail';
import CustomerGalleriesList from './pages/customer/CustomerGalleriesList';
import CustomerGalleryView from './pages/customer/CustomerGalleryView';
import CustomerFeedback from './pages/customer/CustomerFeedback';
import CustomerReviews from './pages/customer/CustomerReviews';

// CRO Pages
import CRODashboard from './pages/cro/CRODashboard';
import CustomerManagement from './pages/cro/CustomerManagement';
import CROBookingsList from './pages/cro/CROBookingsList';
import CRONewBooking from './pages/cro/CRONewBooking';
import CROChangeRequests from './pages/cro/CROChangeRequests';
import CROPackagesView from './pages/cro/CROPackagesView';
import CROFeedback from './pages/cro/CROFeedback';

// Operations Pages
import OpsDashboard from './pages/operations/OpsDashboard';
import MasterCalendar from './pages/operations/MasterCalendar';
import OpsAssignments from './pages/operations/OpsAssignments';
import EquipmentInventory from './pages/operations/EquipmentInventory';
import OpsChangeRequests from './pages/operations/OpsChangeRequests';
import OpsGalleries from './pages/operations/OpsGalleries';

// Photographer Pages
import PhotographerDashboard from './pages/photographer/PhotographerDashboard';
import AssignedEvents from './pages/photographer/AssignedEvents';
import AssignmentDetail from './pages/photographer/AssignmentDetail';
import PhotographerGalleries from './pages/photographer/PhotographerGalleries';
import GalleryEditor from './pages/photographer/GalleryEditor';
import PhotographerCalendar from './pages/photographer/PhotographerCalendar';
import CoverageSummary from './pages/photographer/CoverageSummary';

// Finance Pages
import FinanceDashboard from './pages/finance/FinanceDashboard';
import AllPayments from './pages/finance/AllPayments';
import PendingPayments from './pages/finance/PendingPayments';
import OutstandingBalances from './pages/finance/OutstandingBalances';
import FinancialReports from './pages/finance/FinancialReports';

// Admin / Director Pages
import ExecutiveDashboard from './pages/admin/ExecutiveDashboard';
import PackageCrud from './pages/admin/PackageCrud';
import AddOnCrud from './pages/admin/AddOnCrud';
import UserManagement from './pages/admin/UserManagement';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminAssignments from './pages/admin/AdminAssignments';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminGalleries from './pages/admin/AdminGalleries';
import PaymentAudit from './pages/admin/PaymentAudit';
import AdminChangeRequests from './pages/admin/AdminChangeRequests';
import AdminFeedback from './pages/admin/AdminFeedback';
import BusinessReports from './pages/admin/BusinessReports';
import BrandingSettings from './pages/admin/BrandingSettings';
import ActivityLogs from './pages/admin/ActivityLogs';

// Shared Pages
import ProfilePage from './pages/shared/ProfilePage';
import ChangePasswordPage from './pages/shared/ChangePasswordPage';
import NotificationsPage from './pages/shared/NotificationsPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* PUBLIC WEBSITE ROUTES */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/:id" element={<PackageDetailPage />} />
              <Route path="/availability" element={<AvailabilityPage />} />
              <Route path="/gallery-access" element={<GalleryAccessPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>

            {/* CUSTOMER PORTAL ROUTES */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="packages" element={<CustomerPackages />} />
              <Route path="book" element={<BookPackage />} />
              <Route path="bookings" element={<CustomerBookingsList />} />
              <Route path="bookings/:id" element={<CustomerBookingDetail />} />
              <Route path="galleries" element={<CustomerGalleriesList />} />
              <Route path="galleries/:id" element={<CustomerGalleryView />} />
              <Route path="feedback" element={<CustomerFeedback />} />
              <Route path="reviews" element={<CustomerReviews />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* CRO PORTAL ROUTES */}
            <Route
              path="/cro"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER_RELATIONS_OFFICER', 'COMPANY_DIRECTOR']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/cro/dashboard" replace />} />
              <Route path="dashboard" element={<CRODashboard />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="bookings" element={<CROBookingsList />} />
              <Route path="new-booking" element={<CRONewBooking />} />
              <Route path="change-requests" element={<CROChangeRequests />} />
              <Route path="packages" element={<CROPackagesView />} />
              <Route path="feedback" element={<CROFeedback />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* OPERATIONS PORTAL ROUTES */}
            <Route
              path="/operations"
              element={
                <ProtectedRoute allowedRoles={['OPERATIONS_MANAGER', 'COMPANY_DIRECTOR']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/operations/dashboard" replace />} />
              <Route path="dashboard" element={<OpsDashboard />} />
              <Route path="calendar" element={<MasterCalendar />} />
              <Route path="assignments" element={<OpsAssignments />} />
              <Route path="equipment" element={<EquipmentInventory />} />
              <Route path="change-requests" element={<OpsChangeRequests />} />
              <Route path="galleries" element={<OpsGalleries />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* PHOTOGRAPHER PORTAL ROUTES */}
            <Route
              path="/photographer"
              element={
                <ProtectedRoute allowedRoles={['PHOTOGRAPHER', 'COMPANY_DIRECTOR']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/photographer/dashboard" replace />} />
              <Route path="dashboard" element={<PhotographerDashboard />} />
              <Route path="assignments" element={<AssignedEvents />} />
              <Route path="assignments/:id" element={<AssignmentDetail />} />
              <Route path="calendar" element={<PhotographerCalendar />} />
              <Route path="galleries" element={<PhotographerGalleries />} />
              <Route path="galleries/:id/edit" element={<GalleryEditor />} />
              <Route path="coverage" element={<CoverageSummary />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* FINANCE PORTAL ROUTES */}
            <Route
              path="/finance"
              element={
                <ProtectedRoute allowedRoles={['FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/finance/dashboard" replace />} />
              <Route path="dashboard" element={<FinanceDashboard />} />
              <Route path="payments" element={<AllPayments />} />
              <Route path="pending" element={<PendingPayments />} />
              <Route path="outstanding" element={<OutstandingBalances />} />
              <Route path="reports" element={<FinancialReports />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* ADMIN / COMPANY DIRECTOR PORTAL ROUTES */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['COMPANY_DIRECTOR']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<ExecutiveDashboard />} />
              <Route path="packages" element={<PackageCrud />} />
              <Route path="addons" element={<AddOnCrud />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="calendar" element={<AdminCalendar />} />
              <Route path="assignments" element={<AdminAssignments />} />
              <Route path="equipment" element={<AdminEquipment />} />
              <Route path="galleries" element={<AdminGalleries />} />
              <Route path="payments" element={<PaymentAudit />} />
              <Route path="change-requests" element={<AdminChangeRequests />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="reports" element={<BusinessReports />} />
              <Route path="settings" element={<BrandingSettings />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* 404 NOT FOUND ROUTE */}
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
