import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

const ShareModal = ({ isOpen, onClose, shareToken, formTitle }) => {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/s/${shareToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-100/80 shadow-lumina-xl
                       w-full max-w-md max-h-[95vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100/80 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                    <LinkIcon size={14} className="text-white" />
                  </div>
                  Share Form
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{formTitle}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100/80 hover:bg-gray-200/80
                           transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Share Link */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-sm text-gray-700
                                  truncate font-mono backdrop-blur-sm">
                    {publicUrl}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300
                      ${copied
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/20'
                      }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  QR Code
                </label>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block p-5 bg-white rounded-2xl border border-gray-100 shadow-lumina"
                >
                  <QRCodeSVG
                    value={publicUrl}
                    size={180}
                    level="H"
                    bgColor="transparent"
                    fgColor="#312e81"
                    includeMargin={false}
                  />
                </motion.div>
                <p className="text-xs text-gray-400 mt-3">Scan with a phone camera to open the form</p>
              </div>

              {/* Open in new tab */}
              <motion.a
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50/80 hover:bg-gray-100/80
                           border border-gray-200/80 rounded-xl text-sm font-medium text-gray-700
                           transition-all duration-300 backdrop-blur-sm"
              >
                <ExternalLink size={16} />
                Open in new tab
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
