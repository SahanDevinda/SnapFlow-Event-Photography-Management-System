import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('snapflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('snapflow_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('snapflow_user', JSON.stringify(res.data));
        }
      } catch (err) {
        localStorage.removeItem('snapflow_token');
        localStorage.removeItem('snapflow_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (authData) => {
    localStorage.setItem('snapflow_token', authData.token);
    const userData = {
      id: authData.id,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role
    };
    localStorage.setItem('snapflow_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Used by the profile screen after a successful self-update.
  const refreshUser = (userData) => {
    if (!userData) return;
    const merged = {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role
    };
    localStorage.setItem('snapflow_user', JSON.stringify(merged));
    setUser(merged);
  };

  const logout = () => {
    localStorage.removeItem('snapflow_token');
    localStorage.removeItem('snapflow_user');
    setUser(null);
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'CUSTOMER': return '/customer';
      case 'CUSTOMER_RELATIONS_OFFICER': return '/cro';
      case 'OPERATIONS_MANAGER': return '/operations';
      case 'PHOTOGRAPHER': return '/photographer';
      case 'FINANCE_EXECUTIVE': return '/finance';
      case 'COMPANY_DIRECTOR': return '/admin';
      default: return '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
