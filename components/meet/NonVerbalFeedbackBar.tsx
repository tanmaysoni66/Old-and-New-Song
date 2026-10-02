'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Coffee, 
  RotateCcw, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface FeedbackCount {
  yes: number;
  no: number;
  slower: number;
  faster: number;
  coffee: number;
}

interface NonVerbalFeedbackBarProps {
  myFeedback: string | null;
  counts: FeedbackCount;
  isHost: boolean;
  onSendFeedback: (type: 'yes' | 'no' | 'slower' | 'faster' | 'coffee') => void;
  onClearFeedback?: () => void;
}

export default function NonVerbalFeedbackBar({
  myFeedback,
  counts,
  isHost,
  onSendFeedback,
  onClearFeedback,
}: NonVerbalFeedbackBarProps) {
  const items = [
    { id: 'yes', label: 'Yes', icon: '🟢', count: counts.yes, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' },
    { id: 'no', label: 'No', icon: '🔴', count: counts.no, color: 'text-red-400 border-red-500/30 bg-red-950/40' },
    { id: 'slower', label: 'Slower', icon: '🐢', count: counts.slower, color: 'text-amber-400 border-amber-500/30 bg-amber-950/40' },
    { id: 'faster', label: 'Faster', icon: '🐇', count: counts.faster, color: 'text-sky-400 border-sky-500/30 bg-sky-950/40' },
    { id: 'coffee', label: 'Away / Break', icon: '☕', count: counts.coffee, color: 'text-purple-400 border-purple-500/30 bg-purple-950/40' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl select-none">
      <div className="flex items-center gap-1">
        {items.map((item) => {
          const isSelected = myFeedback === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSendFeedback(item.id as any)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isSelected
                  ? `${item.color} ring-2 ring-indigo-500 shadow-md`
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
              }`}
              title={`${item.label} (${item.count})`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="text-[11px] font-medium hidden sm:inline">{item.label}</span>
              {item.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-white text-[10px] font-bold">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isHost && onClearFeedback && (
        <button
          onClick={onClearFeedback}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 ml-1 transition-colors border border-transparent hover:border-slate-700"
          title="Clear all non-verbal feedback"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
