import React, { useState, useEffect } from 'react';
import api, { listOf } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { Image, Edit2, Trash2, Eye, CheckCircle } from 'lucide-react';

const GALLERY_STATUSES = ['DRAFT', 'PROOF_READY', 'EDITING', 'FINAL_READY', 'PUBLISHED'];

export default function OpsGalleries() {
  const toast = useToast();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', status: '' });
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/galleries?page=0&size=100');
      setGalleries(listOf(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (g) => {
    setEditTarget(g);
    setEditForm({ title: g.title, status: g.status });
    setEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      toast.error('Gallery title is required.');
      return;
    }
    try {
      setSaving(true);
      await api.put(`/galleries/${editTarget.id}`, {
        title: editForm.title.trim(),
        status: editForm.status
      });
      toast.success('Gallery updated successfully.');
      setEditModal(false);
      fetchGalleries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update gallery.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (g) => {
    if (g.photoCount === 0) {
      toast.error('Cannot publish an empty gallery. Upload at least one photo first.');
      return;
    }
    try {
      await api.post(`/galleries/${g.id}/publish`);
      toast.success(`Gallery "${g.title}" published successfully!`);
      fetchGalleries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish gallery.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/galleries/${deleteTarget.id}`);
      toast.success(`Gallery "${deleteTarget.title}" has been deleted.`);
      setDeleteTarget(null);
      fetchGalleries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete gallery.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">Gallery Preparation</h1>
        <p className="text-navy-600 text-sm">Manage gallery statuses, publishing, and client delivery deadlines.</p>
      </div>

      <Card>
        {loading ? (
          <LoadingSkeleton count={4} className="h-14" />
        ) : galleries.length === 0 ? (
          <div className="py-12 text-center">
            <Image className="w-10 h-10 text-navy-300 mx-auto mb-3" />
            <p className="text-navy-400 text-sm">No galleries created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase text-xs">
                  <th className="py-3 px-4">Gallery</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {galleries.map(g => (
                  <tr key={g.id} className="hover:bg-navy-50/50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-navy-900">{g.title}</p>
                      <p className="text-[10px] font-mono text-navy-400">{g.accessCode}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-navy-600">{g.bookingRef || '—'}</td>
                    <td className="py-3 px-4 text-xs text-navy-600">{g.customerName || '—'}</td>
                    <td className="py-3 px-4 text-xs text-navy-600">{g.photoCount || 0}</td>
                    <td className="py-3 px-4"><Badge status={g.status} /></td>
                    <td className="py-3 px-4 text-xs text-navy-500">
                      {g.publishedAt ? formatDate(g.publishedAt) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Edit2}
                          onClick={() => openEdit(g)}
                          title="Edit gallery title and status"
                        >
                          Edit
                        </Button>
                        {g.status !== 'PUBLISHED' && (
                          <Button
                            variant="gold"
                            size="xs"
                            icon={CheckCircle}
                            onClick={() => handlePublish(g)}
                            title="Publish gallery to client"
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="xs"
                          icon={Trash2}
                          onClick={() => setDeleteTarget(g)}
                          title="Delete gallery permanently"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Gallery Modal */}
      {editModal && editTarget && (
        <Modal
          isOpen={true}
          onClose={() => setEditModal(false)}
          title={`Edit Gallery — ${editTarget.title}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
              <Button variant="gold" onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
            </>
          }
        >
          <form className="space-y-4 text-sm">
            <Input
              label="Gallery Title"
              required
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-navy-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {GALLERY_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-navy-400">
              Access Code: <span className="font-mono font-bold">{editTarget.accessCode}</span>
            </p>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          title="Delete Gallery"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete Permanently</Button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <p className="text-navy-700">
              Are you sure you want to permanently delete gallery{' '}
              <span className="font-bold">"{deleteTarget.title}"</span>?
            </p>
            <p className="text-red-600 font-semibold">
              ⚠ This will delete all {deleteTarget.photoCount || 0} photos and cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
