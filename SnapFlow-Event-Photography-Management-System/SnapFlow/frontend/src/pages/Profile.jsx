import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await userApi.updateProfile(form);
      const updated = data.data;
      // Update stored user
      const stored = JSON.parse(localStorage.getItem('snapflow_user') || '{}');
      const newStored = { ...stored, firstName: updated.firstName, lastName: updated.lastName };
      localStorage.setItem('snapflow_user', JSON.stringify(newStored));
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark-900">Account Profile</h1>
        <p className="text-dark-500 text-sm mt-1">Manage your contact information and personal account preferences</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <div className="card space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-50 border border-dark-100">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-xl flex items-center justify-center shadow">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-dark-900 text-lg">{user?.firstName} {user?.lastName}</h3>
            <p className="text-xs text-dark-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 mt-1">
              <Shield className="w-3 h-3" /> {user?.role?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Email Address (Read-only)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input-field pl-10 bg-dark-50 text-dark-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+94 77 123 4567"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-dark-100">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
