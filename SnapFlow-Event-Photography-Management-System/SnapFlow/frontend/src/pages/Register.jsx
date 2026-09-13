import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath, getErrorMessage } from '../utils/helpers';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
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
          <h1 className="font-display text-3xl font-bold text-dark-900 tracking-tight">Create Customer Account</h1>
          <p className="text-sm text-dark-500">Book and track your event photography services with Lanka Moments</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-4 border border-dark-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium animate-fadeIn">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input name="firstName" className="input-field pl-9" value={form.firstName} onChange={handleChange} required placeholder="John" />
              </div>
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input name="lastName" className="input-field" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="label">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input type="email" name="email" className="input-field pl-10" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input name="phone" className="input-field pl-10" value={form.phone} onChange={handleChange} placeholder="+94 77 123 4567" />
            </div>
          </div>

          <div>
            <label className="label">Password (Min 8 characters) *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input type="password" name="password" className="input-field pl-10" value={form.password} onChange={handleChange} minLength={8} required placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base shadow-md font-semibold mt-2">
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>

          <p className="text-center text-sm text-dark-500 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
