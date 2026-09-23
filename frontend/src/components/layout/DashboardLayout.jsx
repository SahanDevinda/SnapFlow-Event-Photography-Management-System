import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const DashboardLayout = ({ allowedRoles = [] }) => {
  const { user, loading, getDashboardPath } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Shared pages live under each role portal (e.g. /customer/profile, /admin/profile).
  const portalBase = getDashboardPath(user.role);

  return (
    <div className="min-h-screen flex bg-[#F9F9FB]">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <Sidebar />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-charcoal-950">
            <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
          </div>
        </div>
      )}

      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-gray-700 hidden sm:block">
              Lanka Moments &bull; Photography Management System
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`${portalBase}/notifications`}
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to={`${portalBase}/profile`}
              className="flex items-center gap-2 p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="My Profile"
            >
              <div className="w-7 h-7 rounded-full bg-charcoal-900 text-gold-400 flex items-center justify-center text-xs font-bold">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-medium hidden lg:inline">{user.fullName}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
