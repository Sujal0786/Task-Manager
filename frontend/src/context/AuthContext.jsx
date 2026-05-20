import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { getStoredToken, setStoredToken } from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setStoredToken(data.token);
    setUser(data.user);
  };

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    setStoredToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'Admin',
      login,
      signup,
      logout,
      refreshUser: loadUser,
    }),
    [user, initializing, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
