import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera, LogIn, Lock, Mail, Eye, EyeOff,
  Users, Briefcase, AlertTriangle, ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Roles that belong to the Customer portal
const CUSTOMER_ROLES = ['CUSTOMER'];
// Roles that belong to the Staff/Admin portal
const STAFF_ROLES = [
  'COMPANY_DIRECTOR',
  'OPERATIONS_MANAGER',
  'PHOTOGRAPHER',
  'CUSTOMER_RELATIONS_OFFICER',
  'FINANCE_EXECUTIVE',
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, getDashboardPath } = useAuth();
  const toast = useToast();

  // 'customer' | 'staff'
  const [portal, setPortal] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portalError, setPortalError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
    if (searchParams.get('expired') === 'true') {
      toast.info('Your session has expired. Please log in again.');
    }
  }, [user, navigate, searchParams, getDashboardPath, toast]);

  // Clear portal error whenever portal or email changes
  useEffect(() => {
    setPortalError('');
  }, [portal, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPortalError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.success && res.data) {
        const { role } = res.data;

        // ── Portal mismatch guard ──────────────────────────────
        if (portal === 'customer' && STAFF_ROLES.includes(role)) {
          setPortalError(
            'This account requires the Staff & Admin Portal. Please switch portals above.'
          );
          setLoading(false);
          return;
        }
        if (portal === 'staff' && CUSTOMER_ROLES.includes(role)) {
          setPortalError(
            'This is a Customer account. Please use the Customer Portal to sign in.'
          );
          setLoading(false);
          return;
        }

        login(res.data);
        toast.success(`Welcome back, ${res.data.fullName}!`);
        navigate(getDashboardPath(role), { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill helpers (demo only)
  const fillDemo = (demoEmail, demoPass, targetPortal = 'customer') => {
    setPortal(targetPortal);
    setEmail(demoEmail);
    setPassword(demoPass);
    setPortalError('');
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gold-500/20 flex items-center justify-center border border-gold-500/40">
              <Camera className="w-6 h-6 text-gold-400" />
            </div>
            <div className="text-left">
              <span className="font-bold text-xl tracking-tight text-white">
                SNAP<span className="text-gold-400">FLOW</span>
              </span>
              <span className="text-[10px] text-gray-500 block -mt-1 tracking-wider uppercase">
                Lanka Moments
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-charcoal-900/80 backdrop-blur-md border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">
          {/* Portal Switcher */}
          <div className="flex border-b border-gray-700/60">
            <button
              type="button"
              onClick={() => setPortal('customer')}
              className={`
                flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold
                transition-colors duration-200
                ${portal === 'customer'
                  ? 'bg-gold-500/10 text-gold-400 border-b-2 border-gold-500'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }
              `}
            >
              <Users className="w-4 h-4 shrink-0" />
              Customer Portal
            </button>
            <button
              type="button"
              onClick={() => setPortal('staff')}
              className={`
                flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold
                transition-colors duration-200
                ${portal === 'staff'
                  ? 'bg-gold-500/10 text-gold-400 border-b-2 border-gold-500'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }
              `}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              Staff &amp; Admin
            </button>
          </div>

          {/* Form body */}
          <div className="p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                {portal === 'customer' ? 'Customer Sign In' : 'Staff & Admin Sign In'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {portal === 'customer'
                  ? 'Access your bookings, galleries, and account.'
                  : 'For Operations, Photography, Finance, and Director accounts.'}
              </p>
            </div>

            {/* Portal mismatch error banner */}
            {portalError && (
              <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-amber-900/30 border border-amber-500/30 text-amber-300 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{portalError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={portal === 'customer' ? 'you@email.com' : 'staff@company.com'}
                    className="
                      w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                      bg-charcoal-950/60 border border-gray-700
                      text-white placeholder-gray-600
                      focus:outline-none focus:ring-2 focus:ring-gold-500/60 focus:border-gold-500/60
                      transition-colors
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      w-full pl-10 pr-12 py-2.5 rounded-xl text-sm
                      bg-charcoal-950/60 border border-gray-700
                      text-white placeholder-gray-600
                      focus:outline-none focus:ring-2 focus:ring-gold-500/60 focus:border-gold-500/60
                      transition-colors
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full flex items-center justify-center gap-2.5
                  py-3 rounded-xl
                  bg-gold-500 text-charcoal-950
                  text-sm font-bold tracking-wide
                  hover:bg-gold-400 active:bg-gold-600
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-charcoal-900
                "
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 shrink-0" />
                )}
                {loading ? 'Signing in…' : 'Sign In to SnapFlow'}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-6 text-center text-xs text-gray-500">
              {portal === 'customer' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-gold-500 hover:text-gold-400 inline-flex items-center gap-0.5"
                  >
                    Register as Customer <ArrowRight className="w-3 h-3" />
                  </Link>
                </>
              ) : (
                <span className="text-gray-600">
                  Staff accounts are created by the Company Director.
                </span>
              )}
            </div>
          </div>

          {/* ── Demo credentials helper ── */}
          <div className="border-t border-gray-700/60 bg-charcoal-950/40 px-7 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Customer demos */}
              <button
                type="button"
                onClick={() => fillDemo('afrith@gmail.com', 'afrith@2005', 'customer')}
                className="text-[10px] text-left px-2 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gold-500/10 hover:text-gold-400 text-gray-400 transition"
              >
                Customer
              </button>
              {/* Staff demos */}
              <button
                type="button"
                onClick={() => fillDemo('thisara@gmail.com', 'thisara@2005', 'staff')}
                className="text-[10px] text-left px-2 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gold-500/10 hover:text-gold-400 text-gray-400 transition"
              >
                Director
              </button>
              <button
                type="button"
                onClick={() => fillDemo('nadun@gmail.com', 'nadun@2006', 'staff')}
                className="text-[10px] text-left px-2 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gold-500/10 hover:text-gold-400 text-gray-400 transition"
              >
                Ops Mgr
              </button>
              <button
                type="button"
                onClick={() => fillDemo('sahan@gmail.com', 'sahan@2004', 'staff')}
                className="text-[10px] text-left px-2 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gold-500/10 hover:text-gold-400 text-gray-400 transition"
              >
                CRO
              </button>
              <button
                type="button"
                onClick={() => fillDemo('nethuli@gmail.com', 'nethuli@2005', 'staff')}
                className="text-[10px] text-left px-2 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gold-500/10 hover:text-gold-400 text-gray-400 transition"
              >
                Photographer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('finance@gmail.com', 'finance@2005', 'staff')}
                className="text-[10px] text-left px-2 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gold-500/10 hover:text-gold-400 text-gray-400 transition"
              >
                Finance
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-700 mt-6">
          © {new Date().getFullYear()} Lanka Moments Pvt Ltd · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
