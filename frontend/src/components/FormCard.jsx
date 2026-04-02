import React, { useState } from 'react';
import { BarChart3, Share2, Edit3, Calendar, HelpCircle, QrCode, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';
import QRPopup from './QRPopup';
import InviteModal from './InviteModal';
import { emailAPI, formAPI } from '../services/api';

const FormCard = ({ form, index = 0, onFormUpdate, onFormDelete }) => {
  const { t } = useTranslation();
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isActive, setIsActive] = useState(form.isActive !== false);
  const [toggling, setToggling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const responsesUrl = `/responses/${form._id}`;
  const editUrl = `/edit/${form._id}`;

  const questionCount = form.questions 
    ? form.questions.length 
    : (form.sections 
        ? form.sections.flatMap(s => s.items).filter(i => i.type !== 'layout_block').length 
        : 0);

  const handleSendInvites = async (data) => {
    await emailAPI.sendInvites(data);
  };

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    try {
      setToggling(true);
      const newState = !isActive;
      await formAPI.updateForm(form._id, { ...form, isActive: newState });
      setIsActive(newState);
      if (onFormUpdate) onFormUpdate();
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      setDeleting(true);
      await formAPI.deleteForm(form._id);
      if (onFormDelete) onFormDelete(form._id);
    } catch (err) {
      console.error('Delete error:', err);
      setDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        layout
        className={`card card-hover cursor-pointer group relative transition-all duration-300 ${
          !isActive ? 'opacity-60 grayscale-[30%]' : ''
        }`}
      >
        {/* Inactive overlay badge */}
        <AnimatePresence>
          {!isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-3 right-3 px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold
                         uppercase tracking-wider rounded-lg border border-amber-200/80 z-10"
            >
              Paused
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner image if present */}
        {form.headerImage && (
          <div className="h-24 w-full mb-4 -mt-2 rounded-xl overflow-hidden border border-gray-100/50 shadow-inner">
            <img 
              src={form.headerImage} 
              alt={form.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`text-lg font-bold transition-colors line-clamp-1 ${
              isActive ? 'text-gray-900 group-hover:text-primary-700' : 'text-gray-500'
            }`}>
              {form.title}
            </h3>
          </div>
          {form.description ? (
            <div 
              className="text-gray-500 text-sm line-clamp-2 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.description) }}
            />
          ) : (
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{t('home.noDescription', { defaultValue: 'No description' })}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <HelpCircle size={12} />
            {questionCount} {t('home.questions')}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {new Date(form.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Toggle + Share + Delete row */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100/80">
          {/* Active/Inactive Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleActive}
            disabled={toggling}
            className="flex items-center gap-2 cursor-pointer group/toggle"
            title={isActive ? 'Deactivate form' : 'Activate form'}
          >
            <div className={`relative w-10 h-[22px] rounded-full transition-all duration-400 ease-in-out ${
              isActive ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-gray-300'
            }`}>
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm ${
                  isActive ? 'left-[20px]' : 'left-[2px]'
                }`}
              />
            </div>
            <span className={`text-xs font-semibold transition-colors ${
              isActive ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {toggling ? '...' : isActive ? t('home.active') : t('home.inactive')}
            </span>
          </motion.button>

          <div className="flex-1" />

          {/* Share button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); setShowInviteModal(true); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50/80 text-primary-600
                       hover:bg-primary-100 transition-all duration-300"
            title="Invite via email"
          >
            <Share2 size={14} />
          </motion.button>

          {/* Delete button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50/80 text-red-400
                       hover:bg-red-100 hover:text-red-600 transition-all duration-300"
            title="Delete form"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            to={editUrl}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-50/80 text-primary-700
                       rounded-xl text-sm font-medium hover:bg-primary-100/80 transition-all duration-300"
          >
            <Edit3 size={14} />
            {t('home.edit')}
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setShowQRPopup(true); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-50/80 text-gray-700
                       rounded-xl text-sm font-medium hover:bg-gray-100/80 transition-all duration-300 border border-gray-100"
          >
            <QrCode size={14} />
            {t('home.qrCode')}
          </button>
          <Link
            to={responsesUrl}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50/80 text-emerald-700
                       rounded-xl text-sm font-medium hover:bg-emerald-100/80 transition-all duration-300"
          >
            <BarChart3 size={14} />
            {t('home.results')}
          </Link>
        </div>

        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20 p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 8 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={20} className="text-red-500" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{t('formBuilder.deleteConfirmTitle', { defaultValue: 'Delete this form?' })}</p>
                <p className="text-xs text-gray-500 mb-5">{t('formBuilder.deleteConfirmDesc', { defaultValue: 'This action cannot be undone' })}</p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    {t('system.cancel', { defaultValue: 'Cancel' })}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn-danger text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    {deleting ? (
                      <>
                        <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        {t('system.deleting', { defaultValue: 'Deleting...' })}
                      </>
                    ) : (
                      <>
                        <Trash2 size={12} />
                        {t('system.delete', { defaultValue: 'Delete' })}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {form.shareToken && (
        <>
          <QRPopup
            isOpen={showQRPopup}
            onClose={() => setShowQRPopup(false)}
            shareToken={form.shareToken}
            formTitle={form.title}
          />
          <InviteModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            shareToken={form.shareToken}
            formTitle={form.title}
            formDescription={form.description}
            formId={form._id}
            onSendInvites={handleSendInvites}
          />
        </>
      )}
    </>
  );
};

export default FormCard;
