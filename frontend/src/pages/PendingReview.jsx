import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';

const PendingReview = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // If they are somehow verified, redirect to home
  if (user?.isVerified) {
    navigate('/');
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'jp' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Pulse Animation */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }}
           transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
           className="w-96 h-96 rounded-full bg-primary-400 blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="z-10 bg-white/70 backdrop-blur-xl border border-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center max-w-lg w-full"
      >
        <button 
          onClick={toggleLanguage}
          className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-700 transition"
        >
          {i18n.language === 'en' ? '日本語' : 'English'}
        </button>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-amber-500/30"
        >
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-extrabold text-slate-800 mb-3 font-manrope">
          {i18n.language === 'en' ? 'Application under review' : '審査中'}
        </h1>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          {i18n.language === 'en' 
            ? 'Your application is being beamed to our moderators. You’ll gain access once verified.' 
            : 'あなたのお申し込みはモデレーターに送信されています。確認され次第、アクセス可能になります。'}
        </p>

        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
           <p className="text-sm font-semibold text-slate-700 mb-1">Status:</p>
           <div className="flex items-center gap-2 justify-center text-amber-600 font-bold">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              Pending Approval
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingReview;