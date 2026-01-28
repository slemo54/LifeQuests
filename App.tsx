
import React, { useState, useEffect, useCallback } from 'react';
import { Habit, Reward, UserStats, GameState, AppView, ToastMessage } from './types';
import { INITIAL_STATS, XP_MAP, GOLD_MAP, CLASS_TIERS } from './constants';
import StatsHeader from './components/StatsHeader';
import HabitCard from './components/HabitCard';
import SpiritGuide from './components/SpiritGuide';
import RewardStore from './components/RewardStore';
import AddHabitModal from './components/AddHabitModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ToastContainer from './components/ToastContainer';
import DailyBriefingModal from './components/DailyBriefingModal';
import LevelUpModal, { LevelUpData } from './components/LevelUpModal';
import { getDailyBriefing } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('questbound_state');
    if (saved) return JSON.parse(saved);
    return {
      habits: [],
      rewards: [
        { id: '1', title: 'Treat Yourself (Coffee)', cost: 30, icon: '☕' },
        { id: '2', title: '1 Hour of Netflix', cost: 100, icon: '📺' },
        { id: '3', title: 'New Gaming Gear', cost: 5000, icon: '🎧' },
      ],
      stats: INITIAL_STATS,
      history: []
    };
  });

  const [view, setView] = useState<AppView>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // New States for Gamification
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [dailyMessage, setDailyMessage] = useState('');
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('questbound_state', JSON.stringify(gameState));
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
      for(let i=0; i<50; i++) {
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
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('questbound_last_login');
    
    // Logic for Daily Briefing
    const checkDailyBriefing = async () => {
        if (gameState.habits.length > 0 && gameState.lastDailyMessageDate !== today) {
            // Check if we already fetched it but just didn't show it (if using persisted state)
            // But usually we just fetch fresh
            const briefing = await getDailyBriefing(gameState.stats, gameState.habits);
            setDailyMessage(briefing);
            setDailyModalOpen(true);
            
            setGameState(prev => ({
                ...prev,
                lastDailyMessage: briefing,
                lastDailyMessageDate: today
            }));
        }
    };
    
    // Only run expensive logic if day changed
    if (lastLogin && lastLogin !== today) {
      setGameState(prev => {
        // 1. Regenerate HP
        const newHp = Math.min(prev.stats.maxHp, prev.stats.hp + 10);
        
        // 2. Process Habits
        const updatedHabits = prev.habits.map(h => {
           const baseUpdate = { ...h, completedToday: false };

           if (!h.lastCompleted) return baseUpdate;

           const d1 = new Date(h.lastCompleted);
           const d2 = new Date(today);
           d1.setHours(0,0,0,0);
           d2.setHours(0,0,0,0);
           
           const diffDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
           
           if (h.frequency === 'Weekly' && diffDays <= 7) return baseUpdate;
           if (h.frequency === 'Every 2 Days' && diffDays <= 2) return baseUpdate;

           if (diffDays <= 1) {
               return baseUpdate;
           } else if (diffDays === 2) {
               // Missed one day. Check Divine Shield.
               const lastGrace = h.lastGraceUsed ? new Date(h.lastGraceUsed) : null;
               if (lastGrace) lastGrace.setHours(0,0,0,0);
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

        return {
          ...prev,
          stats: { ...prev.stats, hp: newHp },
          habits: updatedHabits
        };
      });
      
      checkDailyBriefing();
    } else {
        // Even if same day, show modal if we haven't seen it in this session (simplified check)
        // Or if we have a stored message for today but user refreshed
        if (gameState.habits.length > 0 && gameState.lastDailyMessageDate !== today) {
            checkDailyBriefing();
        }
    }
    localStorage.setItem('questbound_last_login', today);
  }, []);

  const addHabit = (habitData: Partial<Habit>) => {
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
    setGameState(prev => ({ ...prev, habits: [...prev.habits, habit] }));
    addToast("Quest Accepted", `${habit.title} has been added to your log.`, 'success');
  };

  const completeHabit = (id: string) => {
    triggerShake();
    
    setGameState(prev => {
      const habit = prev.habits.find(h => h.id === id);
      if (!habit || habit.completedToday) return prev;

      const xpGain = XP_MAP[habit.difficulty];
      const goldGain = GOLD_MAP[habit.difficulty];
      const today = new Date().toISOString().split('T')[0];
      const newStreak = habit.streak + 1;
      
      let { xp, level, nextLevelXp, gold, classTitle } = prev.stats;
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
      // Condition: Difficulty is Easy AND Streak > 3 AND Streak is a multiple of 5 (5, 10, 15...)
      if (habit.difficulty === 'Easy' && newStreak > 3 && newStreak % 5 === 0) {
          setTimeout(() => {
             // We use window.confirm as the "Smart Popup" to prompt the user
             const confirmed = window.confirm(
                 `⚔️ QUEST UPGRADE AVAILABLE! ⚔️\n\n` +
                 `You have completed "${habit.title}" for ${newStreak} days straight!\n` +
                 `You seem ready for a greater challenge.\n\n` +
                 `Upgrade difficulty to MEDIUM?\n` +
                 `(Rewards increase: +25 XP / +15 Gold)`
             );

             if(confirmed) {
                 setGameState(g => ({
                     ...g,
                     habits: g.habits.map(h => h.id === id ? { ...h, difficulty: 'Medium' } : h)
                 }));
                 addToast("Difficulty Increased", "The path grows steeper, but the glory greater!", 'success');
                 triggerConfetti();
             }
          }, 1000); // 1 second delay to let the completion animation finish
      }

      // Level up check
      if (xp >= nextLevelXp) {
        level += 1;
        xp -= nextLevelXp;
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
        triggerConfetti();
        
        let rewardText = `Level ${level} Reached!`;
        
        // Class Evolution
        const newClass = CLASS_TIERS.slice().reverse().find(t => level >= t.level);
        if (newClass && newClass.title !== classTitle) {
            classTitle = newClass.title;
            rewardText += `\nClass Evolved: ${classTitle}`;
        }

        setLevelUpData({
            type: 'level',
            title: 'LEVEL UP!',
            subtitle: `You are now a Level ${level} ${classTitle}`,
            rewards: 'Full HP Restored'
        });
        
        // Heal on level up
        prev.stats.hp = prev.stats.maxHp;
      }

      return {
        ...prev,
        stats: { ...prev.stats, xp, level, nextLevelXp, gold, classTitle, hp: prev.stats.hp },
        habits: prev.habits.map(h => 
          h.id === id 
            ? { 
                ...h, 
                completedToday: true, 
                streak: newStreak, 
                lastCompleted: today,
                completionDates: [...(h.completionDates || []), today]
              } 
            : h
        )
      };
    });
  };

  const skipHabit = (id: string) => {
      const habit = gameState.habits.find(h => h.id === id);
      if(!habit) return;

      const lastGrace = habit.lastGraceUsed ? new Date(habit.lastGraceUsed) : null;
      const today = new Date();
      const diffTime = lastGrace ? Math.abs(today.getTime() - lastGrace.getTime()) : 99999999999;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays <= 7) {
          addToast("Cooldown Active", "Divine Shield needs time to recharge.", 'warning');
          return;
      }

      if(window.confirm("Use Divine Shield to skip this quest today? You won't gain XP, but your streak will be safe.")) {
          setGameState(prev => ({
              ...prev,
              habits: prev.habits.map(h => h.id === id ? {
                  ...h,
                  completedToday: true,
                  lastGraceUsed: new Date().toISOString()
              } : h)
          }));
          addToast("Divine Shield Activated", "Streak protected. Rest well, hero.", 'info');
      }
  };

  const deleteHabit = (id: string) => {
    if(window.confirm("Are you sure you want to abandon this quest?")) {
        setGameState(prev => ({
        ...prev,
        habits: prev.habits.filter(h => h.id !== id)
        }));
    }
  };

  const purchaseReward = (reward: Reward) => {
    if (gameState.stats.gold < reward.cost) return;
    setGameState(prev => ({
      ...prev,
      stats: { ...prev.stats, gold: prev.stats.gold - reward.cost }
    }));
    triggerConfetti();
    addToast("Item Acquired", `${reward.title} added to inventory.`, 'success');
  };

  const addReward = (reward: Omit<Reward, 'id'>) => {
    setGameState(prev => ({
      ...prev,
      rewards: [...prev.rewards, { ...reward, id: Date.now().toString() }]
    }));
  };

  return (
    <div className={`min-h-screen pb-24 bg-slate-950 text-slate-100 selection:bg-yellow-500/30 ${isShaking ? 'screen-shake' : ''}`}>
      <StatsHeader stats={gameState.stats} />
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
                    onDelete={deleteHabit}
                    onSkip={skipHabit}
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
            />
          </div>
        )}
      </main>

      <AddHabitModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={addHabit} 
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
