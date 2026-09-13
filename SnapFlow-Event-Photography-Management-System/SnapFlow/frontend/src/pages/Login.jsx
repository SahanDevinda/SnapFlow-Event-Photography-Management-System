import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath, getErrorMessage } from '../utils/helpers';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(getDashboardPath(user.role));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white via-brand-50/20 to-dark-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg mb-2">
            <Camera className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-dark-900 tracking-tight">SnapFlow Portal</h1>
          <p className="text-sm text-dark-500">Sign in to access your event photography dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5 border border-dark-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium animate-fadeIn">
              {error}
            </div>
          )}

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="email"
                className="input-field pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base shadow-md font-semibold">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="pt-2 text-center">
            <p className="text-sm text-dark-500">
              Need a new customer account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </form>

        <div className="rounded-xl bg-dark-900 text-dark-300 p-4 text-xs space-y-1.5 border border-dark-800 shadow-md">
          <div className="flex items-center gap-1.5 text-brand-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" /> Authenticated System Roles
          </div>
          <p className="text-dark-400">
            Support roles: <span className="text-white">COMPANY_DIRECTOR</span>, <span className="text-white">OPERATIONS_MANAGER</span>, <span className="text-white">CUSTOMER_RELATIONS_OFFICER</span>, <span className="text-white">FINANCE_EXECUTIVE</span>, <span className="text-white">PHOTOGRAPHER</span>, <span className="text-white">CUSTOMER</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
