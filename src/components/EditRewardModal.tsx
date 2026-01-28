
import React, { useState, useEffect } from 'react';
import { Reward } from '../types';

interface EditRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reward: Reward) => void;
  reward: Reward | null;
}

const EditRewardModal: React.FC<EditRewardModalProps> = ({ isOpen, onClose, onSave, reward }) => {
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(50);
  const [icon, setIcon] = useState('🎁');

  // Pre-populate form when reward changes
  useEffect(() => {
    if (reward) {
      setTitle(reward.title);
      setCost(reward.cost);
      setIcon(reward.icon);
    }
  }, [reward]);

  if (!isOpen || !reward) return null;

  const handleSubmit = () => {
    if (!title.trim() || cost <= 0) return;

    const updatedReward: Reward = {
      ...reward,
      title: title.trim(),
      cost,
      icon
    };

    onSave(updatedReward);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-yellow-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>

        <h2 className="cinzel text-2xl font-bold text-yellow-500 mb-6">Modify Reward</h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reward Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-500 transition-all"
              placeholder="e.g., Coffee Break"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cost (Gold)</label>
              <input
                type="number"
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                min="1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Icon (Emoji)</label>
              <input
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-2xl text-center focus:outline-none focus:border-yellow-500 transition-all"
                placeholder="🎁"
                maxLength={2}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || cost <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-bold cinzel shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Reward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRewardModal;
