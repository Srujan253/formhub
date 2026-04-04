import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Mail, Lock, User, Sparkles, Eye, EyeOff, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [about, setAbout] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register(name, email, password, about);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'User already exists') {
        setError(t('auth.userAlreadyExists'));
      } else {
        setError(msg || t('auth.failedToRegister'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <Sparkles size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">{t('auth.createAccount')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('auth.register')}</p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50/80 border border-red-200/80 rounded-xl"
              >
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="form-label">{t('auth.name')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="name"
                  type="text"
                  required
                  className="form-input !pl-10"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  className="form-input !pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input !pl-10 !pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">{t('auth.about') || 'Tell us about yourself/your organization'}</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <textarea
                  name="about"
                  required
                  rows={3}
                  className="form-input !pl-10 resize-none"
                  placeholder="Tell us a little bit about yourself or your organization..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white
                transition-all duration-300 shadow-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 shadow-primary-500/25 hover:shadow-primary-500/40'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  {t('auth.register')}...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  {t('auth.register')}
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            {t('auth.alreadyHave')}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
