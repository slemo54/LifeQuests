
import React from 'react';
import { UserStats } from '../types';
import { Icons } from '../constants';

interface StatsHeaderProps {
  stats: UserStats;
  onOpenSettings: () => void;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ stats, onOpenSettings }) => {
  const xpPercentage = (stats.xp / stats.nextLevelXp) * 100;
  const hpPercentage = (stats.hp / stats.maxHp) * 100;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50 p-3 shadow-xl">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-4">

        {/* Row 1 Mobile: Avatar, Name, Gold */}
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-yellow-500 overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${stats.name}`} alt="avatar" />
          </div>
          <div className="mr-auto">
            <div className="flex items-center gap-2">
              <h1 className="cinzel text-lg md:text-xl font-bold text-yellow-500 uppercase tracking-wider leading-none">{stats.name}</h1>
              <button
                onClick={onOpenSettings}
                className="text-slate-500 hover:text-yellow-500 transition-colors p-1"
                title="Settings"
              >
                <Icons.Settings />
              </button>

            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-400">{stats.classTitle || "Novice"}</p>
          </div>

          {/* Gold Display - Visible on right for mobile */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-yellow-600/30">
            <Icons.Coin />
            <span className="text-lg md:text-xl font-bold text-yellow-500">{stats.gold}</span>
          </div>
        </div>

        {/* Row 2 Mobile: Stats Bars (Full width on mobile, auto on desktop) */}
        <div className="w-full md:w-auto md:max-w-md md:flex-1 space-y-1.5">
          {/* XP Bar */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase text-blue-400">
              <span>XP</span>
              <span>{stats.xp} / {stats.nextLevelXp}</span>
            </div>
            <div className="h-2 md:h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 xp-bar"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* HP Bar */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase text-red-400">
              <span>HP</span>
              <span>{stats.hp} / {stats.maxHp}</span>
            </div>
            <div className="h-2 md:h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 xp-bar"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsHeader;
