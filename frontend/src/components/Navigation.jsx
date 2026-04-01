import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, LogOut, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white/70 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/25"
            >
              <Sparkles size={18} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              Pulse
            </span>
          </Link>

          <div className="flex gap-3 items-center">
            {user ? (
              <>
                <Link to="/" className="flex items-center gap-2 btn-secondary text-xs sm:text-sm">
                  <FileText size={16} />
                  <span className="hidden sm:inline">My Forms</span>
                </Link>
                <Link to="/create" className="flex items-center gap-2 btn-primary text-xs sm:text-sm">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Create</span>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50/80 text-red-600 rounded-xl border border-red-100
                             hover:bg-red-100/80 transition-all duration-300 font-medium text-xs sm:text-sm backdrop-blur-sm"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 btn-secondary text-xs sm:text-sm">
                  <LogIn size={16} />
                  Login
                </Link>
                <Link to="/register" className="flex items-center gap-2 btn-primary text-xs sm:text-sm">
                  <UserPlus size={16} />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
