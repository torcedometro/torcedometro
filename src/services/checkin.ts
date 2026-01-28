import { supabase } from './supabase';
import { Game } from '../types/game';

export interface CheckInPayload {
  userId: string;
  gameId: string;
  stadiumId: string;
  photoUri: string;
  latitude: number;
  longitude: number;
}

export const checkinService = {
  /**
   * Perform a check-in for a game.
   */
  async createCheckIn({ userId, gameId, stadiumId, photoUri, latitude, longitude }: CheckInPayload) {
    try {
      console.log('[CheckIn] Iniciando upload da foto...');

      // 1. Upload Photo
      const formData = new FormData();
      const fileName = `checkin-${userId}-${gameId}.jpg`;
      const filePath = `${fileName}`;

      // @ts-ignore
      formData.append('file', {
        uri: photoUri,
        name: fileName,
        type: 'image/jpeg',
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('checkin-photos')
        .upload(filePath, formData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw new Error('Falha no upload da foto: ' + uploadError.message);

      const { data: urlData } = supabase.storage
        .from('checkin-photos')
        .getPublicUrl(uploadData.path);

      console.log('[CheckIn] Foto enviada. Criando registro no banco...');

      // 2. Insert Check-in Record
      const { data, error } = await supabase
        .from('checkins')
        .insert({
          user_id: userId,
          game_id: gameId,
          stadium_id: stadiumId,
          photo_url: urlData.publicUrl,
          latitude,
          longitude,
        })
        .select()
        .single();

      if (error) {
        // Check for duplicate constraint (Error 23505 in Postgres)
        if (error.code === '23505') {
          throw new Error('Você já fez check-in neste jogo!');
        }
        throw new Error('Erro ao salvar check-in: ' + error.message);
      }

      return data;

    } catch (error) {
      console.error('[CheckInService]', error);
      throw error;
    }
  },

  /**
   * Check if user has already checked in for a game
   */
  async hasCheckedIn(userId: string, gameId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single();

    return !!data;
  }
};
