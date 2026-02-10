
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
    const xp = XP_MAP[habit.difficulty];
    const gold = GOLD_MAP[habit.difficulty];

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFloatText({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        text: `+${xp} XP  +${gold} CR`
    });

    setIsAnimating(true);

    setTimeout(() => {
        onComplete(habit.id);
        setIsAnimating(false);
        setFloatText(null);
    }, 600);
  };

  const getDifficultyStyle = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-500 border-emerald-900/50 bg-emerald-950/30';
      case 'Medium': return 'text-orange-500 border-orange-900/50 bg-orange-950/30';
      case 'Hard': return 'text-red-500 border-red-900/50 bg-red-950/30';
      default: return 'text-neutral-400';
    }
  };

  const getShieldStatus = () => {
    if (!habit.lastGraceUsed) return 'ready';
    const lastGrace = new Date(habit.lastGraceUsed);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastGrace.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7 ? 'ready' : `${8 - diffDays}d`;
  };

  const shieldStatus = getShieldStatus();

  return (
    <div className={`terminal-card p-4 rounded-lg transition-all duration-300 group relative ${habit.completedToday ? 'opacity-50' : 'hover:border-orange-500'} ${isAnimating ? 'ring-1 ring-orange-500 bg-orange-950/10' : ''}`}>

      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mono ${getDifficultyStyle(habit.difficulty)}`}>
              {habit.difficulty}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border text-neutral-400 border-neutral-800 bg-neutral-900/50 mono">
                {habit.frequency}
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900/50">
                <span className="text-orange-500 text-xs mono">{habit.streak}</span>
                <span className="text-neutral-600 text-[10px]">streak</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium mono ${
                shieldStatus === 'ready'
                ? 'text-cyan-500 border-cyan-900/50 bg-cyan-950/30'
                : 'text-neutral-600 border-neutral-800 bg-neutral-900/50'
            }`}>
                <Icons.Shield />
                <span>{shieldStatus}</span>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-base font-semibold text-neutral-100 mb-1 group-hover:text-orange-500 transition-colors truncate pr-2">{habit.title}</h3>
          {habit.description && (
            <p className="text-sm text-neutral-500 line-clamp-2">{habit.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 shrink-0 relative">
            <button
              onClick={handleComplete}
              disabled={habit.completedToday}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all relative overflow-visible border
                  ${habit.completedToday
                  ? 'bg-neutral-900 border-neutral-800 cursor-not-allowed text-neutral-600'
                  : 'bg-orange-500 border-orange-500 hover:bg-orange-400 active:scale-95 text-black'
                  }`}
            >
              {habit.completedToday ? (
                  <Icons.Check />
              ) : (
                  <span className="text-lg font-bold mono">GO</span>
              )}

              {floatText && (
                  <span
                      className="floating-text text-orange-400 text-sm whitespace-nowrap mono"
                      style={{ left: -50, top: -20 }}
                  >
                      {floatText.text}
                  </span>
              )}
            </button>

            {habit.completedToday ? (
                <button
                    onClick={() => onUndo(habit.id)}
                    className="text-[10px] text-orange-500 hover:text-orange-400 font-medium uppercase tracking-wider py-1 mono"
                    title="Undo"
                >
                    undo
                </button>
            ) : (
                <button
                    onClick={() => onSkip(habit.id)}
                    className="text-[10px] text-neutral-600 hover:text-neutral-400 font-medium uppercase tracking-wider py-1 mono"
                    title="Skip with shield protection"
                >
                    skip
                </button>
            )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-neutral-800/50 flex justify-between items-center text-xs">
        <div className="flex gap-3 mono">
          <span className="text-orange-500">+{XP_MAP[habit.difficulty]} <span className="text-neutral-600">xp</span></span>
          <span className="text-orange-500">+{GOLD_MAP[habit.difficulty]} <span className="text-neutral-600">cr</span></span>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => onEdit(habit.id)}
            className="text-neutral-600 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all mono text-[10px] uppercase"
          >
            edit
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all mono text-[10px] uppercase"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
