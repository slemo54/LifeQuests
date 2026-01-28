import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Habit, Reward, UserStats, GameState } from '../types';
import { INITIAL_STATS } from '../constants';

const DEFAULT_USER_ID = 'default_user';

// Convert database row to Habit type
const dbToHabit = (row: any): Habit => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    difficulty: row.difficulty,
    frequency: row.frequency,
    streak: row.streak || 0,
    completedToday: row.completed_today || false,
    lastCompleted: row.last_completed,
    createdAt: row.created_at,
    lastGraceUsed: row.last_grace_used,
    completionDates: row.completion_dates || []
});

// Convert Habit to database row format
const habitToDb = (habit: Habit) => ({
    id: habit.id,
    user_id: DEFAULT_USER_ID,
    title: habit.title,
    description: habit.description,
    difficulty: habit.difficulty,
    frequency: habit.frequency,
    streak: habit.streak,
    completed_today: habit.completedToday,
    last_completed: habit.lastCompleted,
    last_grace_used: habit.lastGraceUsed,
    completion_dates: habit.completionDates
});

// Convert database row to UserStats type
const dbToStats = (row: any): UserStats => ({
    name: row.name || 'Hero',
    classTitle: row.class_title || 'Novice Adventurer',
    level: row.level || 1,
    xp: row.xp || 0,
    nextLevelXp: row.next_level_xp || 100,
    gold: row.gold || 0,
    hp: row.hp || 100,
    maxHp: row.max_hp || 100
});

// Convert database row to Reward type
const dbToReward = (row: any): Reward => ({
    id: row.id,
    title: row.title,
    cost: row.cost,
    icon: row.icon || '🎁'
});

// ============ LOAD FUNCTIONS ============

export const loadGameState = async (): Promise<GameState | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not configured, using localStorage');
        return null;
    }

    try {
        // Load user stats
        const { data: statsData, error: statsError } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', DEFAULT_USER_ID)
            .single();

        if (statsError && statsError.code !== 'PGRST116') {
            console.error('Error loading stats:', statsError);
            return null;
        }

        // Load habits
        const { data: habitsData, error: habitsError } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', DEFAULT_USER_ID)
            .order('created_at', { ascending: true });

        if (habitsError) {
            console.error('Error loading habits:', habitsError);
            return null;
        }

        // Load rewards
        const { data: rewardsData, error: rewardsError } = await supabase
            .from('rewards')
            .select('*')
            .eq('user_id', DEFAULT_USER_ID)
            .order('cost', { ascending: true });

        if (rewardsError) {
            console.error('Error loading rewards:', rewardsError);
            return null;
        }

        const stats = statsData ? dbToStats(statsData) : INITIAL_STATS;
        const habits = (habitsData || []).map(dbToHabit);
        const rewards = (rewardsData || []).map(dbToReward);

        return {
            stats,
            habits,
            rewards,
            history: [],
            lastDailyMessage: statsData?.last_daily_message,
            lastDailyMessageDate: statsData?.last_daily_message_date
        };
    } catch (error) {
        console.error('Error loading game state:', error);
        return null;
    }
};

// ============ SAVE FUNCTIONS ============

export const saveStats = async (stats: UserStats, dailyMessage?: string, dailyMessageDate?: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) return false;

    try {
        const { error } = await supabase
            .from('user_stats')
            .upsert({
                user_id: DEFAULT_USER_ID,
                name: stats.name,
                class_title: stats.classTitle,
                level: stats.level,
                xp: stats.xp,
                next_level_xp: stats.nextLevelXp,
                gold: stats.gold,
                hp: stats.hp,
                max_hp: stats.maxHp,
                last_daily_message: dailyMessage,
                last_daily_message_date: dailyMessageDate,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Error saving stats:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error saving stats:', error);
        return false;
    }
};

export const saveHabit = async (habit: Habit): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) return false;

    try {
        const { error } = await supabase
            .from('habits')
            .upsert(habitToDb(habit), { onConflict: 'id' });

        if (error) {
            console.error('Error saving habit:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error saving habit:', error);
        return false;
    }
};

export const createHabit = async (habit: Habit): Promise<Habit | null> => {
    if (!isSupabaseConfigured() || !supabase) return null;

    try {
        const { data, error } = await supabase
            .from('habits')
            .insert({
                user_id: DEFAULT_USER_ID,
                title: habit.title,
                description: habit.description,
                difficulty: habit.difficulty,
                frequency: habit.frequency,
                streak: habit.streak,
                completed_today: habit.completedToday,
                last_completed: habit.lastCompleted,
                last_grace_used: habit.lastGraceUsed,
                completion_dates: habit.completionDates
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating habit:', error);
            return null;
        }
        return dbToHabit(data);
    } catch (error) {
        console.error('Error creating habit:', error);
        return null;
    }
};

export const deleteHabit = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) return false;

    try {
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting habit:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error deleting habit:', error);
        return false;
    }
};

export const createReward = async (reward: Omit<Reward, 'id'>): Promise<Reward | null> => {
    if (!isSupabaseConfigured() || !supabase) return null;

    try {
        const { data, error } = await supabase
            .from('rewards')
            .insert({
                user_id: DEFAULT_USER_ID,
                title: reward.title,
                cost: reward.cost,
                icon: reward.icon
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating reward:', error);
            return null;
        }
        return dbToReward(data);
    } catch (error) {
        console.error('Error creating reward:', error);
        return null;
    }
};

export const updateReward = async (reward: Reward): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) return false;

    try {
        const { error } = await supabase
            .from('rewards')
            .update({
                title: reward.title,
                cost: reward.cost,
                icon: reward.icon,
                updated_at: new Date().toISOString()
            })
            .eq('id', reward.id);

        if (error) {
            console.error('Error updating reward:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error updating reward:', error);
        return false;
    }
};

export const deleteReward = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) return false;

    try {
        const { error } = await supabase
            .from('rewards')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting reward:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error deleting reward:', error);
        return false;
    }
};

// ============ BATCH UPDATES ============

export const resetDailyStatus = async (): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) return false;

    try {
        const { error } = await supabase
            .from('habits')
            .update({ completed_today: false })
            .eq('user_id', DEFAULT_USER_ID);

        if (error) {
            console.error('Error resetting daily status:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error resetting daily status:', error);
        return false;
    }
};

export const updateHabitsHealth = async (habits: Habit[]): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) return false;

    try {
        for (const habit of habits) {
            await saveHabit(habit);
        }
        return true;
    } catch (error) {
        console.error('Error updating habits health:', error);
        return false;
    }
};

// ============ BACKUP/RESTORE FUNCTIONS ============

export const exportGameState = (gameState: GameState): void => {
    const dataStr = JSON.stringify(gameState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `questbound-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
};

export const validateGameState = (data: any): data is GameState => {
    return (
        data &&
        typeof data === 'object' &&
        Array.isArray(data.habits) &&
        Array.isArray(data.rewards) &&
        data.stats &&
        typeof data.stats.name === 'string' &&
        typeof data.stats.level === 'number'
    );
};

export const resetAllProgress = async (): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        localStorage.removeItem('questbound_state');
        return true;
    }

    try {
        // Delete all habits
        await supabase
            .from('habits')
            .delete()
            .eq('user_id', DEFAULT_USER_ID);

        // Delete all rewards
        await supabase
            .from('rewards')
            .delete()
            .eq('user_id', DEFAULT_USER_ID);

        // Reset stats
        await supabase
            .from('user_stats')
            .upsert({
                user_id: DEFAULT_USER_ID,
                ...INITIAL_STATS,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        localStorage.removeItem('questbound_state');
        return true;
    } catch (error) {
        console.error('Error resetting progress:', error);
        return false;
    }
};
export const importGameState = async (gameState: GameState): Promise<boolean> => {
    if (!validateGameState(gameState)) return false;

    try {
        await resetAllProgress();

        // Save stats
        await saveStats(gameState.stats);

        // Save habits
        if (isSupabaseConfigured() && supabase) {
            for (const habit of gameState.habits) {
                await supabase.from('habits').insert(habitToDb(habit));
            }
            for (const reward of gameState.rewards) {
                await supabase.from('rewards').insert({
                    user_id: DEFAULT_USER_ID,
                    title: reward.title,
                    cost: reward.cost,
                    icon: reward.icon || '🎁'
                });
            }
        } else {
            localStorage.setItem('questbound_state', JSON.stringify(gameState));
        }

        return true;
    } catch (error) {
        console.error('Error importing game state:', error);
        return false;
    }
};
