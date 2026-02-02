import { supabase } from './supabase';
import { Club } from '../types/club';

export const clubService = {
  async getClubs(): Promise<Club[]> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Club[];
  }
};
