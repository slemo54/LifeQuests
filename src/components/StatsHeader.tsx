
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
    <div className="w-full bg-[#0a0a0a] border-b border-neutral-800 sticky top-0 z-50 p-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-4">

        {/* User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded border border-neutral-700 overflow-hidden bg-neutral-900 flex items-center justify-center shrink-0">
            <img src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${stats.name}`} alt="avatar" />
          </div>
          <div className="mr-auto">
            <div className="flex items-center gap-2">
              <h1 className="mono text-base md:text-lg font-bold text-orange-500 uppercase tracking-wider leading-none">{stats.name}</h1>
              <button
                onClick={onOpenSettings}
                className="text-neutral-500 hover:text-orange-500 transition-colors p-1"
                title="Settings"
              >
                <Icons.Settings />
              </button>
            </div>
            <p className="text-xs font-medium text-neutral-500 mono">
              <span className="text-neutral-600">lvl</span> {stats.level} <span className="text-neutral-700">|</span> {stats.classTitle || "Initiate"}
            </p>
          </div>

          {/* Credits Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 rounded border border-neutral-800">
            <Icons.Coin />
            <span className="text-base md:text-lg font-bold text-orange-500 mono">{stats.gold}</span>
            <span className="text-xs text-neutral-600 hidden sm:inline">credits</span>
          </div>
        </div>

        {/* Stats Bars */}
        <div className="w-full md:w-auto md:max-w-md md:flex-1 space-y-2">
          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium uppercase text-neutral-500 mono">
              <span>exp</span>
              <span className="text-orange-500">{stats.xp} <span className="text-neutral-600">/</span> {stats.nextLevelXp}</span>
            </div>
            <div className="h-1.5 bg-neutral-900 rounded-sm overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-orange-500 progress-bar"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium uppercase text-neutral-500 mono">
              <span>energy</span>
              <span className="text-emerald-500">{stats.hp} <span className="text-neutral-600">/</span> {stats.maxHp}</span>
            </div>
            <div className="h-1.5 bg-neutral-900 rounded-sm overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-emerald-500 progress-bar"
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
