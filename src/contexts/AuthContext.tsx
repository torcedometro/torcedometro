import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth';
import type { User } from '../types/user';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ... (useEffect remains same)

  useEffect(() => {
    // Get initial session
    authService.getSession().then(session => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await authService.getUserProfile(userId);
      setUser(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { session: newSession } = await authService.signIn(email, password);
    setSession(newSession);
    if (newSession?.user) {
      await loadUserProfile(newSession.user.id);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { session: newSession } = await authService.signUp(email, password, fullName);
    setSession(newSession);
    if (newSession?.user) {
      await loadUserProfile(newSession.user.id);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = await authService.updateProfile(user.id, updates);
    setUser(updatedUser);
  };

  const refreshUserData = async () => {
    if (session?.user) {
      await loadUserProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
        refreshUserData
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
