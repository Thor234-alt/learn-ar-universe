
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
    await supabase.auth.signOut();
    window.location.href = '/';
  }
};
