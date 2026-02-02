import { supabase } from './supabase';
// @ts-ignore: Legacy import for SDK 52+ compatibility to avoid readAsStringAsync deprecation error
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

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

      // 1. READ FILE AS BASE64 (Fixes FormData RLS issues in RN)
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: 'base64',
      });

      const fileName = `checkin-${userId}-${gameId}-${Date.now()}.jpg`;
      const contentType = 'image/jpeg';

      // 2. Upload using ArrayBuffer
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('checkin-photos')
        .upload(fileName, decode(base64), {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error('[CheckIn] Upload Error Details:', uploadError);
        throw new Error('Falha no upload da foto: ' + uploadError.message);
      }

      console.log('[CheckIn] Foto enviada com sucesso:', uploadData.path);

      const { data: urlData } = supabase.storage
        .from('checkin-photos')
        .getPublicUrl(uploadData.path);

      // 3. Insert Check-in Record
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
