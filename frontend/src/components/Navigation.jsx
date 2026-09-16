import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, LogOut, LogIn, UserPlus, Activity, Languages, Check, ShieldAlert, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useConfigStore } from '../store/useConfigStore';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const language = useConfigStore((state) => state.language);
  const setLanguage = useConfigStore((state) => state.setLanguage);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-[60] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-primary-700 transition-colors">
              <Activity size={18} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              {t('appName', { defaultValue: 'Pulse' })}
            </span>
          </Link>

          <div className="flex gap-3 items-center">
            {/* Language Switcher */ }
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50/80 text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200/50 backdrop-blur-sm transition-all"
                title={t('header.changeLanguage', { defaultValue: 'Change Language' })}
              >
                <Languages size={18} />
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-40 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1"
                    >
                      <button
                        onClick={() => toggleLanguage('jp')}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between hover:bg-gray-50/80 text-gray-700 transition-colors"
                      >
                        日本語
                        {language === 'jp' && <Check size={16} className="text-primary-500" />}
                      </button>
                      <button
                        onClick={() => toggleLanguage('en')}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between hover:bg-gray-50/80 text-gray-700 transition-colors"
                      >
                        English
                        {language === 'en' && <Check size={16} className="text-primary-500" />}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'manager') && (
                    <Link to="/admin" className="flex items-center gap-2 btn-secondary text-xs sm:text-sm !text-indigo-600 !bg-indigo-50 hover:!bg-indigo-100 !border-indigo-100">
                    <ShieldAlert size={16} />
                    <span className="hidden sm:inline">{t('header.adminPanel')}</span>
                  </Link>
                )}
                <Link to="/" className="flex items-center gap-2 btn-secondary text-xs sm:text-sm">
                  <FileText size={16} />
                  <span className="hidden sm:inline">{t('header.myForms')}</span>
                </Link>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <Link to="/email-groups" className="flex items-center gap-2 btn-secondary text-xs sm:text-sm !text-primary-600 !bg-primary-50 hover:!bg-primary-100 !border-primary-100">
                    <Users size={16} />
                    <span className="hidden sm:inline">{t('header.emailGroups', { defaultValue: 'Groups' })}</span>
                  </Link>
                )}
                {user.role !== 'staff' && (
                  <Link to="/create" className="flex items-center gap-2 btn-primary text-xs sm:text-sm">
                    <Plus size={16} />
                    <span className="hidden sm:inline">{t('header.create')}</span>
                  </Link>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50/80 text-red-600 rounded-xl border border-red-100/50 hover:bg-red-100/80 transition-all duration-300 font-medium text-xs sm:text-sm backdrop-blur-sm"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">{t('header.logout')}</span>
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 btn-secondary text-xs sm:text-sm">
                  <LogIn size={16} />
                  {t('auth.login')}
                </Link>
                <Link to="/register" className="flex items-center gap-2 btn-primary text-xs sm:text-sm">
                  <UserPlus size={16} />
                  {t('auth.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
