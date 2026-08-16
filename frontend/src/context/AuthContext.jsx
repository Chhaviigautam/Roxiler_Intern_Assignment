import React, { createContext, useContext, useState } from 'react';
import api from '../api/api';
const AuthContext = createContext(null);
export const AuthProvider = ({
  children
}) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email,
        password
      });
      const {
        token: newToken,
        user: newUser
      } = res.data.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };
  return <AuthContext.Provider value={{
    user,
    token,
    login,
    logout,
    isLoading
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};