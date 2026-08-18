'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthCustomer } from '@/lib/auth/types';

type AuthContextValue = {
  customer: AuthCustomer | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (input: { email: string; password: string; remember?: boolean }) => Promise<AuthCustomer>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<AuthCustomer>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type ApiErrorBody = { message?: string; code?: string };

class AuthClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'AuthClientError';
    this.status = status;
    this.code = code;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const data = await parseJson<T & ApiErrorBody>(response);
  if (!response.ok) {
    throw new AuthClientError(
      data.message || 'Zahtev nije uspeo.',
      response.status,
      data.code,
    );
  }
  return data;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<AuthCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authFetch<{ customer: AuthCustomer | null }>('/api/auth/me/')
      .then((data) => {
        if (!cancelled) setCustomer(data.customer ?? null);
      })
      .catch(() => {
        if (!cancelled) setCustomer(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: { email: string; password: string; remember?: boolean }) => {
    const data = await authFetch<{ customer: AuthCustomer }>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setCustomer(data.customer);
    return data.customer;
  }, []);

  const register = useCallback(
    async (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const data = await authFetch<{ customer: AuthCustomer }>('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setCustomer(data.customer);
      return data.customer;
    },
    [],
  );

  const logout = useCallback(async () => {
    await authFetch('/api/auth/logout/', { method: 'POST' }).catch(() => undefined);
    setCustomer(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const data = await authFetch<{ message?: string }>('/api/auth/forgot/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data.message || 'Ako nalog postoji, poslali smo link za reset lozinke.';
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      isLoading,
      isLoggedIn: Boolean(customer),
      login,
      register,
      logout,
      forgotPassword,
    }),
    [customer, isLoading, login, register, logout, forgotPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { AuthClientError };
