import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/api/user/dashboard');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const response = await axiosInstance.post('/api/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};