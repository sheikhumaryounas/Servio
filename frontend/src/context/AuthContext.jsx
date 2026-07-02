import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Since we are using local DB, we store user profile in local storage or fetch from server.
        // For simplicity, we store the full user details in localstorage when logging in.
        try {
          const storedUser = localStorage.getItem('user');
          const storedProfile = localStorage.getItem('providerProfile');
          
          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedProfile) setProviderProfile(JSON.parse(storedProfile));
        } catch (e) {
          console.error('Error loading stored auth details:', e);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user: userData, providerProfile: profileData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem('providerProfile', JSON.stringify(profileData));
      }

      setToken(token);
      setUser(userData);
      setProviderProfile(profileData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, phone, password, confirmPassword, role, serviceTypes, experience) => {
    setError(null);
    try {
      const payload = {
        name,
        email,
        phone,
        password,
        confirmPassword,
        role,
        serviceType: role === 'provider' ? serviceTypes : undefined,
        experience: role === 'provider' ? parseInt(experience) || 0 : undefined
      };
      
      const res = await axios.post(`${API_URL}/auth/register`, payload);
      const { token, user: userData, providerProfile: profileData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem('providerProfile', JSON.stringify(profileData));
      }

      setToken(token);
      setUser(userData);
      setProviderProfile(profileData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('providerProfile');
    setToken(null);
    setUser(null);
    setProviderProfile(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProviderProfile = (updatedProfile) => {
    localStorage.setItem('providerProfile', JSON.stringify(updatedProfile));
    setProviderProfile(updatedProfile);
  };

  const updateUserProfile = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, providerProfile, loading, error, login, register, logout, updateProviderProfile, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
