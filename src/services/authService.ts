
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

export const authService = {
  signUp: async (email: string, password: string, fullName: string, role: UserRole) => {
    console.log('Signing up user:', email, 'with role:', role);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          email: email
        }
      }
    });
    
    if (data.user && !error) {
      console.log('User signed up successfully:', data.user.id);
    }
    
    return { error };
  },

  signIn: async (email: string, password: string) => {
    console.log('Signing in user:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  },

  signInWithGoogle: async (role: UserRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          role: role
        }
      }
    });
    
    return { error };
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('supabase signOut error:', error);
      }

      // Clean up any persisted supabase auth tokens in localStorage that
      // sometimes remain set in deployed environments.
      try {
        // Common key used by @supabase/auth-js
        localStorage.removeItem('supabase.auth.token');
        // Remove any other keys that include 'supabase' to be safe
        Object.keys(localStorage).forEach((k) => {
          if (k.includes('supabase')) localStorage.removeItem(k);
        });
      } catch (e) {
        // localStorage may be unavailable in some contexts (SSR), ignore
        console.warn('could not clear localStorage during signOut', e);
      }

      // Redirect back to home after sign out
      window.location.href = '/';
    } catch (err) {
      console.error('Unexpected error during signOut', err);
      // Still attempt a redirect so the UI reflects logged-out state
      try {
        localStorage.removeItem('supabase.auth.token');
      } catch {}
      window.location.href = '/';
    }
  }
};
