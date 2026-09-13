import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Camera, Menu, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/helpers';

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-dark-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-600 text-white shadow-sm">
              <Camera className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-dark-900">SnapFlow</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
              Lanka Moments
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-dark-600">
            <Link to="/" className="hover:text-brand-600 transition">Home</Link>
            <Link to="/packages" className="hover:text-brand-600 transition">Packages</Link>
            <Link to="/gallery" className="hover:text-brand-600 transition flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-brand-500" />
              Client Gallery
            </Link>
            <Link to="/about" className="hover:text-brand-600 transition">About</Link>
            <Link to="/contact" className="hover:text-brand-600 transition">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button onClick={() => navigate(getDashboardPath(user.role))} className="btn-primary">
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Sign in</Link>
                <Link to="/register" className="btn-primary">Book an Event</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-dark-600 p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-dark-100 bg-white px-4 py-4 space-y-3 shadow-lg">
            <Link to="/" className="block text-sm font-medium text-dark-700 hover:text-brand-600" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/packages" className="block text-sm font-medium text-dark-700 hover:text-brand-600" onClick={() => setOpen(false)}>Packages</Link>
            <Link to="/gallery" className="block text-sm font-medium text-dark-700 hover:text-brand-600" onClick={() => setOpen(false)}>Client Gallery</Link>
            <Link to="/about" className="block text-sm font-medium text-dark-700 hover:text-brand-600" onClick={() => setOpen(false)}>About</Link>
            <Link to="/contact" className="block text-sm font-medium text-dark-700 hover:text-brand-600" onClick={() => setOpen(false)}>Contact</Link>
            <div className="pt-3 border-t border-dark-100 flex gap-2">
              {isAuthenticated ? (
                <button onClick={() => { navigate(getDashboardPath(user.role)); setOpen(false); }} className="btn-primary w-full">Dashboard</button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1 text-center" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center" onClick={() => setOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-dark-800 bg-dark-950 text-dark-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-white mb-3">
                <div className="p-1 rounded bg-brand-600 text-white">
                  <Camera className="h-5 w-5" />
                </div>
                <span className="font-display text-lg font-bold">SnapFlow</span>
              </div>
              <p className="text-sm text-dark-400 leading-relaxed max-w-sm">
                Premium Event Photography & Management System for Lanka Moments (Pvt) Ltd. Capturing corporate galas, weddings, and high-profile events across Sri Lanka.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/packages" className="text-dark-400 hover:text-white transition">Photography Packages</Link></li>
                <li><Link to="/gallery" className="text-dark-400 hover:text-white transition">Client Photo Portal</Link></li>
                <li><Link to="/about" className="text-dark-400 hover:text-white transition">About Our Studio</Link></li>
                <li><Link to="/contact" className="text-dark-400 hover:text-white transition">Get in Touch</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Contact Information</h4>
              <div className="space-y-2 text-sm text-dark-400">
                <p>124 Galle Road, Colombo 03, Sri Lanka</p>
                <p>info@lankamoments.lk</p>
                <p>+94 11 234 5678</p>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-dark-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-dark-500 gap-4">
            <p>© {new Date().getFullYear()} Lanka Moments (Pvt) Ltd. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Privacy Policy</span> · <span>Terms of Service</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
