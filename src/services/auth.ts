import { supabase } from './supabase';
import type { User, AuthError } from '../types/user';

export const authService = {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw { message: error.message, status: error.status } as AuthError;
    }

    return data;
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw { message: error.message, status: error.status } as AuthError;
    }

    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw { message: error.message, status: error.status } as AuthError;
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw { message: error.message, status: error.status } as AuthError;
    }

    return data.session;
  },

  /**
   * Get current user profile from database
   */
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as User;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw { message: error.message } as AuthError;
    }

    return data as User;
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId: string, fileUri: string) {
    const formData = new FormData();
    const fileName = `${userId}-${Date.now()}.jpg`;
    const filePath = `avatars/${fileName}`;

    // @ts-ignore: FormData expects file object in React Native
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'image/jpeg',
    });

    const { data, error } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, formData, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw { message: error.message } as AuthError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },
};
