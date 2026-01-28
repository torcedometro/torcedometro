export interface Stadium {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export interface Game {
  id: string;
  stadium_id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'finished';
  stadium?: Stadium; // Joined data
}
