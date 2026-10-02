'use client';

import React from 'react';
import { X, Grid, Eye, Columns, Sliders } from 'lucide-react';

export type MeetLayoutMode = 'auto' | 'tiled' | 'spotlight' | 'sidebar';

interface LayoutSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutMode: MeetLayoutMode;
  maxTiles: number;
  onChangeLayout: (mode: MeetLayoutMode) => void;
  onChangeMaxTiles: (tiles: number) => void;
}

export default function LayoutSelectorModal({
  isOpen,
  onClose,
  layoutMode,
  maxTiles,
  onChangeLayout,
  onChangeMaxTiles,
}: LayoutSelectorModalProps) {
  if (!isOpen) return null;

  const layoutOptions: { mode: MeetLayoutMode; title: string; desc: string; icon: any }[] = [
    {
      mode: 'auto',
      title: 'Auto (Recommended)',
      desc: 'Allows Google Meet to choose the best layout for your screen',
      icon: Sliders,
    },
    {
      mode: 'tiled',
      title: 'Tiled',
      desc: 'Shows multiple participants at the same time in a clean grid',
      icon: Grid,
    },
    {
      mode: 'spotlight',
      title: 'Spotlight',
      desc: 'The active speaker or pinned presentation fills the entire window',
      icon: Eye,
    },
    {
      mode: 'sidebar',
      title: 'Sidebar',
      desc: 'The main speaker is displayed prominently with other participants on the side',
      icon: Columns,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">Change layout</h3>
            <p className="text-[11px] text-slate-400">Choose how participants appear on your screen.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout Choices */}
        <div className="space-y-2.5 text-xs">
          {layoutOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = layoutMode === opt.mode;

            return (
              <button
                key={opt.mode}
                onClick={() => onChangeLayout(opt.mode)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block text-white">{opt.title}</span>
                  <span className="text-[11px] text-slate-400 leading-normal">{opt.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tiled Slider */}
        <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Tiles to display:</span>
            <span className="font-mono font-bold text-white">{maxTiles} tiles</span>
          </div>
          <input
            type="range"
            min={4}
            max={16}
            step={2}
            value={maxTiles}
            onChange={(e) => onChangeMaxTiles(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
          >
            Apply
          </button>
        </div>

      </div>
    </div>
  );
}
