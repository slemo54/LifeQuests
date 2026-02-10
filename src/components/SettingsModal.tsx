
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
      e.target.value = '';
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateName(name.trim());
    }
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
          <span className="text-orange-500 mono">$</span> Settings
        </h2>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Profile</h3>
            <form onSubmit={handleNameSubmit} className="flex gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-100 focus:border-orange-500 transition-colors"
                placeholder="Username"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 text-orange-500 font-medium text-sm mono hover:border-orange-500 transition-all"
              >
                update
              </button>
            </form>
          </div>

          {/* Data Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mono">Data Management</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExport}
                className="flex flex-col items-center justify-center p-4 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 hover:border-orange-500 transition-all"
              >
                <span className="text-orange-500 mono text-sm mb-1">export()</span>
                <span className="text-[10px] text-neutral-600">Download backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 hover:border-orange-500 transition-all"
              >
                <span className="text-orange-500 mono text-sm mb-1">import()</span>
                <span className="text-[10px] text-neutral-600">Restore backup</span>
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
          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <h3 className="text-[10px] font-medium text-red-500/80 uppercase tracking-wider mono">
              Danger Zone
            </h3>
            <button
              onClick={onResetProgress}
              className="w-full flex items-center justify-between p-4 bg-red-950/20 hover:bg-red-900/30 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-all text-red-500 font-medium mono text-sm"
            >
              <span>reset_all()</span>
              <span className="text-xs text-red-500/60">Deletes everything</span>
            </button>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2 rounded-lg font-medium bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 transition-all text-sm mono"
            >
              close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
