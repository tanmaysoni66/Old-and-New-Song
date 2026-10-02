'use client';

import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  Share2
} from 'lucide-react';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoomCode?: string;
}

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  defaultRoomCode = 'team-sync-now',
}: ScheduleMeetingModalProps) {
  const [topic, setTopic] = useState('Product Strategy & Live Collaboration');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState('45');
  const [passcode, setPasscode] = useState('839210');
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const roomCode = defaultRoomCode;
  const meetUrl = typeof window !== 'undefined' ? `${window.location.origin}/meet/${roomCode}` : `https://ais-meet.app/meet/${roomCode}`;

  const invitationText = `Topic: ${topic}
Time: ${date} at ${time} (Duration: ${duration} minutes)

Join Google Meet & Zoom Meeting:
${meetUrl}

Meeting ID: ${roomCode}
Passcode: ${passcode}
Waiting Room: ${waitingRoom ? 'Enabled (Host will admit you)' : 'Disabled'}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(invitationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToGoogleCalendar = () => {
    // Format dates for Google Calendar URL (YYYYMMDDTHHMMSSZ)
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);
    
    const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(topic)}&dates=${formatGCalDate(startDateTime)}/${formatGCalDate(endDateTime)}&details=${encodeURIComponent(invitationText)}&location=${encodeURIComponent(meetUrl)}`;
    
    window.open(gCalUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Schedule Meeting</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                  Google Calendar & Zoom
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Plan ahead, set passcode, waiting room, and export calendar invites
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

        {/* Form Fields */}
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Meeting Topic / Title
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Weekly Standup & Live Demo"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Duration (mins)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
          </div>

          {/* Security & Access */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Security & Access Control
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] text-slate-300">Passcode</span>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-20 px-2 py-1 bg-slate-800 rounded font-mono text-center text-xs text-indigo-400 font-bold border border-slate-700"
                />
              </div>

              <div 
                onClick={() => setWaitingRoom(!waitingRoom)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer"
              >
                <span className="text-[11px] text-slate-300">Waiting Room</span>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${waitingRoom ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${waitingRoom ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 select-all">
            <div className="font-bold text-indigo-400">Meeting Link:</div>
            <div className="text-white break-all">{meetUrl}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleAddToGoogleCalendar}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Add to Google Calendar</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          <button
            onClick={handleCopyInvite}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Invitation'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
