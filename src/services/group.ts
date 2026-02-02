import { supabase } from './supabase';

export interface Group {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  member_count?: number; // Calculated field
  type?: 'EVENT' | 'COMMUNITY';
  banner_url?: string;
  start_date?: string;
  end_date?: string;
  club_id?: string;
}

export interface GroupMember {
  user_id: string;
  full_name: string;
  avatar_url: string;
  total_points: number;
  joined_at: string;
}

export const groupService = {
  /**
   * Create a new group and add creator as first member
   */
  async createGroup(data: {
    name: string;
    description?: string;
    userId: string;
    type: 'EVENT' | 'COMMUNITY';
    banner_url?: string;
    start_date?: Date;
    end_date?: Date;
    club_id?: string;
  }): Promise<Group> {
    // DEBUG
    console.log('[GroupService] creating group with data:', JSON.stringify(data));

    // 1. Create unique code (simple random string)
    const inviteCode = '#' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: data.name,
        description: data.description,
        invite_code: inviteCode,
        created_by: data.userId,
        type: data.type,
        banner_url: data.banner_url || null, // Ensure null if empty string
        start_date: data.start_date?.toISOString(),
        end_date: data.end_date?.toISOString(),
        club_id: data.club_id,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // 2. Add creator as member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: data.userId,
      });

    if (memberError) {
      console.error('Failed to add creator to group', memberError);
    }

    return groupData;
  },

  /**
   * Upload group banner image
   */
  /**
  * Upload group banner image
  */
  async uploadGroupBanner(fileUri: string): Promise<string> {
    try {
      const fileName = `banner-${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // Nova abordagem sem FileSystem (SDK 54+ friendly)
      const response = await fetch(fileUri);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('group-banners')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('[GroupService] Upload Error:', error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('group-banners')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (err) {
      console.error('[GroupService] Upload Exception:', err);
      throw err;
    }
  },

  /**
   * Join a group by Invite Code
   */
  async joinGroup(inviteCode: string, userId: string): Promise<void> {
    const { data: group, error: findError } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (findError || !group) {
      throw new Error('Grupo não encontrado com este código.');
    }

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
      });

    if (joinError) {
      if (joinError.code === '23505') throw new Error('Você já está neste grupo!');
      throw joinError;
    }
  },

  /**
   * Get groups that the user is a member of
   */
  async getUserGroups(userId: string): Promise<Group[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
            group:groups (
                id, name, description, invite_code, created_by, created_at, type, banner_url, start_date, end_date, club_id
            )
        `)
      .eq('user_id', userId);

    if (error) throw error;

    // Flatten result
    // @ts-ignore
    return data.map(item => item.group) as Group[];
  },

  /**
   * Get Leaderboard for a specific group
   */
  async getGroupRanking(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
            joined_at,
            user:users (
                id, full_name, avatar_url, total_points
            )
        `)
      .eq('group_id', groupId);

    if (error) throw error;

    const members = data.map((item: any) => ({
      user_id: item.user.id,
      full_name: item.user.full_name,
      avatar_url: item.user.avatar_url,
      total_points: item.user.total_points,
      joined_at: item.joined_at
    }));

    return members.sort((a, b) => b.total_points - a.total_points);
  }
};
