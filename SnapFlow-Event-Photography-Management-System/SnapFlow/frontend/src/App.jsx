import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import PublicGallery from './pages/PublicGallery';
import Login from './pages/Login';
import Register from './pages/Register';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateBooking from './pages/customer/CreateBooking';
import MyBookings from './pages/customer/MyBookings';
import BookingDetails from './pages/customer/BookingDetails';

import CroDashboard from './pages/cro/CroDashboard';
import ChangeRequests from './pages/cro/ChangeRequests';
import Customers from './pages/cro/Customers';

import OpsDashboard from './pages/ops/OpsDashboard';
import Assignments from './pages/ops/Assignments';
import Calendar from './pages/ops/Calendar';
import EquipmentManagement from './pages/ops/EquipmentManagement';

import PhotographerDashboard from './pages/photographer/PhotographerDashboard';
import MyAssignments from './pages/photographer/MyAssignments';

import FinanceDashboard from './pages/finance/FinanceDashboard';
import PendingPayments from './pages/finance/PendingPayments';
import AllPayments from './pages/finance/AllPayments';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePackages from './pages/admin/ManagePackages';
import ManageAddOns from './pages/admin/ManageAddOns';
import AdminBookings from './pages/admin/AdminBookings';
import UserManagement from './pages/admin/UserManagement';
import ActivityLogs from './pages/admin/ActivityLogs';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:id" element={<PackageDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<PublicGallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Shared Authenticated Routes */}
      <Route element={<ProtectedRoute roles={['CUSTOMER', 'CUSTOMER_RELATIONS_OFFICER', 'OPERATIONS_MANAGER', 'PHOTOGRAPHER', 'FINANCE_EXECUTIVE', 'COMPANY_DIRECTOR']}><Layout /></ProtectedRoute>}>
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Customer Routes */}
      <Route element={<ProtectedRoute roles={['CUSTOMER']}><Layout /></ProtectedRoute>}>
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/book" element={<CreateBooking />} />
        <Route path="/customer/bookings" element={<MyBookings />} />
        <Route path="/customer/bookings/:id" element={<BookingDetails />} />
      </Route>

      {/* Customer Relations Officer Routes */}
      <Route element={<ProtectedRoute roles={['CUSTOMER_RELATIONS_OFFICER']}><Layout /></ProtectedRoute>}>
        <Route path="/cro" element={<CroDashboard />} />
        <Route path="/cro/customers" element={<Customers />} />
        <Route path="/cro/bookings" element={<AdminBookings />} />
        <Route path="/cro/change-requests" element={<ChangeRequests />} />
      </Route>

      {/* Operations Manager Routes */}
      <Route element={<ProtectedRoute roles={['OPERATIONS_MANAGER']}><Layout /></ProtectedRoute>}>
        <Route path="/ops" element={<OpsDashboard />} />
        <Route path="/ops/calendar" element={<Calendar />} />
        <Route path="/ops/assignments" element={<Assignments />} />
        <Route path="/ops/equipment" element={<EquipmentManagement />} />
        <Route path="/ops/change-requests" element={<ChangeRequests />} />
      </Route>

      {/* Photographer Routes */}
      <Route element={<ProtectedRoute roles={['PHOTOGRAPHER']}><Layout /></ProtectedRoute>}>
        <Route path="/photographer" element={<PhotographerDashboard />} />
        <Route path="/photographer/assignments" element={<MyAssignments />} />
      </Route>

      {/* Finance Executive Routes */}
      <Route element={<ProtectedRoute roles={['FINANCE_EXECUTIVE']}><Layout /></ProtectedRoute>}>
        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/finance/payments" element={<AllPayments />} />
        <Route path="/finance/pending" element={<PendingPayments />} />
      </Route>

      {/* Admin / Company Director Routes */}
      <Route element={<ProtectedRoute roles={['COMPANY_DIRECTOR']}><Layout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/packages" element={<ManagePackages />} />
        <Route path="/admin/add-ons" element={<ManageAddOns />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/payments" element={<AllPayments />} />
        <Route path="/admin/change-requests" element={<ChangeRequests />} />
        <Route path="/admin/activity-logs" element={<ActivityLogs />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
