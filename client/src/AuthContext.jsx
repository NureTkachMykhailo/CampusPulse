import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('campuspulse_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) return;
    if (new URLSearchParams(location.search).get('demo') !== '1') return;
    login('demo@campuspulse.local', 'campus123');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(token, user) {
    localStorage.setItem('campuspulse_token', token);
    localStorage.setItem('campuspulse_user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    persist(data.token, data.user);
  }

  async function register(name, email, password) {
    const data = await api.register({ name, email, password });
    persist(data.token, data.user);
  }

  function logout() {
    localStorage.removeItem('campuspulse_token');
    localStorage.removeItem('campuspulse_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
