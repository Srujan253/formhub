import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, AlertCircle, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAuthStore } from '../store/useAuthStore';
import FormCard from '../components/FormCard';

const HomePage = () => {
  const { t } = useTranslation();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const currentRole = useAuthStore((state) => state.role);
  const canCreate = currentRole !== 'staff';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchForms();
  }, [user, navigate]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formAPI.getAllForms();
      setForms(response.data.data || []);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(t('home.loadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    navigate('/create');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      {/* Hero Section */}
      <div className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-primary-500" />
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{t('home.dashboard')}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {t('home.my')} <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">{t('home.forms')}</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            {t('home.heroDesc')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex gap-3 items-center"
        >
          {canCreate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateForm}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              {t('home.createNewForm')}
            </motion.button>
          )}

          {forms.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/60 rounded-xl border border-gray-100 backdrop-blur-sm">
              <TrendingUp size={16} className="text-emerald-500" />
              <span className="text-sm text-gray-600 font-medium">{forms.length} {t('home.forms')}</span>
            </div>
          )}
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-3 backdrop-blur-sm"
        >
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <div className="w-12 h-12 rounded-full border-[3px] border-primary-200 border-t-primary-600"></div>
          </motion.div>
          <p className="text-gray-400 mt-4 text-sm font-medium">{t('home.loading')}</p>
        </div>
      ) : forms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center py-20 card max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText size={28} className="text-primary-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.noFormsYet')}</h3>
          <p className="text-gray-500 mb-6 text-sm">{t('home.createFirstDesc')}</p>
          {canCreate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateForm}
              className="btn-primary"
            >
              {t('home.createYourFirst')}
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {forms.map((form, index) => (
              <FormCard
                key={form._id}
                form={form}
                index={index}
                onFormUpdate={fetchForms}
                onFormDelete={(deletedId) => setForms(forms.filter(f => f._id !== deletedId))}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomePage;

