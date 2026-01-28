import { supabase } from './supabase';

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  avatar_url: string;
  total_points: number;
  rank_position: number;
}

export const rankingService = {
  /**
   * Get global leaderboard
   */
  async getGlobalRanking(limit = 20): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }

    return data as LeaderboardEntry[];
  }
};
