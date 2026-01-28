
import React from 'react';
import { Habit, UserStats } from '../types';
import { Icons } from '../constants';

interface AnalyticsDashboardProps {
  habits: Habit[];
  stats: UserStats;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ habits, stats }) => {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Calculate aggregate stats
  let totalCompletionsWeek = 0;
  let highestStreak = 0;
  let mostConsistent = habits[0];

  habits.forEach(h => {
    const weeklyCompletions = h.completionDates.filter(d => new Date(d) > oneWeekAgo).length;
    totalCompletionsWeek += weeklyCompletions;
    if (h.streak > highestStreak) {
        highestStreak = h.streak;
        mostConsistent = h;
    }
  });

  // Calculate daily activity for chart (Last 7 days)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // Past 6 days + today
      const dateStr = d.toISOString().split('T')[0];
      let count = 0;
      habits.forEach(h => {
          if (h.completionDates.includes(dateStr)) count++;
      });
      return { day: days[d.getDay()], count, date: dateStr };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="cinzel text-3xl font-bold text-blue-400 mb-6">Chronicles of Progress</h2>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rpg-card p-4 rounded-xl border-blue-900/50">
            <p className="text-xs text-slate-500 font-bold uppercase">Weekly Wins</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCompletionsWeek} <span className="text-sm text-slate-500 font-normal">quests</span></p>
        </div>
        <div className="rpg-card p-4 rounded-xl border-blue-900/50">
            <p className="text-xs text-slate-500 font-bold uppercase">Longest Streak</p>
            <p className="text-2xl font-bold text-orange-500 mt-1">{highestStreak} <span className="text-sm text-slate-500 font-normal">days</span></p>
        </div>
        <div className="rpg-card p-4 rounded-xl border-blue-900/50 col-span-2">
            <p className="text-xs text-slate-500 font-bold uppercase">Most Consistent</p>
            <p className="text-lg font-bold text-emerald-400 mt-1 truncate">{mostConsistent ? mostConsistent.title : "None"}</p>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="rpg-card p-6 rounded-xl border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
              <Icons.Chart /> Activity Trend (Last 7 Days)
          </h3>
          <div className="flex items-end justify-between h-40 gap-2">
              {chartData.map((d, i) => {
                  const height = d.count > 0 ? Math.min((d.count / habits.length) * 100, 100) : 5;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                        <div className="relative w-full flex justify-center">
                             <div className="absolute bottom-0 w-full md:w-8 bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-500" style={{ height: `${height}%` }}></div>
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-slate-500">{d.day}</span>
                    </div>
                  )
              })}
          </div>
      </div>

      {/* Quest Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(h => {
              const weeklyC = h.completionDates.filter(d => new Date(d) > oneWeekAgo).length;
              const percent = (weeklyC / 7) * 100;
              return (
                <div key={h.id} className="rpg-card p-4 rounded-xl border-slate-800 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-200">{h.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded border ${
                            h.difficulty === 'Hard' ? 'text-rose-400 border-rose-900/50' : 
                            h.difficulty === 'Medium' ? 'text-amber-400 border-amber-900/50' : 
                            'text-emerald-400 border-emerald-900/50'
                        }`}>{h.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">{weeklyC}/7</span>
                    </div>
                    {percent < 30 && (
                        <p className="text-[10px] text-rose-400 italic mt-1">Struggling? Ask the Spirit Guide for help.</p>
                    )}
                </div>
              )
          })}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
