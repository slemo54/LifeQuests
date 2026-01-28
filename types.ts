
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Frequency = 'Daily' | 'Every 2 Days' | 'Weekly';

export interface Habit {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  frequency: Frequency;
  streak: number;
  completedToday: boolean;
  lastCompleted: string | null; // ISO Date
  createdAt: string;
  lastGraceUsed?: string | null; // ISO Date
  completionDates: string[]; // History of all completion dates
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
}

export interface UserStats {
  name: string;
  classTitle: string; // E.g. Novice, Paladin, High Lord
  level: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
  hp: number;
  maxHp: number;
}

export interface GameState {
  habits: Habit[];
  rewards: Reward[];
  stats: UserStats;
  history: { date: string; completedCount: number }[];
  lastDailyMessage?: string; // Store message to avoid re-fetching on reload
  lastDailyMessageDate?: string;
}

export type AppView = 'dashboard' | 'spirit-guide' | 'shop' | 'analytics';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'level-up';
}
