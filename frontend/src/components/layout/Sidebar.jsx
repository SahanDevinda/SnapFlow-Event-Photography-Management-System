import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Camera,
  LayoutDashboard,
  Calendar,
  Layers,
  Users,
  CreditCard,
  Image,
  MessageSquare,
  Star,
  FileText,
  Settings,
  HelpCircle,
  Briefcase,
  Sliders,
  LogOut,
  Globe,
  PlusCircle,
  CheckSquare,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getNavLinks = (role) => {
    switch (role) {
      case 'CUSTOMER':
        return [
          { to: '/customer', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/customer/packages', label: 'Browse Packages', icon: Layers },
          { to: '/customer/book', label: 'Book Package', icon: PlusCircle },
          { to: '/customer/bookings', label: 'My Bookings', icon: Calendar },
          { to: '/customer/galleries', label: 'My Photos & Gallery', icon: Image },
          { to: '/customer/reviews', label: 'Event Reviews', icon: Star },
          { to: '/customer/feedback', label: 'Help & Inquiries', icon: HelpCircle }
        ];

      case 'CUSTOMER_RELATIONS_OFFICER':
        return [
          { to: '/cro', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/cro/customers', label: 'Customer Directory', icon: Users },
          { to: '/cro/bookings', label: 'All Bookings', icon: Calendar },
          { to: '/cro/new-booking', label: 'Create Booking', icon: PlusCircle },
          { to: '/cro/change-requests', label: 'Change Requests', icon: Sliders },
          { to: '/cro/packages', label: 'Package Catalogue', icon: Layers },
          { to: '/cro/feedback', label: 'Customer Feedback', icon: MessageSquare }
        ];

      case 'OPERATIONS_MANAGER':
        return [
          { to: '/operations', label: 'Operations Overview', icon: LayoutDashboard, end: true },
          { to: '/operations/calendar', label: 'Master Calendar', icon: Calendar },
          { to: '/operations/assignments', label: 'Photographer Assignments', icon: Briefcase },
          { to: '/operations/equipment', label: 'Equipment Inventory', icon: Wrench },
          { to: '/operations/change-requests', label: 'Change Requests', icon: Sliders },
          { to: '/operations/galleries', label: 'Gallery Preparation', icon: Image }
        ];

      case 'PHOTOGRAPHER':
        return [
          { to: '/photographer', label: 'My Schedule', icon: LayoutDashboard, end: true },
          { to: '/photographer/assignments', label: 'Assigned Events', icon: Calendar },
          { to: '/photographer/calendar', label: 'Master Calendar', icon: Calendar },
          { to: '/photographer/galleries', label: 'Photo Upload & Proofs', icon: Image },
          { to: '/photographer/coverage', label: 'Monthly Coverage', icon: Star }
        ];

      case 'FINANCE_EXECUTIVE':
        return [
          { to: '/finance', label: 'Finance Dashboard', icon: LayoutDashboard, end: true },
          { to: '/finance/payments', label: 'All Transactions', icon: CreditCard },
          { to: '/finance/pending', label: 'Verify Receipts', icon: CheckSquare },
          { to: '/finance/outstanding', label: 'Outstanding Balances', icon: Calendar },
          { to: '/finance/reports', label: 'CSV Reports', icon: FileText }
        ];

      case 'COMPANY_DIRECTOR':
        return [
          { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard, end: true },
          { to: '/admin/bookings', label: 'All Bookings', icon: Calendar },
          { to: '/admin/calendar', label: 'Master Calendar', icon: Calendar },
          { to: '/admin/packages', label: 'Package Management', icon: Layers },
          { to: '/admin/addons', label: 'Add-On Services', icon: PlusCircle },
          { to: '/admin/users', label: 'User & Role Directory', icon: Users },
          { to: '/admin/assignments', label: 'Resource Allocations', icon: Briefcase },
          { to: '/admin/equipment', label: 'Equipment Tracking', icon: Wrench },
          { to: '/admin/payments', label: 'Financial Audit', icon: CreditCard },
          { to: '/admin/change-requests', label: 'Change Requests', icon: Sliders },
          { to: '/admin/galleries', label: 'Gallery Oversight', icon: Image },
          { to: '/admin/feedback', label: 'Feedback & Inquiries', icon: MessageSquare },
          { to: '/admin/reports', label: 'Business Reports', icon: FileText },
          { to: '/admin/settings', label: 'System Branding', icon: Settings },
          { to: '/admin/activity-logs', label: 'Audit Activity Log', icon: FileText }
        ];

      default:
        return [];
    }
  };

  const navLinks = user ? getNavLinks(user.role) : [];

  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const roleLabels = {
    CUSTOMER: 'Client Account',
    CUSTOMER_RELATIONS_OFFICER: 'Customer Relations',
    OPERATIONS_MANAGER: 'Operations Manager',
    PHOTOGRAPHER: 'Lead Photographer',
    FINANCE_EXECUTIVE: 'Finance Executive',
    COMPANY_DIRECTOR: 'Company Director'
  };

  return (
    <aside className="w-64 bg-charcoal-950 text-gray-300 flex flex-col h-full border-r border-gray-800">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gold-500/20 flex items-center justify-center border border-gold-500/40">
            <Camera className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">SNAP<span className="text-gold-400">FLOW</span></span>
            <span className="text-[10px] text-gray-400 block -mt-1 tracking-wider uppercase">Lanka Moments</span>
          </div>
        </div>
      </div>

      {user && (
        <div className="px-5 py-3.5 bg-charcoal-900/70 border-b border-gray-800/80">
          <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
            {roleLabels[user.role] || user.role}
          </span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`
            }
          >
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <button
          onClick={() => {
            handleLinkClick();
            navigate('/');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-300 hover:text-gold-400 hover:bg-gray-800/80 rounded-lg transition"
        >
          <Globe className="w-4 h-4 text-gold-400" />
          <span>Public Website</span>
        </button>

        <button
          onClick={() => {
            handleLinkClick();
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
