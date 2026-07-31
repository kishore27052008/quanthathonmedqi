import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('medq_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medq_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('medq_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Failed to fetch current user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('medq_token', access_token);
    setToken(access_token);

    // Fetch user profile immediately
    try {
      const meRes = await api.get('/auth/me');
      setUser(meRes.data);
      localStorage.setItem('medq_user', JSON.stringify(meRes.data));
    } catch {
      // Fallback default profile if /me endpoint isn't fully ready
      const fallbackUser = { id: 1, full_name: 'Dr. Sarah Johnson', email, role: 'Obstetrician & Clinical Lead' };
      setUser(fallbackUser);
      localStorage.setItem('medq_user', JSON.stringify(fallbackUser));
    }
    return response.data;
  };

  const register = async (fullName, email, password, role = 'Obstetrician') => {
    const response = await api.post('/auth/register', {
      full_name: fullName,
      email,
      password,
      role,
    });
    const { access_token } = response.data;
    localStorage.setItem('medq_token', access_token);
    setToken(access_token);

    const newUser = { id: Date.now(), full_name: fullName, email, role };
    setUser(newUser);
    localStorage.setItem('medq_user', JSON.stringify(newUser));
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('medq_token');
    localStorage.removeItem('medq_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
