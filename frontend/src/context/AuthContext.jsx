import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { login: zustandLogin, logout: zustandLogout } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      zustandLogin(JSON.parse(storedUser), JSON.parse(storedUser).token);
    }
    setLoading(false);
  }, [zustandLogin]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    zustandLogin(data, data.token);
    return data;
  };

  const register = async (name, email, password, about) => {
    const { data } = await api.post('/auth/register', { name, email, password, about });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    zustandLogin(data, data.token);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    }
    setUser(null);
    localStorage.removeItem('userInfo');
    zustandLogout();
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
