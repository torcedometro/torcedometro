import { supabase } from './supabase';

export interface Game {
  id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'finished';
  stadium: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
    radius_meters?: number;
  };
  home_club_id?: string;
  away_club_id?: string;
}

export const gameService = {
  /**
   * Buscar jogos de um clube específico (como mandante ou visitante)
   * Ordenados por data (mais próximos primeiro)
   */
  async getGamesByClub(clubId: string): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select(`
        id,
        home_team,
        away_team,
        start_time,
        end_time,
        status,
        home_club_id,
        away_club_id,
        stadium:stadiums (*)
      `)
      .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`) // Sintaxe OR do Supabase
      .order('start_time', { ascending: true });

    if (error) throw error;

    return data as unknown as Game[];
  },

  /**
   * Buscar o próximo jogo para a Home (Ativo ou Próximo Agendado)
   */
  async getNextOrActiveGame(): Promise<Game | null> {
    // 1. Tentar buscar jogo ATIVO
    const { data: activeGame, error: activeError } = await supabase
      .from('games')
      .select(`*, stadium:stadiums(*)`)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (activeGame) return activeGame as Game;

    // 2. Se não tiver ativo, buscar o próximo agendado
    const { data: nextGame, error: nextError } = await supabase
      .from('games')
      .select(`*, stadium:stadiums(*)`)
      .eq('status', 'scheduled')
      .gt('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(1)
      .single();

    if (nextGame) return nextGame as Game;

    return null;
  },

  /**
   * Verifica se o jogo está em período de check-in válido
   * Regra: Entre 2h antes e 4h depois do início (exemplo generoso)
   */
  isCheckInAvailable(game: Game): boolean {
    const now = new Date();
    const start = new Date(game.start_time);
    const end = new Date(game.end_time);

    // Janela de Check-in:
    // Abre: 1 hora antes do jogo
    // Fecha: No final do jogo (data fim)

    // Ajuste conforme regra de negócio desejada
    // Regra Estrita: Somente DURANTE o jogo (entre Start e End)
    return now >= start && now <= end;
  }
};
