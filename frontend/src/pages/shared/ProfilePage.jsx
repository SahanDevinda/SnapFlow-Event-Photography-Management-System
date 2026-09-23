import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { User, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/users/me', {
        fullName: formData.fullName,
        phone: formData.phone
      });
      if (res?.data) refreshUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">User Profile</h1>
        <p className="text-navy-600 text-sm">Manage your personal account details and contact information.</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-navy-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-navy-900 to-amber-500 text-white flex items-center justify-center font-bold text-2xl">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-900">{user?.fullName}</h2>
            <p className="text-xs text-navy-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 font-semibold text-[11px] rounded-full border border-amber-200">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            value={formData.email}
            disabled
            helperText="Email address cannot be changed directly."
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+94 77 123 4567"
          />

          <Input
            label="Avatar Image URL (Optional)"
            value={formData.avatarUrl}
            onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
            placeholder="https://..."
          />

          <Button type="submit" variant="gold" loading={saving}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
