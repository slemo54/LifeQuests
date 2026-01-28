
import React from 'react';

interface DailyBriefingModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-slate-900 border-2 border-yellow-500/50 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative text-center">
        
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
          <span className="text-4xl">☀️</span>
        </div>

        <h2 className="cinzel text-3xl font-bold text-yellow-500 mb-2">A New Day Dawns</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Daily Quest Briefing</p>

        <p className="text-lg text-slate-200 italic font-serif leading-relaxed mb-8">
          "{message}"
        </p>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-bold cinzel text-lg shadow-xl shadow-yellow-900/20 active:scale-[0.98] transition-all"
        >
          I am Ready!
        </button>
      </div>
    </div>
  );
};

export default DailyBriefingModal;
