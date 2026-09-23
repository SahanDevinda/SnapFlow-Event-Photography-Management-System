import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useToast } from '../../context/ToastContext';

export const ContactPage = () => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'INQUIRY',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/feedback', formData);
      if (res.success) {
        showSuccess('Thank you! Your message has been sent to our Customer Relations team.');
        setFormData({ name: '', email: '', type: 'INQUIRY', subject: '', message: '' });
      }
    } catch (err) {
      showError(err.message || 'Failed to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />

      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900">Contact & Customer Support</h1>
        <p className="mt-2 text-sm text-gray-500">
          Have an inquiry, booking request, or need assistance? Reach out to Lanka Moments (Pvt) Ltd.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Headquarters</h4>
                <p className="text-xs text-gray-500 mt-1">124 Galle Road, Colombo 03, Sri Lanka</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gold-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Telephone</h4>
                <p className="text-xs text-gray-500 mt-1">+94 11 234 5678</p>
                <p className="text-xs text-gray-400">Mon - Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gold-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Email</h4>
                <p className="text-xs text-gray-500 mt-1">info@lankamoments.lk</p>
                <p className="text-xs text-gray-400">Support response within 24 hours</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Send Us a Message">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message Type
                  </label>
                  <select
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="INQUIRY">General Inquiry</option>
                    <option value="SUGGESTION">Suggestion / Feature Request</option>
                    <option value="COMPLAINT">Service Complaint</option>
                  </select>
                </div>
                <Input
                  label="Subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type="submit" variant="primary" loading={loading} icon={Send}>
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
