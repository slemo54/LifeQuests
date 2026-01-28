
import React from 'react';
import { Habit, UserStats } from '../types';
import { Icons } from '../constants';

interface ProgressSummaryProps {
  habits: Habit[];
  stats: UserStats;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ habits, stats }) => {
  // Calculate completion rate for the current week
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  let totalCompletions = 0;
  let totalOpportunities = habits.length * 7; // Approx
  
  habits.forEach(h => {
    const weeklyCompletions = h.completionDates.filter(d => new Date(d) > oneWeekAgo).length;
    totalCompletions += weeklyCompletions;
  });

  const completionRate = totalOpportunities > 0 
    ? Math.round((totalCompletions / totalOpportunities) * 100) 
    : 0;

  const mostConsistent = habits.sort((a, b) => b.streak - a.streak)[0];

  return (
    <div className="rpg-card rounded-2xl p-6 mb-8 border-indigo-500/20 bg-slate-900/50">
      <h3 className="cinzel text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
        <Icons.Brain />
        Weekly Chronicle
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-emerald-400">{completionRate}%</p>
        </div>
        
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Quests Active</p>
          <p className="text-2xl font-bold text-blue-400">{habits.length}</p>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 col-span-2 md:col-span-2 text-left px-4 flex items-center justify-between">
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Top Streak</p>
                <p className="text-sm font-bold text-orange-400 truncate max-w-[120px]">
                {mostConsistent ? mostConsistent.title : "None yet"}
                </p>
            </div>
            <div className="text-2xl font-bold text-orange-500">
                {mostConsistent ? mostConsistent.streak : 0} 🔥
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;
