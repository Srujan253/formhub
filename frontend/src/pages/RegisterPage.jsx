import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Mail, Lock, User, Activity, Eye, EyeOff, Building2 } from 'lucide-react';
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
        setError(t('auth.userAlreadyExists', { defaultValue: 'User already exists' }));
      } else {
        setError(msg || t('auth.failedToRegister', { defaultValue: 'Failed to register' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        {/* Clean Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm text-white">
            <Activity size={24} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('auth.createAccount', { defaultValue: 'Create an Account' })}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('auth.register', { defaultValue: 'Sign up to get started' })}</p>
        </div>

        {/* Form card */}
        <div className="card shadow-sm border border-gray-200/70 p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="form-label">{t('auth.name', { defaultValue: 'Full Name' })}</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="name"
                  type="text"
                  required
                  className="form-input !pl-10 text-sm"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('auth.email', { defaultValue: 'Email Address' })}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  className="form-input !pl-10 text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">{t('auth.password', { defaultValue: 'Password' })}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input !pl-10 !pr-10 text-sm"
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
              <label className="form-label">{t('auth.about', { defaultValue: 'Organization / Details' })}</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <textarea
                  name="about"
                  required
                  rows={3}
                  className="form-input !pl-10 resize-none text-sm"
                  placeholder="Briefly describe your organization or role..."
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
                transition-all duration-200 shadow-sm ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  {t('auth.register', { defaultValue: 'Creating Account' })}...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  {t('auth.register', { defaultValue: 'Create Account' })}
                </>
              )}
            </motion.button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            {t('auth.alreadyHave', { defaultValue: 'Already have an account? Sign in' })}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
