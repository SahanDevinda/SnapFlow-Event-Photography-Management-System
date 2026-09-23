import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { Settings, Save } from 'lucide-react';

export default function BrandingSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState({
    companyName: 'Lanka Moments (Pvt) Ltd',
    tagline: 'Capturing Timeless Sri Lankan Stories',
    advancePercentage: '30',
    contactEmail: 'hello@lankamoments.lk',
    contactPhone: '+94 11 234 5678',
    watermarkText: 'Lanka Moments © Proof Copy',
    address: 'No. 45, Horton Place, Colombo 07, Sri Lanka'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Backend stores one key/value pair per request.
      await Promise.all(
        Object.entries(settings).map(([settingKey, settingValue]) =>
          api.post('/settings', { settingKey, settingValue: String(settingValue ?? '') })
        )
      );
      toast.success('System settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">System & Branding Settings</h1>
        <p className="text-navy-600 text-sm">Configure global business variables, invoice details, and gallery watermarks.</p>
      </div>

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Company Legal Name"
            value={settings.companyName}
            onChange={e => setSettings({ ...settings, companyName: e.target.value })}
            required
          />

          <Input
            label="Tagline / Slogan"
            value={settings.tagline}
            onChange={e => setSettings({ ...settings, tagline: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              type="email"
              value={settings.contactEmail}
              onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
              required
            />
            <Input
              label="Contact Phone"
              value={settings.contactPhone}
              onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Advance Deposit Percentage (%)"
              type="number"
              min="10"
              max="100"
              value={settings.advancePercentage}
              onChange={e => setSettings({ ...settings, advancePercentage: e.target.value })}
              required
            />
            <Input
              label="Gallery Watermark Text"
              value={settings.watermarkText}
              onChange={e => setSettings({ ...settings, watermarkText: e.target.value })}
              required
            />
          </div>

          <Input
            label="Studio Address"
            value={settings.address}
            onChange={e => setSettings({ ...settings, address: e.target.value })}
          />

          <Button type="submit" variant="gold" loading={saving} icon={Save}>
            Save System Configurations
          </Button>
        </form>
      </Card>
    </div>
  );
}
