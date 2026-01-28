
import React, { useState } from 'react';
import { Difficulty, Frequency, Habit } from '../types';
import { getDifficultySuggestion } from '../services/geminiService';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Partial<Habit>) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title, description, difficulty, frequency });
    setTitle('');
    setDescription('');
    setDifficulty('Easy');
    setFrequency('Daily');
    onClose();
  };

  const handleAIAnalyze = async () => {
    if (!title.trim()) return;
    setIsAnalyzing(true);
    const suggestion = await getDifficultySuggestion(title, description);
    setDifficulty(suggestion);
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-yellow-500/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>

        <h2 className="cinzel text-2xl font-bold text-yellow-500 mb-6">Commission New Quest</h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quest Title</label>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-500 transition-all"
              placeholder="e.g., Read Grimoire"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-500 transition-all h-24 resize-none"
              placeholder="Details of your mission..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
                Difficulty
                <button 
                    onClick={handleAIAnalyze}
                    disabled={isAnalyzing || !title}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50"
                >
                    {isAnalyzing ? 'Consulting...' : '✨ Ask AI'}
                </button>
              </label>
              <select 
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-500"
              >
                <option value="Easy">Easy (10 XP)</option>
                <option value="Medium">Medium (25 XP)</option>
                <option value="Hard">Hard (50 XP)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Frequency</label>
              <select 
                value={frequency}
                onChange={e => setFrequency(e.target.value as Frequency)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-yellow-500"
              >
                <option value="Daily">Daily</option>
                <option value="Every 2 Days">Every 2 Days</option>
                <option value="Weekly">Weekly</option>
              </select>
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
              disabled={!title.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-bold cinzel shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHabitModal;
