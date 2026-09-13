import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Camera, LayoutDashboard, Calendar, Users, CreditCard, Image as ImageIcon,
  Package, Bell, LogOut, Menu, X, ClipboardList, Settings, Home, PlusCircle, User, Activity, Tag, Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationApi } from '../services/api';

const navByRole = {
  CUSTOMER: [
    { to: '/customer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/bookings', label: 'My Bookings', icon: ClipboardList },
    { to: '/customer/book', label: 'New Booking', icon: PlusCircle },
    { to: '/packages', label: 'Packages', icon: Package },
    { to: '/gallery', label: 'Client Gallery', icon: ImageIcon },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  CUSTOMER_RELATIONS_OFFICER: [
    { to: '/cro', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cro/customers', label: 'Customers', icon: Users },
    { to: '/cro/bookings', label: 'Bookings', icon: ClipboardList },
    { to: '/cro/change-requests', label: 'Change Requests', icon: Settings },
    { to: '/packages', label: 'Packages', icon: Package },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  OPERATIONS_MANAGER: [
    { to: '/ops', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ops/calendar', label: 'Master Calendar', icon: Calendar },
    { to: '/ops/assignments', label: 'Assignments', icon: Users },
    { to: '/ops/equipment', label: 'Equipment', icon: Camera },
    { to: '/ops/change-requests', label: 'Change Requests', icon: Settings },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  PHOTOGRAPHER: [
    { to: '/photographer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/photographer/assignments', label: 'My Assignments', icon: ClipboardList },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  FINANCE_EXECUTIVE: [
    { to: '/finance', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/finance/payments', label: 'All Payments', icon: CreditCard },
    { to: '/finance/pending', label: 'Verify Receipts', icon: ClipboardList },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  COMPANY_DIRECTOR: [
    { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/admin/bookings', label: 'Bookings Management', icon: ClipboardList },
    { to: '/admin/packages', label: 'Package Management', icon: Package },
    { to: '/admin/add-ons', label: 'Add-on Management', icon: Tag },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/payments', label: 'Financial Records', icon: CreditCard },
    { to: '/admin/change-requests', label: 'Change Requests', icon: Settings },
    { to: '/ops/equipment', label: 'Equipment Inventory', icon: Camera },
    { to: '/admin/activity-logs', label: 'Activity Audit Log', icon: Activity },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const links = navByRole[user?.role] || [];

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await notificationApi.getUnreadCount();
        if (data?.data?.count != null) {
          setUnreadCount(data.data.count);
        }
      } catch (err) {
        // Silent catch if user is logged out or session expired
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-950 text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto flex flex-col border-r border-dark-800
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-dark-800/80">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-dark-950 shadow-md">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white block leading-none">SnapFlow</span>
            <span className="text-[10px] uppercase font-semibold text-brand-400 tracking-wider">Event Management</span>
          </div>
          <button className="ml-auto lg:hidden text-dark-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Badge Header */}
        <div className="px-4 py-3 bg-dark-900/60 border-b border-dark-800/50 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span className="text-xs font-semibold text-dark-300 truncate">
            {user?.role?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length <= 2 && to !== '/admin/bookings' && to !== '/admin/packages'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all
                ${isActive
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm font-semibold'
                  : 'text-dark-300 hover:bg-dark-900 hover:text-white'}`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 h-4 shrink-0" />
                <span>{label}</span>
              </div>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-brand-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-dark-800 p-4 bg-dark-900/40">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-300 text-sm">
              {user?.firstName ? user.firstName[0] : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-dark-300 bg-dark-900 border border-dark-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-dark-200/80 bg-white/90 backdrop-blur-md px-4 lg:px-8 shadow-xs">
          <button className="lg:hidden p-2 text-dark-600 hover:bg-dark-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-medium text-dark-400 uppercase tracking-wider hidden sm:inline-block">
              SnapFlow Studio Engine
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              className="relative p-2 text-dark-500 hover:text-brand-600 hover:bg-dark-50 rounded-lg transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />
              )}
            </Link>
            <div className="h-4 w-px bg-dark-200" />
            <Link to="/" className="text-xs font-medium text-dark-600 hover:text-brand-600 flex items-center gap-1.5 bg-dark-50 border border-dark-200/80 px-3 py-1.5 rounded-lg transition">
              <Home className="h-3.5 w-3.5" /> Website
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
