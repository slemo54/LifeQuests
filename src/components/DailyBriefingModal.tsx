
import React from 'react';

interface DailyBriefingModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#111111] border border-neutral-800 w-full max-w-lg rounded-lg p-6 relative">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-center">
            <span className="text-orange-500 mono font-bold">&gt;</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">
              <span className="text-orange-500 mono">$</span> Daily Briefing
            </h2>
            <p className="text-[10px] text-neutral-600 mono uppercase tracking-wider">AI Generated Message</p>
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg mb-6">
          <p className="text-neutral-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black rounded-lg font-bold mono transition-all active:scale-[0.98]"
        >
          start_day()
        </button>
      </div>
    </div>
  );
};

export default DailyBriefingModal;
