import React, { createContext, useState, useEffect } from 'react';
import { getMe } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('trackship_token'));
  const [loading, setLoading] = useState(true);

  // Sync profile when token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();
        if (response.success) {
          setUser(response.data);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to sync profile', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('trackship_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('trackship_token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
