
import React, { useRef, useState, useEffect } from 'react';
import { UserStats } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onUpdateName: (name: string) => void;
  onResetProgress: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateName,
  onResetProgress,
  onExport,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(stats.name);

  useEffect(() => {
    setName(stats.name);
  }, [stats.name]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateName(name.trim());
    }
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

        <h2 className="cinzel text-2xl font-bold text-yellow-500 mb-6">Hero's Settings</h2>

        <div className="space-y-6">
          {/* Identity Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Identity</h3>
            <form onSubmit={handleNameSubmit} className="flex gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-yellow-500 transition-all"
                placeholder="Hero Name"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-yellow-500 font-bold text-sm"
              >
                Update
              </button>
            </form>
          </div>

          {/* Backup Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Scroll of Preservation</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExport}
                className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
              >
                <span className="text-2xl mb-1">📥</span>
                <span className="text-xs font-bold text-slate-100">Export</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
              >
                <span className="text-2xl mb-1">📤</span>
                <span className="text-xs font-bold text-slate-100">Import</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".json"
            />
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-rose-500/80 uppercase tracking-widest flex items-center gap-2">
              Danger Zone
            </h3>
            <button
              onClick={onResetProgress}
              className="w-full flex items-center justify-between p-4 bg-rose-950/20 hover:bg-rose-900/30 rounded-xl border border-rose-900/30 transition-all text-rose-400 font-bold"
            >
              <span>Erase All Memories</span>
              <span>💀</span>
            </button>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2 rounded-xl font-bold bg-slate-800 text-slate-100 hover:bg-slate-700 transition-all text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
