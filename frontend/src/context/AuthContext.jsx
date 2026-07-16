import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      // Backend wraps in res.data.data
      const payload = res.data.data || res.data;
      const newToken = payload.token;
      const userData = payload.user;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      return { success: true, message: res.data.message || 'Registration successful!' };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      const updatedUser = res.data.data || res.data.user || { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Update failed. Please try again.';
      return { success: false, message };
    }
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
