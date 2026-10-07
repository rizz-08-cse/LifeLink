import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lifelink_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load current user from token on startup
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('lifelink_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        if (data.success) {
          setUser(data.user);
          setDonorProfile(data.donorProfile);
        } else {
          localStorage.removeItem('lifelink_token');
          setToken(null);
          setUser(null);
          setDonorProfile(null);
        }
      } catch (err) {
        console.error('[Auth Load Error]:', err);
        localStorage.removeItem('lifelink_token');
        setToken(null);
        setUser(null);
        setDonorProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success) {
        localStorage.setItem('lifelink_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setDonorProfile(res.donorProfile);
        return { success: true, user: res.user };
      } else {
        return { success: false, message: res.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Server connection error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await api.register(userData);
      if (res.success) {
        localStorage.setItem('lifelink_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setDonorProfile(res.donorProfile);
        return { success: true, user: res.user };
      } else {
        return { success: false, message: res.message || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Server connection error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lifelink_token');
    setToken(null);
    setUser(null);
    setDonorProfile(null);
  };

  const toggleDonorAvailability = async () => {
    if (!donorProfile) return;
    try {
      const res = await api.toggleAvailability();
      if (res.success) {
        setDonorProfile((prev) => ({
          ...prev,
          isAvailable: res.isAvailable
        }));
        return { success: true, isAvailable: res.isAvailable };
      }
    } catch (err) {
      console.error('[Availability Toggle Error]:', err);
      return { success: false, message: err.message };
    }
  };

  const updateUserLocation = async (coords, locality) => {
    try {
      await api.updateLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        addressLocality: locality
      });
      if (donorProfile) {
        setDonorProfile((prev) => ({
          ...prev,
          addressLocality: locality,
          hasCoordinates: true
        }));
      }
    } catch (err) {
      console.warn('[Update Location Error]:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        donorProfile,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        toggleDonorAvailability,
        updateUserLocation,
        setDonorProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
