
import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { authService } from '@/services/authService';
import { redirectBasedOnRole } from '@/utils/authRedirect';
import { UserRole } from '@/types/auth';

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { profile, fetchProfile, clearProfile } = useProfile();

  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: any, session: Session | null) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Wait a bit for the database trigger to create the profile
        setTimeout(async () => {
          if (!mounted) return;
          
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            setTimeout(() => redirectBasedOnRole(profile.role), 100);
          }
        }, 1000);
      } else {
        clearProfile();
      }
      
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, clearProfile]);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    clearProfile();
    setSession(null);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp: authService.signUp,
    signIn: authService.signIn,
    signInWithGoogle: authService.signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
