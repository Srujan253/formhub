import React, { useState, useEffect } from 'react';
import { X, Mail, Plus, Trash2, Send, Check, AlertCircle, Users, ChevronDown, Sparkles, ClipboardPaste } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { emailGroupsAPI } from '../services/api';

const InviteModal = ({ isOpen, onClose, shareToken, formTitle, formDescription, formId, onSendInvites }) => {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showGroups, setShowGroups] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const publicUrl = `${window.location.origin}/s/${shareToken}`;

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // Load groups when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingGroups(true);
      emailGroupsAPI.getAll()
        .then(res => setGroups(res.data.data || []))
        .catch(() => setGroups([]))
        .finally(() => setLoadingGroups(false));
    }
  }, [isOpen]);

  const handleAddEmail = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Please enter an email address'); return; }
    if (!validateEmail(trimmed)) { setError('Please enter a valid email address'); return; }
    if (emails.includes(trimmed)) { setError('This email is already added'); return; }
    setEmails([...emails, trimmed]);
    setEmail('');
    setError('');
  };

  // Bulk paste handler — comma / newline / semicolon separated
  const handleBulkPaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    const parsed = pasted
      .split(/[\n,;]+/)
      .map(s => s.trim().toLowerCase())
      .filter(s => validateEmail(s) && !emails.includes(s));
    if (parsed.length > 0) {
      e.preventDefault();
      setEmails(prev => [...new Set([...prev, ...parsed])]);
      setEmail('');
      setError('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddEmail(); }
  };

  const handleRemoveEmail = (emailToRemove) => setEmails(emails.filter(e => e !== emailToRemove));

  // Load an email group into the current list
  const handleLoadGroup = (group) => {
    const newEmails = group.emails.filter(e => !emails.includes(e));
    setEmails(prev => [...prev, ...newEmails]);
    setShowGroups(false);
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) { setError('Please add at least one email'); return; }
    try {
      setSending(true);
      setError('');
      await onSendInvites({ emails, formTitle, formDescription: formDescription || '', shareToken, publicUrl, formId });
      setSent(true);
      setTimeout(() => { setSent(false); setEmails([]); onClose(); }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitations. Please check your Brevo API key.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setEmail(''); setEmails([]); setError(''); setSent(false); setShowGroups(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            onClick={e => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-100/80 shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100/80 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm shadow-primary-500/25">
                    <Mail size={14} className="text-white" />
                  </div>
                  Invite via Email
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{formTitle}</p>
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-500">
                <X size={16} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                    <Check size={28} className="text-white" />
                  </motion.div>
                  <p className="text-lg font-bold text-gray-900">Invitations Sent!</p>
                  <p className="text-sm text-gray-500 mt-1">{emails.length} email{emails.length !== 1 ? 's' : ''} invited successfully</p>
                </motion.div>
              ) : (
                <>
                  {/* Use a Group shortcut */}
                  {groups.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowGroups(!showGroups)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-primary-50/60 hover:bg-primary-50 border border-primary-100 rounded-xl text-sm font-semibold text-primary-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles size={14} />
                          Use a saved Email Group
                        </span>
                        <ChevronDown size={14} className={`transition-transform ${showGroups ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showGroups && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl z-10 overflow-hidden"
                          >
                            {loadingGroups ? (
                              <div className="p-4 text-center text-sm text-gray-400">Loading groups...</div>
                            ) : (
                              <div className="max-h-48 overflow-y-auto">
                                {groups.map(group => (
                                  <button key={group._id}
                                    onClick={() => handleLoadGroup(group)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary-50/50 transition-colors text-left border-b border-gray-50 last:border-0"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-gray-800">{group.name}</p>
                                      {group.description && <p className="text-xs text-gray-400">{group.description}</p>}
                                    </div>
                                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100 flex-shrink-0">
                                      {group.emails.length} emails
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                              <a href="/email-groups" target="_blank" className="text-xs text-primary-600 hover:underline font-medium">
                                Manage Groups →
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Email input */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      Add Emails <span className="normal-case font-normal text-gray-400">— paste multiple at once</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setError(''); }}
                          onKeyDown={handleKeyDown}
                          onPaste={handleBulkPaste}
                          placeholder="colleague@company.com"
                          className="form-input !pl-9 text-sm"
                          autoFocus
                        />
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleAddEmail}
                        className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-md shadow-primary-500/20">
                        <Plus size={18} />
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} /> {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email list */}
                  <AnimatePresence>
                    {emails.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Users size={12} /> Invitees ({emails.length})
                          </label>
                          {emails.length > 1 && (
                            <button onClick={() => setEmails([])} className="text-xs text-red-400 hover:text-red-500 font-medium">Clear all</button>
                          )}
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                          <AnimatePresence>
                            {emails.map((inviteEmail, index) => (
                              <motion.div key={inviteEmail}
                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.2, delay: index * 0.02 }}
                                className="flex items-center justify-between px-3 py-2 bg-primary-50/60 rounded-xl border border-primary-100/50 group/item"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-primary-700">{inviteEmail.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <span className="text-sm text-gray-700 truncate">{inviteEmail}</span>
                                </div>
                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                                  onClick={() => handleRemoveEmail(inviteEmail)}
                                  className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/item:opacity-100">
                                  <Trash2 size={12} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Send button */}
                  <motion.button
                    whileHover={{ scale: emails.length > 0 ? 1.01 : 1, y: emails.length > 0 ? -1 : 0 }}
                    whileTap={{ scale: emails.length > 0 ? 0.99 : 1 }}
                    onClick={handleSendInvites}
                    disabled={sending || emails.length === 0}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 shadow-lg ${
                      sending || emails.length === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-primary-500/25 hover:shadow-primary-500/40'
                    }`}
                  >
                    {sending ? (
                      <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={16} /> Send Invites{emails.length > 0 ? ` (${emails.length})` : ''}</>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteModal;
