import React, { useState } from 'react';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { Lock } from 'lucide-react';

export default function ChangePasswordPage() {
  const toast = useToast();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Change Password</h1>
        <p className="text-navy-600 text-sm">Update your account credentials to keep your profile secure.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={form.currentPassword}
            onChange={e => setForm({ ...form, currentPassword: e.target.value })}
          />

          <Input
            label="New Password"
            type="password"
            required
            helperText="Minimum 8 characters with at least one letter and number."
            value={form.newPassword}
            onChange={e => setForm({ ...form, newPassword: e.target.value })}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
          />

          <Button type="submit" variant="gold" loading={saving} icon={Lock}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
