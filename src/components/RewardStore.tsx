
import React, { useState } from 'react';
import { Reward } from '../types';
import { Icons } from '../constants';

interface RewardStoreProps {
  gold: number;
  onPurchase: (reward: Reward) => void;
  rewards: Reward[];
  onAddReward: (reward: Omit<Reward, 'id'>) => void;
  onEditReward: (reward: Reward) => void;
  onDeleteReward: (id: string) => void;
}

const RewardStore: React.FC<RewardStoreProps> = ({ gold, onPurchase, rewards, onAddReward, onEditReward, onDeleteReward }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newReward, setNewReward] = useState({ title: '', cost: 50, icon: '🎁' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="cinzel text-2xl font-bold text-yellow-500">The Grand Bazaar</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors text-sm font-bold"
        >
          {showAdd ? 'Close' : '+ New Reward'}
        </button>
      </div>

      {showAdd && (
        <div className="rpg-card p-6 rounded-2xl border-yellow-500/30">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Craft a Reward</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
              <input 
                type="text" 
                value={newReward.title}
                onChange={e => setNewReward({...newReward, title: e.target.value})}
                placeholder="e.g., 1 Hour Gaming"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Cost (Gold)</label>
              <input 
                type="number" 
                value={newReward.cost}
                onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value) || 0})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => {
                  if (newReward.title) {
                    onAddReward(newReward);
                    setNewReward({ title: '', cost: 50, icon: '🎁' });
                    setShowAdd(false);
                  }
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded-lg transition-all"
              >
                Stock the Shop
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map(reward => (
          <div key={reward.id} className="rpg-card p-5 rounded-2xl border-slate-700/50 hover:border-yellow-500/30 transition-all group relative">
            {/* Delete button in top-right corner */}
            <button
              onClick={() => onDeleteReward(reward.id)}
              className="absolute top-2 right-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove from shop"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{reward.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-slate-100 group-hover:text-yellow-500 transition-colors">{reward.title}</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Icons.Coin />
                  <span className="font-bold">{reward.cost}</span>
                </div>
              </div>
            </div>

            {/* Modify + Acquire buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onEditReward(reward)}
                className="flex-1 py-2 rounded-xl font-bold border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all"
              >
                Modify
              </button>
              <button
                onClick={() => onPurchase(reward)}
                className={`flex-1 py-2 rounded-xl font-bold transition-all
                  ${gold >= reward.cost
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg'
                    : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg'
                  }`}
              >
                {gold >= reward.cost ? 'Acquire' : 'Acquire (Debt)'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardStore;
