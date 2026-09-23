import React, { useState, useEffect, useCallback } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatLKR, formatDate } from '../../utils/formatters';
import {
  Search, Plus, Eye, Edit2, XCircle, Trash2,
  Calendar, MapPin, Clock, User, Package, AlertTriangle
} from 'lucide-react';

const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const EVENT_TYPES = ['Wedding', 'Engagement', 'Corporate', 'Birthday', 'Family Portrait', 'Product Shoot', 'Other'];

const EMPTY_FORM = {
  customerId: '',
  packageId: '',
  eventDate: '',
  startTime: '',
  venue: '',
  eventType: '',
  specialRequests: '',
  addOnIds: [],
};

export default function AdminBookings() {
  const toast = useToast();
  const { user } = useAuth();
  const isDirector = user?.role === 'COMPANY_DIRECTOR';

  // Data
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [viewBooking, setViewBooking] = useState(null);
  const [editBooking, setEditBooking] = useState(null);   // null = Add mode, object = Edit mode
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Form
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings?page=0&size=200');
      setBookings(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [cusRes, pkgRes, addOnRes] = await Promise.all([
        api.get('/users?role=CUSTOMER&page=0&size=200'),
        api.get('/packages?page=0&size=100'),
        api.get('/add-ons?page=0&size=100'),
      ]);
      setCustomers(listOf(cusRes));
      setPackages(listOf(pkgRes));
      setAddOns(listOf(addOnRes));
    } catch (err) {
      console.error('Failed to load dropdown data', err);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchDropdownData();
  }, [fetchBookings, fetchDropdownData]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchesSearch =
      (b.bookingRef || '').toLowerCase().includes(q) ||
      (b.customerName || '').toLowerCase().includes(q) ||
      (b.packageName || '').toLowerCase().includes(q) ||
      (b.eventType || '').toLowerCase().includes(q) ||
      (b.venue || '').toLowerCase().includes(q);
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Create / Edit ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditBooking(null);
    setCreateOpen(true);
  };

  const openEdit = (b) => {
    setEditBooking(b);
    setForm({
      customerId: b.customerId || '',
      packageId: b.packageId || '',
      eventDate: b.eventDate || '',
      startTime: b.startTime || '',
      venue: b.venue || '',
      eventType: b.eventType || '',
      specialRequests: b.specialRequests || '',
      addOnIds: b.addOns ? b.addOns.map(a => a.id) : [],
    });
    setCreateOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.customerId) { toast.error('Please select a customer.'); return; }
    if (!form.packageId) { toast.error('Please select a package.'); return; }
    if (!form.eventDate) { toast.error('Event date is required.'); return; }
    if (!form.startTime) { toast.error('Start time is required.'); return; }
    if (!form.venue.trim()) { toast.error('Venue is required.'); return; }
    if (!form.eventType) { toast.error('Event type is required.'); return; }

    try {
      setSaving(true);
      if (editBooking) {
        await api.put(`/bookings/${editBooking.id}`, {
          packageId: Number(form.packageId),
          eventDate: form.eventDate,
          startTime: form.startTime,
          venue: form.venue.trim(),
          eventType: form.eventType,
          specialRequests: form.specialRequests || null,
          addOnIds: form.addOnIds,
        });
        toast.success('Booking updated successfully!');
      } else {
        await api.post('/bookings', {
          customerId: Number(form.customerId),
          packageId: Number(form.packageId),
          eventDate: form.eventDate,
          startTime: form.startTime,
          venue: form.venue.trim(),
          eventType: form.eventType,
          specialRequests: form.specialRequests || null,
          addOnIds: form.addOnIds,
        });
        toast.success('Booking created successfully!');
      }
      setCreateOpen(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save booking.');
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await api.post(`/bookings/${cancelTarget.id}/cancel`, null, {
        params: { reason: 'Cancelled by administrator' }
      });
      toast.success(`Booking ${cancelTarget.bookingRef} has been cancelled.`);
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/bookings/${deleteTarget.id}`);
      toast.success(`Booking ${deleteTarget.bookingRef} has been deleted.`);
      setDeleteTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete booking.');
    } finally {
      setDeleting(false);
    }
  };

  // ── View Details ───────────────────────────────────────────────────────────

  const openView = async (b) => {
    try {
      const res = await api.get(`/bookings/${b.id}`);
      setViewBooking(res.data || res);
    } catch {
      setViewBooking(b);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-900">All Bookings</h1>
          <p className="text-navy-600 text-sm">Create, review, edit, cancel or delete client reservations.</p>
        </div>
        <Button variant="gold" icon={Plus} onClick={openCreate}>
          New Booking
        </Button>
      </div>

      {/* Search & Filter */}
      <Card padding="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-navy-400" />
            <input
              type="text"
              placeholder="Search by ref, client, package, event type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">All Statuses</option>
            {BOOKING_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        {loading ? (
          <LoadingSkeleton count={6} className="h-12" />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-10 h-10 text-navy-300 mx-auto mb-3" />
            <p className="text-navy-400 text-sm">No bookings found.</p>
            <Button variant="gold" icon={Plus} size="sm" className="mt-4" onClick={openCreate}>
              Create First Booking
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-navy-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-navy-900 text-xs">{b.bookingRef}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-navy-900">{b.customerName}</p>
                      <p className="text-xs text-navy-400">{b.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-navy-700">{formatDate(b.eventDate)}</td>
                    <td className="py-3 px-4 text-navy-700">{b.packageName}</td>
                    <td className="py-3 px-4 font-semibold text-navy-900">{formatLKR(b.totalAmount)}</td>
                    <td className="py-3 px-4"><Badge status={b.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        <Button variant="outline" size="xs" icon={Eye} onClick={() => openView(b)}>
                          View
                        </Button>
                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                          <Button variant="secondary" size="xs" icon={Edit2} onClick={() => openEdit(b)}>
                            Edit
                          </Button>
                        )}
                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                          <Button variant="danger" size="xs" icon={XCircle} onClick={() => setCancelTarget(b)}>
                            Cancel
                          </Button>
                        )}
                        {isDirector && b.status !== 'COMPLETED' && (
                          <Button variant="danger" size="xs" icon={Trash2} onClick={() => setDeleteTarget(b)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-navy-50 text-xs text-navy-400">
              Showing {filtered.length} of {bookings.length} bookings
            </div>
          </div>
        )}
      </Card>

      {/* ── View Details Modal ───────────────────────────────────────────────── */}
      {viewBooking && (
        <Modal
          isOpen={true}
          onClose={() => setViewBooking(null)}
          title={`Booking Details — ${viewBooking.bookingRef}`}
          size="xl"
          footer={
            <Button variant="secondary" onClick={() => setViewBooking(null)}>Close</Button>
          }
        >
          <div className="space-y-5 text-sm">
            {/* Status bar */}
            <div className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
              <span className="text-xs font-semibold text-navy-500 uppercase">Current Status</span>
              <Badge status={viewBooking.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-navy-400 uppercase mb-1">Client Name</p>
                <p className="font-semibold text-navy-900">{viewBooking.customerName}</p>
                <p className="text-xs text-navy-500">{viewBooking.customerEmail}</p>
                {viewBooking.customerPhone && <p className="text-xs text-navy-500">{viewBooking.customerPhone}</p>}
              </div>
              <div>
                <p className="text-xs text-navy-400 uppercase mb-1">Photography Package</p>
                <p className="font-semibold text-navy-900">{viewBooking.packageName}</p>
                {viewBooking.durationHours && <p className="text-xs text-navy-500">{viewBooking.durationHours}h coverage</p>}
              </div>
              <div>
                <p className="text-xs text-navy-400 uppercase mb-1">Event Date</p>
                <p className="font-semibold text-navy-900">{formatDate(viewBooking.eventDate)}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 uppercase mb-1">Time</p>
                <p className="font-semibold text-navy-900">{viewBooking.startTime} – {viewBooking.endTime}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 uppercase mb-1">Event Type</p>
                <p className="font-semibold text-navy-900">{viewBooking.eventType}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 uppercase mb-1">Venue / Location</p>
                <p className="font-semibold text-navy-900">{viewBooking.venue}</p>
              </div>
            </div>

            {/* Financials */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 space-y-1">
              <p className="text-xs font-bold text-amber-900 uppercase mb-2">Financial Summary</p>
              <div className="flex justify-between text-xs text-navy-700">
                <span>Package Price</span><span>{formatLKR(viewBooking.packagePrice)}</span>
              </div>
              {viewBooking.addOnsPrice > 0 && (
                <div className="flex justify-between text-xs text-navy-700">
                  <span>Add-ons</span><span>{formatLKR(viewBooking.addOnsPrice)}</span>
                </div>
              )}
              {viewBooking.additionalCharges > 0 && (
                <div className="flex justify-between text-xs text-navy-700">
                  <span>Additional Charges</span><span>{formatLKR(viewBooking.additionalCharges)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-navy-900 border-t border-amber-200 pt-1 mt-1">
                <span>Total</span><span className="text-amber-700">{formatLKR(viewBooking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-navy-600">
                <span>Paid</span><span className="text-emerald-600">{formatLKR(viewBooking.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-navy-600">
                <span>Balance</span>
                <span className={viewBooking.balanceAmount > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}>
                  {formatLKR(viewBooking.balanceAmount)}
                </span>
              </div>
            </div>

            {/* Assignments */}
            {viewBooking.assignments?.length > 0 && (
              <div>
                <p className="text-xs text-navy-400 uppercase mb-2">Assigned Photographers</p>
                <div className="space-y-1">
                  {viewBooking.assignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 bg-navy-50 rounded-lg text-xs">
                      <span className="font-semibold text-navy-900">{a.photographerName}</span>
                      <Badge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {viewBooking.addOns?.length > 0 && (
              <div>
                <p className="text-xs text-navy-400 uppercase mb-2">Add-on Services</p>
                <div className="space-y-1">
                  {viewBooking.addOns.map(ao => (
                    <div key={ao.id} className="flex justify-between text-xs p-1.5 bg-navy-50 rounded">
                      <span>{ao.name}</span><span>{formatLKR(ao.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {viewBooking.specialRequests && (
              <div>
                <p className="text-xs text-navy-400 uppercase mb-1">Special Requests</p>
                <p className="text-navy-700 text-xs bg-navy-50 p-2 rounded-lg">{viewBooking.specialRequests}</p>
              </div>
            )}
            {viewBooking.internalNotes && (
              <div>
                <p className="text-xs text-navy-400 uppercase mb-1">Internal Notes</p>
                <p className="text-navy-700 text-xs bg-amber-50 p-2 rounded-lg border border-amber-200">{viewBooking.internalNotes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex gap-4 text-xs text-navy-400 border-t border-navy-100 pt-3">
              <span>Created: {formatDate(viewBooking.createdAt)}</span>
              <span>Updated: {formatDate(viewBooking.updatedAt)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {createOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCreateOpen(false)}
          title={editBooking ? `Edit Booking — ${editBooking.bookingRef}` : 'Create New Booking'}
          size="xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
              <Button variant="gold" onClick={handleSave} loading={saving}>
                {editBooking ? 'Save Changes' : 'Create Booking'}
              </Button>
            </>
          }
        >
          <form className="space-y-4 text-sm" onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer – only shown when creating */}
              {!editBooking && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                    Customer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.customerId}
                    onChange={e => setForm({ ...form, customerId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                    required
                  >
                    <option value="">— Select customer —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Package */}
              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Photography Package <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.packageId}
                  onChange={e => setForm({ ...form, packageId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                >
                  <option value="">— Select package —</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {formatLKR(p.price)}</option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Event Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.eventType}
                  onChange={e => setForm({ ...form, eventType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                >
                  <option value="">— Select type —</option>
                  {EVENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={e => setForm({ ...form, eventDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Venue */}
              <div className="sm:col-span-2">
                <Input
                  label="Venue / Location"
                  required
                  placeholder="e.g. Colombo Hilton, Grand Ballroom"
                  value={form.venue}
                  onChange={e => setForm({ ...form, venue: e.target.value })}
                />
              </div>

              {/* Add-ons */}
              {addOns.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-2">
                    Add-on Services
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-navy-200 rounded-lg">
                    {addOns.map(ao => (
                      <label key={ao.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-navy-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={form.addOnIds.includes(ao.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setForm({ ...form, addOnIds: [...form.addOnIds, ao.id] });
                            } else {
                              setForm({ ...form, addOnIds: form.addOnIds.filter(id => id !== ao.id) });
                            }
                          }}
                          className="accent-amber-500"
                        />
                        <span className="flex-1">{ao.name}</span>
                        <span className="text-navy-400">{formatLKR(ao.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                  Special Requests / Notes
                </label>
                <textarea
                  value={form.specialRequests}
                  onChange={e => setForm({ ...form, specialRequests: e.target.value })}
                  rows={3}
                  placeholder="Any special requirements or notes for this booking..."
                  className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Cancel Confirmation Modal ───────────────────────────────────────── */}
      {cancelTarget && (
        <Modal
          isOpen={true}
          onClose={() => setCancelTarget(null)}
          title="Cancel Booking"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={cancelling}>Keep Booking</Button>
              <Button variant="danger" onClick={handleCancel} loading={cancelling}>Confirm Cancel</Button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-navy-900">Cancel booking <span className="font-mono">{cancelTarget.bookingRef}</span>?</p>
                <p className="text-navy-600 mt-1">
                  The booking will be marked as <strong>CANCELLED</strong>. The customer will be notified.
                  This action can be audited but the record is kept in the system.
                </p>
              </div>
            </div>
            <div className="p-2 bg-navy-50 rounded-lg text-xs text-navy-500">
              Client: {cancelTarget.customerName} · Date: {formatDate(cancelTarget.eventDate)}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {deleteTarget && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          title="Delete Booking"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Keep Booking</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>Permanently Delete</Button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-navy-900">Permanently delete <span className="font-mono">{deleteTarget.bookingRef}</span>?</p>
                <p className="text-navy-600 mt-1">
                  This will permanently remove the booking and all associated data (assignments, unverified payments).
                  <strong className="text-rose-700"> This cannot be undone.</strong>
                </p>
                <p className="text-navy-500 mt-1 text-xs">
                  Note: Bookings with verified payments cannot be deleted — use Cancel instead.
                </p>
              </div>
            </div>
            <div className="p-2 bg-navy-50 rounded-lg text-xs text-navy-500">
              Client: {deleteTarget.customerName} · Date: {formatDate(deleteTarget.eventDate)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
