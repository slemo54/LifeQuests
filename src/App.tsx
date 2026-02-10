
import React, { useState, useEffect, useCallback } from 'react';
import { Habit, Reward, UserStats, GameState, AppView, ToastMessage } from './types';
import { INITIAL_STATS, XP_MAP, GOLD_MAP, CLASS_TIERS } from './constants';
import StatsHeader from './components/StatsHeader';
import HabitCard from './components/HabitCard';
import SpiritGuide from './components/SpiritGuide';
import RewardStore from './components/RewardStore';
import AddHabitModal from './components/AddHabitModal';
import EditHabitModal from './components/EditHabitModal';
import EditRewardModal from './components/EditRewardModal';
import SettingsModal from './components/SettingsModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ToastContainer from './components/ToastContainer';
import DailyBriefingModal from './components/DailyBriefingModal';
import LevelUpModal, { LevelUpData } from './components/LevelUpModal';
import { getDailyBriefing } from './services/geminiService';
import {
  loadGameState,
  saveStats,
  saveHabit,
  createHabit,
  deleteHabit as deleteHabitFromDb,
  createReward,
  updateReward,
  deleteReward,
  resetDailyStatus,
  updateHabitsHealth,
  exportGameState,
  importGameState,
  validateGameState,
  resetAllProgress
} from './services/dataService';

import { isSupabaseConfigured } from './services/supabaseClient';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // New States for Gamification
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [dailyMessage, setDailyMessage] = useState('');
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Edit Habit States
  const [showEditHabitModal, setShowEditHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Edit Reward States
  const [showEditRewardModal, setShowEditRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Settings State
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);

      // Try to load from Supabase first
      if (isSupabaseConfigured()) {
        const cloudState = await loadGameState();
        if (cloudState) {
          setGameState(cloudState);
          // Also save to localStorage as backup
          localStorage.setItem('questbound_state', JSON.stringify(cloudState));
          setIsLoading(false);
          return;
        }
      }

      // Fallback to localStorage
      const saved = localStorage.getItem('questbound_state');
      if (saved) {
        setGameState(JSON.parse(saved));
      } else {
        // Initialize fresh state
        setGameState({
          habits: [],
          rewards: [
            { id: '1', title: 'Treat Yourself (Coffee)', cost: 30, icon: '☕' },
            { id: '2', title: '1 Hour of Netflix', cost: 100, icon: '📺' },
            { id: '3', title: 'New Gaming Gear', cost: 5000, icon: '🎧' },
          ],
          stats: INITIAL_STATS,
          history: []
        });
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Save to localStorage whenever gameState changes
  useEffect(() => {
    if (gameState) {
      localStorage.setItem('questbound_state', JSON.stringify(gameState));
    }
  }, [gameState]);

  const addToast = (title: string, message: string, type: ToastMessage['type']) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerConfetti = () => {
    const colors = ['#eab308', '#3b82f6', '#ef4444', '#10b981', '#f97316'];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (Math.random() * 2 + 1) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Daily reset check, Streak Logic, and HP Regen + Daily Briefing Trigger
  useEffect(() => {
    if (!gameState) return;

    const today = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('questbound_last_login');

    // Logic for Daily Briefing
    const checkDailyBriefing = async () => {
      if (gameState.habits.length > 0 && gameState.lastDailyMessageDate !== today) {
        const briefing = await getDailyBriefing(gameState.stats, gameState.habits);
        setDailyMessage(briefing);
        setDailyModalOpen(true);

        setGameState(prev => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            lastDailyMessage: briefing,
            lastDailyMessageDate: today
          };
          // Save to Supabase
          saveStats(updated.stats, briefing, today);
          return updated;
        });
      }
    };

    // Only run expensive logic if day changed
    if (lastLogin && lastLogin !== today) {
      setGameState(prev => {
        if (!prev) return prev;

        // 1. Regenerate HP
        const newHp = Math.min(prev.stats.maxHp, prev.stats.hp + 10);

        // 2. Process Habits
        const updatedHabits = prev.habits.map(h => {
          const baseUpdate = { ...h, completedToday: false };

          if (!h.lastCompleted) return baseUpdate;

          const d1 = new Date(h.lastCompleted);
          const d2 = new Date(today);
          d1.setHours(0, 0, 0, 0);
          d2.setHours(0, 0, 0, 0);

          const diffDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

          if (h.frequency === 'Weekly' && diffDays <= 7) return baseUpdate;
          if (h.frequency === 'Every 2 Days' && diffDays <= 2) return baseUpdate;

          if (diffDays <= 1) {
            return baseUpdate;
          } else if (diffDays === 2) {
            // Missed one day. Check Divine Shield.
            const lastGrace = h.lastGraceUsed ? new Date(h.lastGraceUsed) : null;
            if (lastGrace) lastGrace.setHours(0, 0, 0, 0);
            const daysSinceGrace = lastGrace
              ? Math.floor((d2.getTime() - lastGrace.getTime()) / (1000 * 60 * 60 * 24))
              : 999;

            if (daysSinceGrace > 7) {
              return { ...baseUpdate, lastGraceUsed: today };
            } else {
              return { ...baseUpdate, streak: 0 };
            }
          } else {
            return { ...baseUpdate, streak: 0 };
          }
        });

        // Save updates to Supabase
        const newStats = { ...prev.stats, hp: newHp };
        saveStats(newStats);
        updateHabitsHealth(updatedHabits);

        return {
          ...prev,
          stats: newStats,
          habits: updatedHabits
        };
      });

      checkDailyBriefing();
    } else {
      // Even if same day, show modal if we haven't seen it in this session
      if (gameState.habits.length > 0 && gameState.lastDailyMessageDate !== today) {
        checkDailyBriefing();
      }
    }
    localStorage.setItem('questbound_last_login', today);
  }, [gameState?.habits.length]);

  const addHabit = async (habitData: Partial<Habit>) => {
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      title: habitData.title!,
      description: habitData.description || '',
      difficulty: habitData.difficulty || 'Easy',
      frequency: habitData.frequency || 'Daily',
      streak: 0,
      completedToday: false,
      lastCompleted: null,
      createdAt: new Date().toISOString(),
      lastGraceUsed: null,
      completionDates: []
    };

    // Try to save to Supabase first
    const savedHabit = await createHabit(habit);
    const finalHabit = savedHabit || habit;

    setGameState(prev => {
      if (!prev) return prev;
      return { ...prev, habits: [...prev.habits, finalHabit] };
    });
    addToast("Quest Accepted", `${habit.title} has been added to your log.`, 'success');
  };

  const completeHabit = async (id: string) => {
    if (!gameState) return;

    triggerShake();

    const habit = gameState.habits.find(h => h.id === id);
    if (!habit || habit.completedToday) return;

    const xpGain = XP_MAP[habit.difficulty];
    const goldGain = GOLD_MAP[habit.difficulty];
    const today = new Date().toISOString().split('T')[0];
    const newStreak = habit.streak + 1;

    let { xp, level, nextLevelXp, gold, classTitle, hp, maxHp, name } = gameState.stats;
    xp += xpGain;
    gold += goldGain;

    // Basic Success Toast
    addToast("Quest Complete!", `+${xpGain} XP | +${goldGain} Gold`, 'success');

    // MILESTONE CHECKS
    if (newStreak === 7) {
      triggerConfetti();
      setLevelUpData({
        type: 'milestone',
        title: '7 Day Champion!',
        subtitle: 'Consistency is your weapon.',
        rewards: '+50 Gold Bonus'
      });
      gold += 50;
    } else if (newStreak === 14) {
      triggerConfetti();
      setLevelUpData({
        type: 'milestone',
        title: '2 Week Warrior!',
        subtitle: 'Your discipline is forged in steel.',
        rewards: '+150 Gold Bonus'
      });
      gold += 150;
    } else if (newStreak === 30) {
      triggerConfetti();
      setLevelUpData({
        type: 'milestone',
        title: 'Legendary Status!',
        subtitle: 'A month of mastery. You are a hero.',
        rewards: '+500 Gold & +200 XP'
      });
      gold += 500;
      xp += 200;
    }

    // SMART DIFFICULTY SCALING SUGGESTION
    if (habit.difficulty === 'Easy' && newStreak > 3 && newStreak % 5 === 0) {
      setTimeout(() => {
        const confirmed = window.confirm(
          `⚔️ QUEST UPGRADE AVAILABLE! ⚔️\n\n` +
          `You have completed "${habit.title}" for ${newStreak} days straight!\n` +
          `You seem ready for a greater challenge.\n\n` +
          `Upgrade difficulty to MEDIUM?\n` +
          `(Rewards increase: +25 XP / +15 Gold)`
        );

        if (confirmed) {
          setGameState(g => {
            if (!g) return g;
            const updatedHabits = g.habits.map(h => {
              if (h.id === id) {
                const upgraded = { ...h, difficulty: 'Medium' as const };
                saveHabit(upgraded);
                return upgraded;
              }
              return h;
            });
            return { ...g, habits: updatedHabits };
          });
          addToast("Difficulty Increased", "The path grows steeper, but the glory greater!", 'success');
          triggerConfetti();
        }
      }, 1000);
    }

    // Level up check
    if (xp >= nextLevelXp) {
      level += 1;
      xp -= nextLevelXp;
      nextLevelXp = Math.floor(nextLevelXp * 1.5);
      triggerConfetti();

      // Class Evolution
      const newClass = CLASS_TIERS.slice().reverse().find(t => level >= t.level);
      if (newClass && newClass.title !== classTitle) {
        classTitle = newClass.title;
      }

      setLevelUpData({
        type: 'level',
        title: 'LEVEL UP!',
        subtitle: `You are now a Level ${level} ${classTitle}`,
        rewards: 'Full HP Restored'
      });

      // Heal on level up
      hp = maxHp;
    }

    const newStats = { name, classTitle, level, xp, nextLevelXp, gold, hp, maxHp };
    const updatedHabit: Habit = {
      ...habit,
      completedToday: true,
      streak: newStreak,
      lastCompleted: today,
      completionDates: [...(habit.completionDates || []), today]
    };

    // Save to Supabase
    saveStats(newStats);
    saveHabit(updatedHabit);

    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        stats: newStats,
        habits: prev.habits.map(h => h.id === id ? updatedHabit : h)
      };
    });
  };

  const skipHabit = async (id: string) => {
    if (!gameState) return;

    const habit = gameState.habits.find(h => h.id === id);
    if (!habit) return;

    const lastGrace = habit.lastGraceUsed ? new Date(habit.lastGraceUsed) : null;
    const today = new Date();
    const diffTime = lastGrace ? Math.abs(today.getTime() - lastGrace.getTime()) : 99999999999;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      addToast("Cooldown Active", "Divine Shield needs time to recharge.", 'warning');
      return;
    }

    if (window.confirm("Use Divine Shield to skip this quest today? You won't gain XP, but your streak will be safe.")) {
      const updatedHabit: Habit = {
        ...habit,
        completedToday: true,
        lastGraceUsed: new Date().toISOString()
      };

      // Save to Supabase
      saveHabit(updatedHabit);

      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          habits: prev.habits.map(h => h.id === id ? updatedHabit : h)
        };
      });
      addToast("Divine Shield Activated", "Streak protected. Rest well, hero.", 'info');
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (window.confirm("Are you sure you want to abandon this quest?")) {
      // Delete from Supabase
      await deleteHabitFromDb(id);

      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          habits: prev.habits.filter(h => h.id !== id)
        };
      });
    }
  };

  const handleEditHabit = (id: string) => {
    const habit = gameState?.habits.find(h => h.id === id);
    if (habit) {
      setEditingHabit(habit);
      setShowEditHabitModal(true);
    }
  };

  const updateHabit = async (updatedHabit: Habit) => {
    const success = await saveHabit(updatedHabit);

    if (success) {
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          habits: prev.habits.map(h => h.id === updatedHabit.id ? updatedHabit : h)
        };
      });
      addToast("Quest Modified", `${updatedHabit.title} has been updated.`, 'success');
    } else {
      addToast("Update Failed", "Could not save changes. Try again.", 'warning');
    }

    setShowEditHabitModal(false);
    setEditingHabit(null);
  };

  const undoCompletion = async (id: string) => {
    if (!gameState) return;

    const habit = gameState.habits.find(h => h.id === id);
    if (!habit || !habit.completedToday) return;

    const today = new Date().toISOString().split('T')[0];

    if (!window.confirm(
      `⚠️ UNDO QUEST COMPLETION? ⚠️\n\n` +
      `This will reverse today's completion of "${habit.title}".\n\n` +
      `You will lose:\n` +
      `- ${XP_MAP[habit.difficulty]} XP\n` +
      `- ${GOLD_MAP[habit.difficulty]} Gold\n` +
      `- 1 Streak Day\n\n` +
      `Are you sure?`
    )) {
      return;
    }

    const xpLoss = XP_MAP[habit.difficulty];
    const goldLoss = GOLD_MAP[habit.difficulty];

    let { xp, gold, level, nextLevelXp, hp, maxHp, name, classTitle } = gameState.stats;

    xp = Math.max(0, xp - xpLoss);
    gold = Math.max(0, gold - goldLoss);
    const newStreak = Math.max(0, habit.streak - 1);
    const updatedCompletionDates = (habit.completionDates || []).filter(date => date !== today);

    const updatedHabit: Habit = {
      ...habit,
      completedToday: false,
      streak: newStreak,
      completionDates: updatedCompletionDates,
    };

    const newStats = { name, classTitle, level, xp, nextLevelXp, gold, hp, maxHp };

    await saveStats(newStats);
    await saveHabit(updatedHabit);

    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        stats: newStats,
        habits: prev.habits.map(h => h.id === id ? updatedHabit : h)
      };
    });

    addToast("Completion Undone", `${habit.title} marked incomplete.`, 'info');
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setShowEditRewardModal(true);
  };

  const updateRewardHandler = async (updatedReward: Reward) => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        rewards: prev.rewards.map(r => r.id === updatedReward.id ? updatedReward : r)
      };
    });

    const success = await updateReward(updatedReward);

    if (success) {
      addToast("Reward Modified", `${updatedReward.title} has been updated.`, 'success');
    } else {
      addToast("Reward Modified", `${updatedReward.title} has been updated locally.`, 'success');
    }

    setShowEditRewardModal(false);
    setEditingReward(null);
  };

  const handleDeleteReward = async (id: string) => {
    const reward = gameState?.rewards.find(r => r.id === id);
    if (!reward) return;

    if (window.confirm(`Remove "${reward.title}" from the bazaar?`)) {
      const success = await deleteReward(id);

      if (success) {
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            rewards: prev.rewards.filter(r => r.id !== id)
          };
        });
        addToast("Reward Removed", `${reward.title} removed from shop.`, 'info');
      } else {
        addToast("Deletion Failed", "Could not remove reward. Try again.", 'warning');
      }
    }
  };

  const handleUpdatePlayerName = async (newName: string) => {
    if (!newName.trim() || !gameState) return;

    const newStats = { ...gameState.stats, name: newName };
    const success = await saveStats(newStats);

    if (success) {
      setGameState(prev => {
        if (!prev) return prev;
        return { ...prev, stats: newStats };
      });
      addToast("Identity Updated", `Welcome, ${newName}!`, 'success');
    } else {
      addToast("Update Failed", "Could not save name. Try again.", 'warning');
    }
  };

  const handleResetProgress = async () => {
    const confirmed = window.confirm(
      `⚠️ RESET ALL PROGRESS? ⚠️\n\n` +
      `This will permanently delete:\n` +
      `- All quests and habits\n` +
      `- All rewards\n` +
      `- Your stats, level, and gold\n` +
      `- All progress history\n\n` +
      `Type "RESET" to confirm.`
    );

    if (!confirmed) return;

    const confirmText = prompt("Type RESET to confirm:");
    if (confirmText !== "RESET") {
      addToast("Reset Cancelled", "Progress preserved.", 'info');
      return;
    }

    const success = await resetAllProgress();

    if (success) {
      setGameState({
        habits: [],
        rewards: [],
        stats: INITIAL_STATS,
        history: []
      });
      addToast("Progress Reset", "Your journey begins anew.", 'info');
      setShowSettingsModal(false);
    } else {
      addToast("Reset Failed", "Could not reset progress. Try again.", 'warning');
    }
  };

  const handleExport = () => {
    if (gameState) {
      exportGameState(gameState);
      addToast("Data Exported", "Backup saved to downloads.", 'success');
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (validateGameState(data)) {
          setIsLoading(true);
          const success = await importGameState(data);

          if (success) {
            setGameState(data);
            addToast("Data Restored", "Your journey has been successfully restored.", 'success');
            setShowSettingsModal(false);
          } else {
            addToast("Restore Failed", "Could not synchronize with the cloud.", 'warning');
          }
          setIsLoading(false);
        } else {
          addToast("Import Failed", "Invalid save file format.", 'warning');
        }
      } catch (error) {
        addToast("Import Failed", "Could not read save file.", 'warning');
      }
    };
    reader.readAsText(file);
  };


  const purchaseReward = async (reward: Reward) => {
    if (!gameState) return;

    const newStats = { ...gameState.stats, gold: gameState.stats.gold - reward.cost };

    // Save to Supabase
    saveStats(newStats);

    setGameState(prev => {
      if (!prev) return prev;
      return { ...prev, stats: newStats };
    });
    triggerConfetti();
    addToast("Item Acquired", `${reward.title} added to inventory.`, 'success');
  };

  const addReward = async (reward: Omit<Reward, 'id'>) => {
    // Try to save to Supabase first
    const savedReward = await createReward(reward);
    const finalReward = savedReward || { ...reward, id: Date.now().toString() };

    setGameState(prev => {
      if (!prev) return prev;
      return { ...prev, rewards: [...prev.rewards, finalReward] };
    });
  };

  // Loading state
  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="cinzel text-xl text-slate-400">Loading your quest log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 bg-slate-950 text-slate-100 selection:bg-yellow-500/30 ${isShaking ? 'screen-shake' : ''}`}>
      <StatsHeader stats={gameState.stats} onOpenSettings={() => setShowSettingsModal(true)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <DailyBriefingModal
        isOpen={dailyModalOpen}
        message={dailyMessage}
        onClose={() => setDailyModalOpen(false)}
      />

      <LevelUpModal
        data={levelUpData}
        onClose={() => setLevelUpData(null)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setView('dashboard')}
            className={`px-6 py-2 rounded-full font-bold cinzel border-2 transition-all shrink-0
              ${view === 'dashboard' ? 'bg-yellow-600 border-yellow-500 text-white' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            Quest Board
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`px-6 py-2 rounded-full font-bold cinzel border-2 transition-all shrink-0
              ${view === 'analytics' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            Chronicles
          </button>
          <button
            onClick={() => setView('spirit-guide')}
            className={`px-6 py-2 rounded-full font-bold cinzel border-2 transition-all shrink-0
              ${view === 'spirit-guide' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            Spirit Guide
          </button>
          <button
            onClick={() => setView('shop')}
            className={`px-6 py-2 rounded-full font-bold cinzel border-2 transition-all shrink-0
              ${view === 'shop' ? 'bg-amber-700 border-amber-600 text-white' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            The Bazaar
          </button>
        </div>

        {view === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex justify-between items-center">
              <h2 className="cinzel text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">Active Quests</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold border border-slate-700 transition-all flex items-center gap-2 text-sm md:text-base shadow-lg hover:shadow-yellow-500/10"
              >
                🗡️ New Quest
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameState.habits.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
                  <div className="text-6xl grayscale opacity-30">📜</div>
                  <h3 className="cinzel text-xl text-slate-500">Your quest log is empty, hero.</h3>
                  <p className="text-slate-600">Commission a quest to begin your legend.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-yellow-500 font-bold hover:underline"
                  >
                    Start a new quest
                  </button>
                </div>
              ) : (
                gameState.habits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={completeHabit}
                    onDelete={handleDeleteHabit}
                    onSkip={skipHabit}
                    onEdit={handleEditHabit}
                    onUndo={undoCompletion}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {view === 'analytics' && (
          <AnalyticsDashboard habits={gameState.habits} stats={gameState.stats} />
        )}

        {view === 'spirit-guide' && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8 text-center space-y-4">
              <h2 className="cinzel text-3xl font-bold text-indigo-400">The Ethereal Plane</h2>
              <p className="text-slate-400 italic">"Seek the guide when the path is clouded by shadow."</p>
            </div>
            <SpiritGuide stats={gameState.stats} habits={gameState.habits} />
          </div>
        )}

        {view === 'shop' && (
          <div className="animate-in fade-in duration-500">
            <RewardStore
              gold={gameState.stats.gold}
              onPurchase={purchaseReward}
              rewards={gameState.rewards}
              onAddReward={addReward}
              onEditReward={handleEditReward}
              onDeleteReward={handleDeleteReward}
            />
          </div>
        )}
      </main>

      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addHabit}
      />

      <EditHabitModal
        isOpen={showEditHabitModal}
        onClose={() => {
          setShowEditHabitModal(false);
          setEditingHabit(null);
        }}
        onSave={updateHabit}
        habit={editingHabit}
      />

      <EditRewardModal
        isOpen={showEditRewardModal}
        onClose={() => {
          setShowEditRewardModal(false);
          setEditingReward(null);
        }}
        onSave={updateRewardHandler}
        reward={editingReward}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        stats={gameState.stats}
        onUpdateName={handleUpdatePlayerName}
        onResetProgress={handleResetProgress}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Footer */}
      <footer className="w-full text-center py-4 text-slate-600 font-medium text-xs md:text-sm uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity">
        Created by Anselmo Acquah
      </footer>

      {/* Floating Action Button for mobile view toggle */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => setView(view === 'dashboard' ? 'spirit-guide' : 'dashboard')}
          className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40 border-2 border-slate-950 text-white"
        >
          {view === 'dashboard' ? '🔮' : '⚔️'}
        </button>
      </div>
    </div>
  );
};

export default App;
