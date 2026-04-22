import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get('/api/users/me');
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const loginWithGoogle = async (googleToken, role) => {
    try {
      const response = await api.post('/api/auth/google', { googleToken, role });
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed');
      throw err;
    }
  };

  const registerWithGoogle = async (googleToken, role, companyData) => {
    try {
      const response = await api.post('/api/auth/google/register', {
        googleToken,
        role,
        ...companyData
      });
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Google registration failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    login,
    loginWithGoogle,
    register,
    registerWithGoogle,
    logout
  };

  if (loading) {
    return (
      <AuthContext.Provider value={{
        currentUser: null,
        loading: true,
        error: null,
        isAuthenticated: false,
        login: () => {},
        loginWithGoogle: () => {},
        register: () => {},
        registerWithGoogle: () => {},
        logout: () => {}
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

