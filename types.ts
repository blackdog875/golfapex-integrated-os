

export interface Player {
  id: string;
  name: string;
  handicap: number;
  ageGroup: string;
  walletBalance: number;
}

export type RegistrationStatus = 'PAID' | 'PENDING' | 'WAITLIST';

export interface Participant {
  id: string;
  name: string;
  handicap: number;
  status: RegistrationStatus;
}

export interface TeeTime {
  id: string;
  time: string;
  players: Participant[];
  maxPlayers: number;
  fee: number;
}

export interface Tournament {
  id: string;
  title: string;
  tier: 'AMATEUR' | 'CHARITY' | 'LOCAL';
  date: string;
  course: string;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  teeSheet?: TeeTime[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  course: string;
  thru: number;
}

export interface CourseInfo {
  name: string;
  currentPace: 'ahead' | 'on-time' | 'behind';
  paceMinutes: number;
  weather: string;
  holeCount: number;
}

export interface ScorecardHole {
  hole: number;
  par: number;
  score: number | null;
  putts: number | null;
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'hat' | 'memory' | 'equipment';
  recognitionTag?: string;
}

export interface CartItem extends MerchItem {
  quantity: number;
}

