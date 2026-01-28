export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  favorite_club: string | null;
  total_points: number;
  current_ranking: number | null;
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  message: string;
  status?: number;
}
