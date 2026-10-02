'use client';

import React from 'react';
import { X, Sparkles, Image as ImageIcon, Sliders, Check } from 'lucide-react';

interface BackgroundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: string;
  onSelectFilter: (filterStr: string) => void;
}

export default function BackgroundsModal({
  isOpen,
  onClose,
  currentFilter,
  onSelectFilter,
}: BackgroundsModalProps) {
  if (!isOpen) return null;

  const presets = [
    {
      id: 'none',
      name: 'No effect (मूल)',
      filter: 'none',
      previewGradient: 'from-slate-700 to-slate-900',
    },
    {
      id: 'blur-slight',
      name: 'Slight blur (हल्का ब्लर)',
      filter: 'blur(3px)',
      previewGradient: 'from-blue-900 to-indigo-950',
    },
    {
      id: 'blur-heavy',
      name: 'Heavy blur (गहरा ब्लर)',
      filter: 'blur(8px)',
      previewGradient: 'from-purple-900 to-slate-950',
    },
    {
      id: 'studio-light',
      name: 'Studio Light (स्टूडियो लाइटिंग)',
      filter: 'contrast(1.15) brightness(1.08) saturate(1.1)',
      previewGradient: 'from-amber-600 to-yellow-800',
    },
    {
      id: 'warm-office',
      name: 'Modern Office (कॉर्पोरेट ऑफिस)',
      filter: 'sepia(0.12) contrast(1.1) brightness(1.02)',
      previewGradient: 'from-sky-700 to-blue-900',
    },
    {
      id: 'library',
      name: 'Academic Library (लाइब्रेरी)',
      filter: 'sepia(0.25) contrast(1.05) brightness(0.95)',
      previewGradient: 'from-emerald-800 to-teal-950',
    },
    {
      id: 'cyberpunk',
      name: 'Neon Cyberpunk (नियॉन)',
      filter: 'hue-rotate(200deg) contrast(1.2) saturate(1.3)',
      previewGradient: 'from-pink-600 to-purple-900',
    },
    {
      id: 'vintage',
      name: 'Black & White (क्लासिक B&W)',
      filter: 'grayscale(1) contrast(1.1)',
      previewGradient: 'from-slate-400 to-slate-800',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base text-white">Visual effects (विजुअल इफेक्ट्स)</h3>
              <p className="text-[11px] text-slate-400">Apply virtual lighting and blur to your video camera.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {presets.map((p) => {
            const isSelected = currentFilter === p.filter;

            return (
              <button
                key={p.id}
                onClick={() => onSelectFilter(p.filter)}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between gap-2.5 transition-all aspect-square relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40 text-white ring-2 ring-blue-500/30 shadow-lg'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 text-slate-300'
                }`}
              >
                {/* Visual Swatch */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.previewGradient} flex items-center justify-center shadow-md`}>
                  {isSelected && <Check className="w-5 h-5 text-white" />}
                </div>

                <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
