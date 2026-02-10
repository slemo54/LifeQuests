
import React, { useState, useEffect } from 'react';
import { Difficulty, Frequency, Habit } from '../types';
import { getDifficultySuggestion } from '../services/geminiService';

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  habit: Habit | null;
}

const EditHabitModal: React.FC<EditHabitModalProps> = ({ isOpen, onClose, onSave, habit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description);
      setDifficulty(habit.difficulty);
      setFrequency(habit.frequency);
    }
  }, [habit]);

  if (!isOpen || !habit) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;

    const updatedHabit: Habit = {
      ...habit,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      frequency
    };

    onSave(updatedHabit);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-neutral-800 w-full max-w-lg rounded-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <h2 className="text-lg font-semibold text-neutral-100 mb-6">
          <span className="text-orange-500 mono">$</span> Edit Task
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:border-orange-500 transition-colors"
              placeholder="e.g., Morning workout"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:border-orange-500 transition-colors h-20 resize-none"
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono flex justify-between items-center">
                Difficulty
                <button
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing || !title}
                  className="text-orange-500 hover:text-orange-400 flex items-center gap-1 disabled:opacity-50"
                >
                  {isAnalyzing ? 'analyzing...' : 'ai_suggest()'}
                </button>
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:border-orange-500"
              >
                <option value="Easy">Easy (+10 XP)</option>
                <option value="Medium">Medium (+25 XP)</option>
                <option value="Hard">Hard (+50 XP)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as Frequency)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:border-orange-500"
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
              className="flex-1 py-3 rounded-lg font-medium border border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-all mono"
            >
              cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
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

export default EditHabitModal;
