import React, { useState } from 'react';
import { X, Mail, Plus, Trash2, Send, Check, AlertCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InviteModal = ({ isOpen, onClose, shareToken, formTitle, formDescription, formId, onSendInvites }) => {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const publicUrl = `${window.location.origin}/s/${shareToken}`;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = () => {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    if (emails.includes(trimmed)) {
      setError('This email is already added');
      return;
    }

    setEmails([...emails, trimmed]);
    setEmail('');
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) {
      setError('Please add at least one email');
      return;
    }

    try {
      setSending(true);
      setError('');

      await onSendInvites({
        emails,
        formTitle,
        formDescription: formDescription || '',
        shareToken,
        publicUrl,
        formId,
      });

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setEmails([]);
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitations. Please check your Brevo API key.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmails([]);
    setError('');
    setSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-100/80 shadow-lumina-xl
                       w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100/80 flex justify-between items-start">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm shadow-primary-500/25">
                    <Mail size={14} className="text-white" />
                  </div>
                  Invite via Email
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{formTitle}</p>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100/80 hover:bg-gray-200/80
                           transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Success state */}
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30"
                  >
                    <Check size={28} className="text-white" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-lg font-bold text-gray-900"
                  >
                    Invitations Sent!
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-sm text-gray-500 mt-1"
                  >
                    {emails.length} email{emails.length !== 1 ? 's' : ''} invited successfully
                  </motion.p>
                </motion.div>
              ) : (
                <>
                  {/* Email input */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      Add Email Addresses
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          onKeyDown={handleKeyDown}
                          placeholder="colleague@company.com"
                          className="form-input !pl-9 text-sm"
                          autoFocus
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddEmail}
                        className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl
                                   shadow-md shadow-primary-500/20 hover:shadow-lg transition-all duration-300"
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle size={12} />
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Email list */}
                  <AnimatePresence>
                    {emails.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Users size={12} />
                            Invitees ({emails.length})
                          </label>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                          <AnimatePresence>
                            {emails.map((inviteEmail, index) => (
                              <motion.div
                                key={inviteEmail}
                                initial={{ opacity: 0, x: -12, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: 12, height: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                className="flex items-center justify-between px-3 py-2 bg-primary-50/60 rounded-xl
                                           border border-primary-100/50 group/item"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.05 }}
                                    className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0"
                                  >
                                    <span className="text-[10px] font-bold text-primary-700">
                                      {inviteEmail.charAt(0).toUpperCase()}
                                    </span>
                                  </motion.div>
                                  <span className="text-sm text-gray-700 truncate">{inviteEmail}</span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.85 }}
                                  onClick={() => handleRemoveEmail(inviteEmail)}
                                  className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400
                                             hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover/item:opacity-100"
                                >
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: emails.length > 0 ? 1.01 : 1, y: emails.length > 0 ? -1 : 0 }}
                    whileTap={{ scale: emails.length > 0 ? 0.99 : 1 }}
                    onClick={handleSendInvites}
                    disabled={sending || emails.length === 0}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm
                      transition-all duration-300 shadow-lg ${
                      sending || emails.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-primary-500/25 hover:shadow-primary-500/40'
                    }`}
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        Sending invitations...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Invites{emails.length > 0 ? ` (${emails.length})` : ''}
                      </>
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
