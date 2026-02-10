
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
  const [icon, setIcon] = useState('>');

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-neutral-800 w-full max-w-md rounded-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <h2 className="text-lg font-semibold text-neutral-100 mb-6">
          <span className="text-orange-500 mono">$</span> Edit Reward
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:border-orange-500 transition-colors"
              placeholder="e.g., Coffee Break"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Cost (Credits)</label>
              <input
                type="number"
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                min="1"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:border-orange-500 transition-colors mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Icon</label>
              <input
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 text-xl text-center focus:border-orange-500 transition-colors"
                placeholder=">"
                maxLength={2}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-medium border border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-all mono"
            >
              cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || cost <= 0}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-black rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all mono"
            >
              save()
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRewardModal;
