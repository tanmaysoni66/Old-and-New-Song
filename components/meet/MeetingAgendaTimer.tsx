'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  X,
  Volume2
} from 'lucide-react';
import { soundManager } from '@/lib/audio-effects';

export interface AgendaItem {
  id: string;
  title: string;
  completed: boolean;
}

interface MeetingAgendaTimerProps {
  isHost: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function MeetingAgendaTimer({ isHost, isOpen, onClose }: MeetingAgendaTimerProps) {
  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [timerRunning, setTimerRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(300);

  // Agenda State
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    { id: '1', title: '1. Project Overview & Sprint Goals', completed: true },
    { id: '2', title: '2. Live Video Streaming Architecture & WebRTC', completed: false },
    { id: '3', title: '3. Zoom & Meet Feature Parity Review', completed: false },
    { id: '4', title: '4. Open Q&A & Action Items', completed: false },
  ]);
  const [newTopic, setNewTopic] = useState('');

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            soundManager.playTimerChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const handleSetPreset = (secs: number) => {
    setTimerSeconds(secs);
    setTotalSeconds(secs);
    setTimerRunning(false);
  };

  const toggleAgenda = (id: string) => {
    setAgenda(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const addAgendaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setAgenda(prev => [...prev, {
      id: Date.now().toString(),
      title: `${prev.length + 1}. ${newTopic.trim()}`,
      completed: false
    }]);
    setNewTopic('');
  };

  const deleteAgendaItem = (id: string) => {
    setAgenda(prev => prev.filter(item => item.id !== id));
  };

  const progressPct = totalSeconds > 0 ? ((totalSeconds - timerSeconds) / totalSeconds) * 100 : 0;
  const isUrgent = timerSeconds <= 30 && timerSeconds > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Meeting Timer & Agenda</h3>
              <p className="text-[11px] text-slate-400">Speaker presentation timer & topic checklist</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Box */}
        <div className={`p-4 rounded-2xl border text-center transition-all ${
          isUrgent 
            ? 'bg-red-950/40 border-red-500/50 animate-pulse' 
            : timerSeconds === 0 
              ? 'bg-amber-950/40 border-amber-500/50' 
              : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Speaker Countdown Timer</span>
          </div>

          <div className="font-mono text-4xl sm:text-5xl font-black tracking-wider my-2 text-white">
            {formatTime(timerSeconds)}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full transition-all duration-500 ${
                isUrgent ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Presets & Controls */}
          {isHost && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-1.5">
                {[
                  { label: '2m', secs: 120 },
                  { label: '5m', secs: 300 },
                  { label: '10m', secs: 600 },
                  { label: '15m', secs: 900 },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => handleSetPreset(p.secs)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`py-2 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                    timerRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{timerRunning ? 'Pause' : 'Start Timer'}</span>
                </button>

                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(totalSeconds);
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Agenda Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Meeting Agenda
            </span>
            <span className="text-[11px] text-slate-400">
              {agenda.filter(a => a.completed).length} of {agenda.length} completed
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {agenda.map(item => (
              <div 
                key={item.id}
                onClick={() => isHost && toggleAgenda(item.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-xs transition-colors ${
                  isHost ? 'cursor-pointer' : ''
                } ${
                  item.completed 
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through' 
                    : 'bg-slate-800/60 border-slate-700/60 text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{item.title}</span>
                </div>

                {isHost && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAgendaItem(item.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Agenda Item */}
          {isHost && (
            <form onSubmit={addAgendaItem} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                placeholder="Add agenda topic..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newTopic.trim()}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
