
import React from 'react';

export interface LevelUpData {
  type: 'level' | 'milestone';
  title: string;
  subtitle: string;
  rewards?: string;
}

interface LevelUpModalProps {
  data: LevelUpData | null;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-md text-center">

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full animate-pulse" />

        <div className="relative bg-[#111111] border border-orange-500 rounded-lg p-8">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center text-black font-bold mono text-2xl">
              {data.type === 'level' ? 'UP' : '!!'}
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <h2 className="text-2xl font-bold text-orange-500 mono">
              {data.title}
            </h2>
            <p className="text-neutral-400 text-sm">{data.subtitle}</p>
          </div>

          {data.rewards && (
            <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-[10px] font-medium text-orange-500/80 uppercase tracking-wider mono mb-1">Rewards</p>
              <p className="text-neutral-100 font-medium mono">{data.rewards}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold mono rounded-lg transition-all active:scale-95"
          >
            continue()
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
