'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role, User } from './types';
import { api, ApiError } from './api';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'SUPER_ADMIN',
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('SUPER_ADMIN');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session: check storage or use HttpOnly cookie refresh
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('esummit_admin_token') || localStorage.getItem('esummit_admin_token')
          : null;

      if (storedToken) {
        api.setToken(storedToken);
        setToken(storedToken);
      }

      try {
        const res = await api.getMe();
        if (isMounted) {
          setUser(res.user);
          setRole(res.user.role);
          setIsLoading(false);
        }
      } catch {
        // Access token might be expired; attempt silent refresh via HttpOnly cookie
        const refreshed = await api.refreshSession();
        if (refreshed && isMounted) {
          try {
            const res = await api.getMe();
            setUser(res.user);
            setRole(res.user.role);
            setToken(api.getToken());
          } catch {
            api.clearToken();
            setUser(null);
          }
        } else if (isMounted) {
          api.clearToken();
          setToken(null);
          setUser(null);
        }
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setRole(res.user.role);
      setToken(res.accessToken);
      return true;
    } catch (err) {
      console.error('[AuthContext] Login failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      api.clearToken();
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
      }
    }
  };



  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
