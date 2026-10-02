'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Check, 
  Volume2, 
  Sun, 
  Eye, 
  Layers, 
  ShieldCheck, 
  Palette 
} from 'lucide-react';

interface BackgroundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: string;
  onSelectFilter: (filterStr: string) => void;
  lowLightBoost?: boolean;
  onToggleLowLight?: () => void;
  touchUpLevel?: number;
  onChangeTouchUp?: (level: number) => void;
  noiseSuppression?: 'auto' | 'high' | 'original';
  onChangeNoiseSuppression?: (mode: 'auto' | 'high' | 'original') => void;
}

export default function BackgroundsModal({
  isOpen,
  onClose,
  currentFilter,
  onSelectFilter,
  lowLightBoost = false,
  onToggleLowLight,
  touchUpLevel = 50,
  onChangeTouchUp,
  noiseSuppression = 'auto',
  onChangeNoiseSuppression,
}: BackgroundsModalProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'audio'>('visual');

  if (!isOpen) return null;

  const presets = [
    {
      id: 'none',
      name: 'No effect (Original)',
      filter: 'none',
      previewGradient: 'from-slate-700 to-slate-900',
      category: 'basic'
    },
    {
      id: 'blur-slight',
      name: 'Slight blur (3px)',
      filter: 'blur(3px)',
      previewGradient: 'from-blue-900 to-indigo-950',
      category: 'blur'
    },
    {
      id: 'blur-heavy',
      name: 'Heavy blur (8px)',
      filter: 'blur(8px)',
      previewGradient: 'from-purple-900 to-slate-950',
      category: 'blur'
    },
    {
      id: 'studio-light',
      name: 'Studio Lighting (Warm)',
      filter: 'contrast(1.15) brightness(1.12) saturate(1.15)',
      previewGradient: 'from-amber-600 to-yellow-800',
      category: 'lighting'
    },
    {
      id: 'warm-office',
      name: 'Executive Office Suite',
      filter: 'sepia(0.08) contrast(1.1) brightness(1.05) saturate(1.05)',
      previewGradient: 'from-sky-700 to-blue-900',
      category: 'virtual'
    },
    {
      id: 'library',
      name: 'Cozy Bookshelf & Library',
      filter: 'sepia(0.2) contrast(1.08) brightness(0.98)',
      previewGradient: 'from-emerald-800 to-teal-950',
      category: 'virtual'
    },
    {
      id: 'penthouse',
      name: 'Skyline City Penthouse',
      filter: 'contrast(1.2) brightness(1.08) saturate(1.2)',
      previewGradient: 'from-blue-800 via-indigo-900 to-purple-900',
      category: 'virtual'
    },
    {
      id: 'cafe',
      name: 'Artisan Coffee House',
      filter: 'sepia(0.25) contrast(1.15) brightness(1.02) saturate(1.2)',
      previewGradient: 'from-amber-800 to-amber-950',
      category: 'virtual'
    },
    {
      id: 'tropical-beach',
      name: 'Tropical Beach Sunset',
      filter: 'hue-rotate(-15deg) contrast(1.15) brightness(1.08) saturate(1.25)',
      previewGradient: 'from-orange-600 via-pink-600 to-purple-800',
      category: 'virtual'
    },
    {
      id: 'cyberpunk',
      name: 'Neon Cyberpunk Studio',
      filter: 'hue-rotate(200deg) contrast(1.25) saturate(1.35)',
      previewGradient: 'from-pink-600 via-purple-700 to-cyan-800',
      category: 'lighting'
    },
    {
      id: 'monochrome',
      name: 'Black & White Cinema',
      filter: 'grayscale(1) contrast(1.15)',
      previewGradient: 'from-slate-400 to-slate-800',
      category: 'lighting'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Visual & Audio Studio Effects</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
                  Meet & Zoom
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Virtual blur, lighting backdrops, touch up appearance, and AI noise suppression
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'visual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Virtual Backdrops & Lighting</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'audio' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio & Noise Filter</span>
          </button>
        </div>

        {/* Tab 1: Visuals */}
        {activeTab === 'visual' && (
          <div className="space-y-4">
            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {presets.map((p) => {
                const isSelected = currentFilter === p.filter;

                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectFilter(p.filter)}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all aspect-square relative ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white ring-2 ring-indigo-500/40 shadow-lg'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${p.previewGradient} flex items-center justify-center shadow-md relative overflow-hidden`}>
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold leading-tight line-clamp-2">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Appearance Enhancement Sliders (Zoom & Meet Features) */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 text-xs">
              {/* Touch Up Appearance */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Touch up my appearance (Zoom skin smoothing)</span>
                  </span>
                  <span className="text-[11px] text-indigo-400 font-mono font-bold">
                    {touchUpLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={touchUpLevel}
                  onChange={(e) => onChangeTouchUp && onChangeTouchUp(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Low Light Boost */}
              {onToggleLowLight && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-semibold text-white block">Adjust for low light</span>
                      <span className="text-[10px] text-slate-400">Google Meet automatic exposure compensation</span>
                    </div>
                  </div>
                  <button
                    onClick={onToggleLowLight}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${lowLightBoost ? 'bg-amber-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${lowLightBoost ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Audio & Noise */}
        {activeTab === 'audio' && (
          <div className="space-y-3 text-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Background Noise Suppression (Zoom & Google Meet)
            </div>

            {[
              {
                mode: 'auto',
                title: 'Auto / Standard Noise Cancellation',
                desc: 'Blocks typical keyboard clicks, room fan, and paper shuffles.',
              },
              {
                mode: 'high',
                title: 'High AI Noise Suppression (Aggressive)',
                desc: 'Deep neural net suppression for noisy environments, dogs barking, street traffic.',
              },
              {
                mode: 'original',
                title: 'Original Sound for Musicians (Zoom Flagship)',
                desc: 'Disables echo cancellation & filtering for high-fidelity instruments and singing.',
              }
            ].map((opt) => {
              const isSelected = noiseSuppression === opt.mode;
              return (
                <div
                  key={opt.mode}
                  onClick={() => onChangeNoiseSuppression && onChangeNoiseSuppression(opt.mode as any)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/30 border-indigo-500/50 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="font-semibold block">{opt.title}</span>
                    <span className="text-[11px] text-slate-400">{opt.desc}</span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
}
