import { supabase } from './supabase';
import type { Game } from '../types/game';

export const gameService = {
  /**
   * Get the current active game or the next scheduled one.
   */
  async getNextOrActiveGame(): Promise<Game | null> {
    const now = new Date().toISOString();

    // 1. Try to find an ACTIVE game happening right now
    const { data: activeGames, error: activeError } = await supabase
      .from('games')
      .select('*, stadium:stadiums(*)')
      .lte('start_time', now)
      .gte('end_time', now)
      .limit(1);

    if (activeError) {
      console.error('Error fetching active games:', activeError);
      return null;
    }

    if (activeGames && activeGames.length > 0) {
      return { ...activeGames[0], status: 'active' }; // Force status just in case
    }

    // 2. If no active game, find the NEXT scheduled game
    const { data: nextGames, error: nextError } = await supabase
      .from('games')
      .select('*, stadium:stadiums(*)')
      .gt('start_time', now)
      .order('start_time', { ascending: true })
      .limit(1);

    if (nextError) {
      console.error('Error fetching next games:', nextError);
      return null;
    }

    if (nextGames && nextGames.length > 0) {
      return nextGames[0];
    }

    return null;
  }
};
