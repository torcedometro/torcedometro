import { Game } from './game';
import { Group } from '../services/group';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  AppTabs: { screen?: string };
  Home: { username: string };
  Profile: undefined; // Tab
  ProfileTab: undefined; // Alias se tiver
  CheckIn: { game: Game };
  Ranking: undefined;
  Groups: { mode?: 'CREATE' | 'JOIN' } | undefined;
  GroupDetail: { group: Group } | { groupId: string; groupName: string };
  SideMenu: undefined;
  CreateGroupSelector: undefined;
  CreateEventGroup: undefined;
  CreateCommunityGroup: undefined;
};
