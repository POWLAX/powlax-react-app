'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { wordpressAuth, WordPressUser, MemberPressSubscription, AuthResponse } from '@/lib/wordpress-auth';

interface AuthContextValue {
  user: WordPressUser | null;
  loading: boolean;
  error: string | null;
  subscriptions: MemberPressSubscription[];
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkSubscription: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * WordPress Authentication Provider
 */
export function WordPressAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WordPressUser | null>(null);
  const [subscriptions, setSubscriptions] = useState<MemberPressSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for stored session on mount
  useEffect(() => {
    const checkStoredSession = async () => {
      try {
        const storedToken = localStorage.getItem('wp_token');
        if (storedToken) {
          const validation = await wordpressAuth.validateSession(storedToken);
          if (validation.valid && validation.user) {
            setUser(validation.user);
            
            // Check subscription status
            const subStatus = await wordpressAuth.checkSubscriptionStatus(validation.user.id);
            setSubscriptions(subStatus.subscriptions);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('wp_token');
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStoredSession();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await wordpressAuth.authenticateUser(username, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        setSubscriptions(response.subscriptions || []);
        
        // Store token for session persistence
        if (response.token) {
          localStorage.setItem('wp_token', response.token);
        }
      } else {
        setError(response.error || 'Login failed');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await wordpressAuth.logout();
      setUser(null);
      setSubscriptions([]);
      localStorage.removeItem('wp_token');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSubscription = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const status = await wordpressAuth.checkSubscriptionStatus(user.id);
      setSubscriptions(status.subscriptions);
      return status.hasActiveSubscription;
    } catch (err) {
      console.error('Subscription check error:', err);
      return false;
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('wp_token');
      if (token) {
        const validation = await wordpressAuth.validateSession(token);
        if (validation.valid && validation.user) {
          setUser(validation.user);
          
          const subStatus = await wordpressAuth.checkSubscriptionStatus(validation.user.id);
          setSubscriptions(subStatus.subscriptions);
        }
      }
    } catch (err) {
      console.error('User refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    subscriptions,
    login,
    logout,
    checkSubscription,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use WordPress authentication
 */
export function useWordPressAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useWordPressAuth must be used within WordPressAuthProvider');
  }
  return context;
}

/**
 * Hook to check if user has active subscription
 */
export function useSubscriptionStatus() {
  const { user, subscriptions } = useWordPressAuth();
  
  const hasActiveSubscription = subscriptions.some(sub => sub.status === 'active');
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  return {
    hasActiveSubscription,
    activeSubscriptions,
    allSubscriptions: subscriptions,
  };
}

/**
 * Hook to protect routes that require authentication
 */
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, loading } = useWordPressAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo;
        }
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, redirectTo]);

  return { isAuthorized, loading };
}

/**
 * Hook to protect routes that require active subscription
 */
export function useRequireSubscription(redirectTo = '/subscription/upgrade') {
  const { user, loading } = useWordPressAuth();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (!hasActiveSubscription) {
        // Redirect to subscription page
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo;
        }
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, hasActiveSubscription, redirectTo]);

  return { isAuthorized, loading, hasActiveSubscription };
}