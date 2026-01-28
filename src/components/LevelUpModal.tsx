
import React, { useEffect } from 'react';

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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-md text-center">
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full animate-pulse" />

        <div className="relative bg-slate-900 border-2 border-yellow-400 rounded-3xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <div className="text-6xl filter drop-shadow-lg animate-bounce">
                    {data.type === 'level' ? '🆙' : '🏆'}
                </div>
            </div>

            <div className="mt-8 space-y-2">
                <h2 className="cinzel text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 filter drop-shadow-sm">
                    {data.title}
                </h2>
                <p className="text-slate-300 font-medium text-lg">{data.subtitle}</p>
            </div>

            {data.rewards && (
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                    <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">Rewards Granted</p>
                    <p className="text-white font-bold">{data.rewards}</p>
                </div>
            )}

            <button 
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black uppercase tracking-widest rounded-full shadow-lg transition-all active:scale-95"
            >
            Claim Glory
            </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
