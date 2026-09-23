import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Menu, X, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-charcoal-950 text-white border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gold-500/20 flex items-center justify-center border border-gold-500/40">
              <Camera className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">SNAP<span className="text-gold-400">FLOW</span></span>
              <span className="text-[10px] text-gray-400 block -mt-1 tracking-wider uppercase">Lanka Moments</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link to="/" className="text-gray-300 hover:text-gold-400 transition">Home</Link>
            <Link to="/packages" className="text-gray-300 hover:text-gold-400 transition">Packages</Link>
            <Link to="/availability" className="text-gray-300 hover:text-gold-400 transition">Live Availability</Link>
            <Link to="/gallery-access" className="text-gray-300 hover:text-gold-400 transition">Client Portal</Link>
            <Link to="/about" className="text-gray-300 hover:text-gold-400 transition">About</Link>
            <Link to="/contact" className="text-gray-300 hover:text-gold-400 transition">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button
                variant="primary"
                size="sm"
                icon={LayoutDashboard}
                onClick={() => navigate(getDashboardPath(user.role))}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-charcoal-900 px-4 pt-2 pb-6 space-y-3">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-gold-400">Home</Link>
          <Link to="/packages" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-gold-400">Packages</Link>
          <Link to="/availability" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-gold-400">Live Availability</Link>
          <Link to="/gallery-access" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-gold-400">Client Portal</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-gold-400">About</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-gold-400">Contact</Link>

          <div className="pt-4 border-t border-gray-800 space-y-2">
            {user ? (
              <Button
                variant="primary"
                className="w-full justify-center"
                icon={LayoutDashboard}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(getDashboardPath(user.role));
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" className="w-full justify-center" onClick={() => { setMobileOpen(false); navigate('/login'); }}>
                  Log In
                </Button>
                <Button variant="primary" className="w-full justify-center" onClick={() => { setMobileOpen(false); navigate('/register'); }}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
