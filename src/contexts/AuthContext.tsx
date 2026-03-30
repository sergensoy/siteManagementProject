import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types/user';
import type { LoginCredentials } from '@/types/user';
import { mockApi, initializeMockData } from '@/services/mockApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'auth_session';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Uygulama ilk açıldığında demo verisini ve oturumu yükle
  useEffect(() => {
    initializeMockData();

    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved: User = JSON.parse(raw);
        setUser(saved);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { user: loggedIn } = await mockApi.login(credentials);
    setUser(loggedIn);
    localStorage.setItem(SESSION_KEY, JSON.stringify(loggedIn));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateCurrentUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
