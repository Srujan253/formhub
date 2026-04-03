import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, UserX, Shield, ShieldAlert, UserPlus, X } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffData, setStaffData] = useState({ name: '', email: '', password: '' });
  const [staffLoading, setStaffLoading] = useState(false);
  
  const navigate = useNavigate();
  const currentRole = useAuthStore((state) => state.role);
  
  useEffect(() => {
    if (currentRole !== 'admin' && currentRole !== 'manager') {
      navigate('/404');
      return;
    }
    
    fetchUsers();
  }, [currentRole, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`);
      setUsers(users.map(u => u._id === userId ? { ...u, isVerified: true } : u));
    } catch (err) {
      alert('Error verifying user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      setStaffLoading(true);
      const { data } = await api.post('/admin/staff', staffData);
      setUsers([data, ...users]); // add new user to front of list
      setShowStaffModal(false);
      setStaffData({ name: '', email: '', password: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating staff user');
    } finally {
      setStaffLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
         <div className="w-8 h-8 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <div className="mb-8 flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Command Center</h1>
          <p className="text-gray-500 mt-2">Manage users, roles, and verifications.</p>
        </div>
        <button
          onClick={() => setShowStaffModal(true)}
          className="btn-primary flex justify-center items-center gap-2"
        >
          <UserPlus size={18} />
          Create Staff Account
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      {/* Staff Invite Modal */}
      <AnimatePresence>
        {showStaffModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStaffModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-xl z-50 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-manrope">Create Staff Account</h3>
                <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={staffData.name}
                    onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none transition"
                    placeholder="Enter staff name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={staffData.email}
                    onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none transition"
                    placeholder="staff@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={staffData.password}
                    onChange={(e) => setStaffData({ ...staffData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary-500 outline-none transition"
                    placeholder="Set temporary password"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={staffLoading}
                    className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
                  >
                    {staffLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {users.map((user) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              key={user._id}
              className={`bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border transition-all ${
                !user.isVerified 
                  ? 'border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/20' 
                  : 'border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {user.name}
                    {user.role === 'admin' && <ShieldAlert size={16} className="text-purple-600" />}
                    {user.role === 'manager' && <Shield size={16} className="text-primary-600" />}
                  </h3>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                {!user.isVerified && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Pending
                  </span>
                )}
              </div>

              {user.about && (
                <div className="mb-4 text-sm text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-semibold text-slate-700 mb-1">About:</p>
                  <p className="line-clamp-2">{user.about}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                {!user.isVerified && (
                  <button
                    onClick={() => handleVerify(user._id)}
                    className="flex items-center justify-center gap-1 flex-1 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium rounded-xl transition-colors"
                  >
                    <UserCheck size={16} /> Verify
                  </button>
                )}

                <div className="flex-1 relative group">
                   <select 
                     value={user.role}
                     onChange={(e) => handleRoleChange(user._id, e.target.value)}
                       disabled={currentRole === 'manager' || user.email === 'ksrujan026@gmail.com'}
                       className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 text-slate-700 text-sm rounded-xl py-2 px-3 appearance-none hover:bg-slate-50 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <option value="staff">Staff</option>
                        {currentRole === 'admin' && <option value="manager">Manager</option>}
                        {currentRole === 'admin' && <option                           {currentRole === 'admin' && <option value="admin">Admin</option>}
                       </select>
                    </div>
                  
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={currentRole === 'manager' || user.email === 'ksrujan026@gmail.com'}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >isabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <UserX size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {users.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
