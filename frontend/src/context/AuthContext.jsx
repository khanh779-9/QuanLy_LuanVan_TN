import { createContext, useState, useContext, useEffect } from 'react';
import { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('token');
    return saved && saved !== 'undefined' ? saved : null;
  });

  // Đồng bộ lại token vào axios interceptor khi mount (fix mất token khi reload)
  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  const saveAuth = (userData, tokenStr) => {
    setUser(userData);
    setToken(tokenStr);
    setAuthToken(tokenStr);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenStr);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phai dung trong AuthProvider');
  return context;
}

export default AuthContext;
