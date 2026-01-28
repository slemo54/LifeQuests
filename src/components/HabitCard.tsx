
import React, { useState } from 'react';
import { Habit } from '../types';
import { Icons, XP_MAP, GOLD_MAP } from '../constants';

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onSkip: (id: string) => void;
  onEdit: (id: string) => void;
  onUndo: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, onDelete, onSkip, onEdit, onUndo }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatText, setFloatText] = useState<{x: number, y: number, text: string} | null>(null);

  const handleComplete = (e: React.MouseEvent) => {
    // Determine rewards for display
    const xp = XP_MAP[habit.difficulty];
    const gold = GOLD_MAP[habit.difficulty];

    // Trigger floating text
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFloatText({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        text: `+${xp} XP  +${gold} Gold`
    });

    setIsAnimating(true);
    
    setTimeout(() => {
        onComplete(habit.id);
        setIsAnimating(false);
        setFloatText(null);
    }, 600);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 border-emerald-900/50 bg-emerald-900/10';
      case 'Medium': return 'text-amber-400 border-amber-900/50 bg-amber-900/10';
      case 'Hard': return 'text-rose-400 border-rose-900/50 bg-rose-900/10';
      default: return 'text-slate-400';
    }
  };

  const getShieldStatus = () => {
    if (!habit.lastGraceUsed) return 'Ready';
    const lastGrace = new Date(habit.lastGraceUsed);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastGrace.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 7 ? 'Ready' : `Cooldown ${8 - diffDays}d`;
  };

  const shieldStatus = getShieldStatus();

  return (
    <div className={`rpg-card p-5 rounded-xl transition-all duration-300 group relative overflow-hidden ${habit.completedToday ? 'opacity-60 grayscale' : 'hover:scale-[1.02]'} ${isAnimating ? 'ring-4 ring-yellow-500 scale-105 bg-yellow-900/20' : ''}`}>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Icons.Sword />
      </div>

      <div className="flex justify-between items-start gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getDifficultyColor(habit.difficulty)}`}>
              {habit.difficulty}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border text-indigo-400 border-indigo-900/50 bg-indigo-900/10">
                {habit.frequency}
            </span>
            <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                <span className="text-orange-500 text-xs">🔥 {habit.streak}</span>
            </div>
             <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${
                 shieldStatus === 'Ready' 
                 ? 'text-cyan-400 border-cyan-900/50 bg-cyan-900/10' 
                 : 'text-slate-500 border-slate-700/50 bg-slate-800/30'
             }`}>
                <Icons.Shield />
                <span>{shieldStatus === 'Ready' ? 'Shielded' : shieldStatus}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-yellow-500 transition-colors truncate pr-2">{habit.title}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{habit.description}</p>
        </div>

        <div className="flex flex-col gap-2 shrink-0 relative">
            <button 
            onClick={handleComplete}
            disabled={habit.completedToday}
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-lg relative overflow-visible
                ${habit.completedToday 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 active:scale-95 shadow-yellow-500/20'
                }`}
            >
            {habit.completedToday ? (
                <Icons.Check />
            ) : (
                <Icons.Sword />
            )}
            
            {/* Floating Text Animation */}
            {floatText && (
                <span 
                    className="floating-text text-yellow-300 text-sm whitespace-nowrap"
                    style={{ left: -50, top: -20 }}
                >
                    {floatText.text}
                </span>
            )}
            </button>
            
            {habit.completedToday ? (
                <button
                    onClick={() => onUndo(habit.id)}
                    className="text-[10px] text-yellow-500 hover:text-yellow-300 font-bold uppercase tracking-wider py-1"
                    title="Undo today's completion"
                >
                    Undo
                </button>
            ) : (
                <button
                    onClick={() => onSkip(habit.id)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider py-1"
                    title="Use Divine Shield to skip without breaking streak (if available)"
                >
                    Skip
                </button>
            )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs">
        <div className="flex gap-4">
          <span className="text-blue-400 font-bold">+{XP_MAP[habit.difficulty]} XP</span>
          <span className="text-yellow-500 font-bold">+{GOLD_MAP[habit.difficulty]} Gold</span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => onEdit(habit.id)}
            className="text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Modify
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Abandon
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
