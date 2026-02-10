
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
  const [newReward, setNewReward] = useState({ title: '', cost: 50, icon: '>' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-100">
          <span className="text-orange-500 mono">$</span> Rewards Store
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-orange-500 hover:border-orange-500 transition-colors text-sm font-medium mono"
        >
          {showAdd ? 'close' : '+ new'}
        </button>
      </div>

      {showAdd && (
        <div className="terminal-card p-5 rounded-lg border-orange-500/30">
          <h3 className="text-sm font-medium text-neutral-300 mb-4 mono uppercase tracking-wider">Create Reward</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Title</label>
              <input
                type="text"
                value={newReward.title}
                onChange={e => setNewReward({...newReward, title: e.target.value})}
                placeholder="e.g., Coffee Break"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Cost (Credits)</label>
              <input
                type="number"
                value={newReward.cost}
                onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value) || 0})}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:border-orange-500 transition-colors mono"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (newReward.title) {
                    onAddReward(newReward);
                    setNewReward({ title: '', cost: 50, icon: '>' });
                    setShowAdd(false);
                  }
                }}
                className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-2 rounded-lg transition-all mono"
              >
                add_reward()
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map(reward => (
          <div key={reward.id} className="terminal-card p-4 rounded-lg group relative hover:border-orange-500 transition-all">
            {/* Delete button */}
            <button
              onClick={() => onDeleteReward(reward.id)}
              className="absolute top-3 right-3 text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              title="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{reward.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-neutral-100 group-hover:text-orange-500 transition-colors truncate">{reward.title}</h4>
                <div className="flex items-center gap-1 text-orange-500 mono text-sm">
                  <Icons.Coin />
                  <span className="font-bold">{reward.cost}</span>
                  <span className="text-neutral-600 text-xs">cr</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onEditReward(reward)}
                className="flex-1 py-2 rounded-lg font-medium border border-neutral-800 text-neutral-500 hover:text-orange-500 hover:border-orange-500 transition-all text-sm mono"
              >
                edit
              </button>
              <button
                onClick={() => onPurchase(reward)}
                className={`flex-1 py-2 rounded-lg font-bold transition-all text-sm mono
                  ${gold >= reward.cost
                    ? 'bg-orange-500 hover:bg-orange-400 text-black'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50'
                  }`}
              >
                {gold >= reward.cost ? 'claim' : 'debt'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12 terminal-card rounded-lg">
          <p className="text-neutral-600 mono">No rewards configured.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-orange-500 hover:text-orange-400 font-medium mt-2 mono"
          >
            + add your first reward
          </button>
        </div>
      )}
    </div>
  );
};

export default RewardStore;
