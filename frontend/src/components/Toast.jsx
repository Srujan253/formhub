import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-8 left-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lumina-xl border backdrop-blur-md min-w-[320px] max-w-[90vw]
        ${isSuccess 
          ? 'bg-emerald-50/90 border-emerald-200/50 text-emerald-800' 
          : 'bg-red-50/90 border-red-200/50 text-red-800'
        }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
        ${isSuccess ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
        {isSuccess ? <CheckCircle size={18} /> : <XCircle size={18} />}
      </div>
      
      <p className="text-sm font-semibold flex-1 leading-tight">{message}</p>
      
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
