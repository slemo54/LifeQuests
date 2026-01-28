
import React, { useState, useRef, useEffect } from 'react';
import { UserStats, Habit } from '../types';
import { getSpiritAdvice } from '../services/geminiService';

interface SpiritGuideProps {
  stats: UserStats;
  habits: Habit[];
}

const SpiritGuide: React.FC<SpiritGuideProps> = ({ stats, habits }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'spirit'; text: string }[]>([
    { role: 'spirit', text: `Greetings, ${stats.classTitle}. I am the Keeper of the Eternal Flame. What burdens your spirit today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setIsTyping(true);

    const spiritResponse = await getSpiritAdvice(stats, habits, text);
    setMessages(prev => [...prev, { role: 'spirit', text: spiritResponse }]);
    setIsTyping(false);
  };

  const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSend(input);
      setInput('');
  }

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
          <div className="w-6 h-6 animate-pulse bg-indigo-400 rounded-full blur-sm" />
        </div>
        <div>
          <h2 className="cinzel text-lg font-bold text-indigo-400">Spirit Guide</h2>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ancient Wisdom AI</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg text-sm md:text-base ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none italic'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-slate-800/30 flex gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => handleSend("What quest should I prioritize next?")} className="whitespace-nowrap px-3 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-full text-xs text-indigo-300 font-medium transition-colors">
              ⚡ What next?
          </button>
          <button onClick={() => handleSend("Why am I struggling with my habits?")} className="whitespace-nowrap px-3 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-full text-xs text-indigo-300 font-medium transition-colors">
              📉 Analyze failures
          </button>
          <button onClick={() => handleSend("Give me a strategy to break my hard quests into smaller steps.")} className="whitespace-nowrap px-3 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-full text-xs text-indigo-300 font-medium transition-colors">
              ⚔️ Battle Strategy
          </button>
      </div>

      <form onSubmit={onSubmit} className="p-4 bg-slate-800/50 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for guidance..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          type="submit"
          disabled={!input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95"
        >
          Speak
        </button>
      </form>
    </div>
  );
};

export default SpiritGuide;
