import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, AlertCircle, FileText, Search, LayoutGrid, CheckCircle2, PauseCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAuthStore } from '../store/useAuthStore';
import FormCard from '../components/FormCard';
import { FormGridSkeleton } from '../components/Skeleton';

const HomePage = () => {
  const { t } = useTranslation();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
      setError(t('home.loadError', { defaultValue: 'Failed to load forms' }));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    navigate('/create');
  };

  const filteredForms = useMemo(() => {
    if (!searchQuery.trim()) return forms;
    const q = searchQuery.toLowerCase();
    return forms.filter(f => 
      f.title?.toLowerCase().includes(q) || 
      f.description?.toLowerCase().includes(q)
    );
  }, [forms, searchQuery]);

  const activeCount = useMemo(() => forms.filter(f => f.isActive !== false).length, [forms]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/70 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {t('home.my', { defaultValue: 'My' })} {t('home.forms', { defaultValue: 'Forms' })}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('home.heroDesc', { defaultValue: 'Create, distribute, and analyze your surveys and forms.' })}
          </p>
        </div>

        {canCreate && (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateForm}
              className="btn-primary flex items-center gap-2 shadow-sm font-semibold text-sm px-4 py-2.5 rounded-xl"
            >
              <Plus size={16} className="stroke-[2.5]" />
              {t('home.createNewForm', { defaultValue: 'New Form' })}
            </motion.button>
          </div>
        )}
      </div>

      {/* Stats & Search Toolbar */}
      {!loading && forms.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Status Pills */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200/80 shadow-sm">
              <LayoutGrid size={14} className="text-gray-400" />
              <span>{t('home.totalCount', { count: forms.length, defaultValue: `${forms.length} total` })}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/70 text-emerald-700 rounded-lg border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('home.activeCount', { count: activeCount, defaultValue: `${activeCount} active` })}</span>
            </div>
            {forms.length - activeCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg border border-gray-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span>{t('home.pausedCount', { count: forms.length - activeCount, defaultValue: `${forms.length - activeCount} paused` })}</span>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('home.searchPlaceholder', { defaultValue: 'Search forms...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-3 backdrop-blur-sm"
        >
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {loading ? (
        <FormGridSkeleton count={6} />
      ) : forms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-20 bg-white/70 rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto p-8"
        >
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600 border border-primary-100">
            <FileText size={26} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t('home.noFormsYet', { defaultValue: 'No forms yet' })}</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">{t('home.createFirstDesc', { defaultValue: 'Get started by creating your first survey or questionnaire.' })}</p>
          {canCreate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateForm}
              className="btn-primary"
            >
              {t('home.createYourFirst', { defaultValue: 'Create Your First Form' })}
            </motion.button>
          )}
        </motion.div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          {t('home.noSearchResults', { query: searchQuery, defaultValue: `No forms match "${searchQuery}".` })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredForms.map((form, index) => (
              <FormCard
                key={form._id}
                form={form}
                index={index}
                onFormUpdate={fetchForms}
                onFormDelete={(deletedId) => setForms(forms.filter(f => f._id !== deletedId))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default HomePage;
