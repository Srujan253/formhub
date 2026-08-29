import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Trash2, Edit3, X, Check, ArrowLeft,
  Mail, ChevronDown, ChevronUp, Save, AlertCircle, Sparkles
} from 'lucide-react';
import { emailGroupsAPI } from '../services/api';
import { EmailGroupsSkeleton } from '../components/Skeleton';
import Toast from '../components/Toast';

// ── Group Form Modal ────────────────────────────────────────────────────────
const GroupModal = ({ group, onClose, onSave }) => {
  const isEditing = !!group?._id;
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState(group?.emails || []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleAddEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!validate(trimmed)) { setError('Invalid email address'); return; }
    if (emails.includes(trimmed)) { setError('Already added'); return; }
    setEmails([...emails, trimmed]);
    setEmailInput('');
    setError('');
  };

  // Bulk paste: comma / newline separated
  const handleBulkPaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    const parsed = pasted
      .split(/[\n,;]+/)
      .map(s => s.trim().toLowerCase())
      .filter(s => validate(s) && !emails.includes(s));
    if (parsed.length > 0) {
      e.preventDefault();
      setEmails(prev => [...new Set([...prev, ...parsed])]);
      setEmailInput('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Group name is required'); return; }
    if (emails.length === 0) { setError('Add at least one email'); return; }
    try {
      setSaving(true);
      const payload = { name: name.trim(), description: description.trim(), emails };
      if (isEditing) {
        const res = await emailGroupsAPI.update(group._id, payload);
        onSave(res.data.data, 'updated');
      } else {
        const res = await emailGroupsAPI.create(payload);
        onSave(res.data.data, 'created');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save group');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        onClick={e => e.stopPropagation()}
        className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Edit Group' : 'New Email Group'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Save a list of emails for quick sending</p>
          </div>
          <motion.button whileHover={{ rotate: 90 }} onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500">
            <X size={16} />
          </motion.button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="form-label">Group Name *</label>
            <input className="form-input" placeholder="e.g. Marketing Team, Class 10A" value={name} onChange={e => { setName(e.target.value); setError(''); }} />
          </div>
          {/* Description */}
          <div>
            <label className="form-label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <input className="form-input" placeholder="Short note about this group" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          {/* Email input with bulk paste */}
          <div>
            <label className="form-label">Email Addresses * <span className="text-xs font-normal text-gray-400">— paste multiple, comma separated</span></label>
            <div className="flex gap-2">
              <input
                className="form-input flex-1 text-sm"
                placeholder="Paste emails or type one..."
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setError(''); }}
                onPaste={handleBulkPaste}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEmail(); } }}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleAddEmail}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold">
                <Plus size={18} />
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email chips */}
          {emails.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                <Users size={12} /> {emails.length} email{emails.length !== 1 ? 's' : ''}
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50/60 rounded-2xl border border-gray-100">
                <AnimatePresence>
                  {emails.map((em, i) => (
                    <motion.span key={em}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full text-xs font-medium"
                    >
                      {em}
                      <button onClick={() => setEmails(emails.filter(e => e !== em))}
                        className="hover:text-red-500 transition-colors">
                        <X size={10} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : isEditing ? 'Update Group' : 'Create Group'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────
const EmailGroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalGroup, setModalGroup] = useState(null); // null=closed, {}=new, group=edit
  const [toast, setToast] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await emailGroupsAPI.getAll();
      setGroups(res.data.data || []);
    } catch (err) {
      showToast('Failed to load groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (group, action) => {
    if (action === 'created') {
      setGroups(prev => [group, ...prev]);
      showToast(`"${group.name}" created ✨`);
    } else {
      setGroups(prev => prev.map(g => g._id === group._id ? group : g));
      showToast(`"${group.name}" updated`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this email group? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await emailGroupsAPI.delete(id);
      setGroups(prev => prev.filter(g => g._id !== id));
      showToast('Group deleted');
    } catch (err) {
      showToast('Failed to delete group', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <EmailGroupsSkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8">

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <motion.button whileHover={{ x: -2 }} onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
          <ArrowLeft size={16} /> Back
        </motion.button>
      </div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-primary-500" />
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Shortcuts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Email Groups</h1>
          <p className="text-gray-500 mt-1 text-sm">Save groups of emails once, load them instantly when sending surveys.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setModalGroup({})}
          className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Group
        </motion.button>
      </div>

      {/* Groups list */}
      {groups.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-20 max-w-md mx-auto">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Users size={28} className="text-primary-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first email group to quickly load recipients when sending surveys.</p>
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => setModalGroup({})} className="btn-primary">
            Create First Group
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {groups.map((group, index) => {
              const isExpanded = expandedId === group._id;
              return (
                <motion.div key={group._id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{ delay: index * 0.04 }}
                  className="card card-hover p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{group.name}</h3>
                        <span className="flex-shrink-0 px-2.5 py-0.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-full text-xs font-semibold">
                          {group.emails.length} email{group.emails.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-500 mb-3">{group.description}</p>
                      )}
                      {/* Email preview chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {group.emails.slice(0, isExpanded ? group.emails.length : 5).map(em => (
                          <span key={em} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{em}</span>
                        ))}
                        {!isExpanded && group.emails.length > 5 && (
                          <button onClick={() => setExpandedId(group._id)}
                            className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs hover:bg-gray-200 transition-colors">
                            +{group.emails.length - 5} more
                          </button>
                        )}
                        {isExpanded && (
                          <button onClick={() => setExpandedId(null)}
                            className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs hover:bg-gray-200 transition-colors flex items-center gap-1">
                            <ChevronUp size={10} /> Show less
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setModalGroup(group)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                        <Edit3 size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(group._id)}
                        disabled={deletingId === group._id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        {deletingId === group._id
                          ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          : <Trash2 size={16} />}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalGroup !== null && (
          <GroupModal
            group={modalGroup?._id ? modalGroup : null}
            onClose={() => setModalGroup(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmailGroupsPage;
