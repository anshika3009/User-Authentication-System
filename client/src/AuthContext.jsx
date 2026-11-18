import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app loads, check whether a session is already active
  useEffect(() => {
    api('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => setUser(await api('/auth/login', 'POST', { email, password }));
  const register = (name, email, password) => api('/auth/register', 'POST', { name, email, password });
  const logout = async () => { await api('/auth/logout', 'POST'); setUser(null); };
  const updateProfile = async (data) => setUser(await api('/auth/profile', 'PUT', data));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}