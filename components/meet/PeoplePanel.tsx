'use client';

import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Mic, 
  MicOff, 
  Pin, 
  MoreVertical, 
  VolumeX, 
  Search,
  Hand
} from 'lucide-react';

export interface ParticipantInfo {
  peerId: string;
  name: string;
  isHost?: boolean;
  micMuted: boolean;
  videoOff: boolean;
  handRaised?: boolean;
  isMe?: boolean;
}

interface PeoplePanelProps {
  participants: ParticipantInfo[];
  myPeerId: string;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onMuteAll?: () => void;
}

export default function PeoplePanel({ 
  participants, 
  myPeerId, 
  isOpen, 
  onClose, 
  onCopyLink,
  onMuteAll 
}: PeoplePanelProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = participants.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shrink-0 text-white shadow-2xl animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-base tracking-tight text-white">
          People ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons: Add People & Mute All */}
      <div className="p-4 border-b border-slate-800 space-y-3 shrink-0">
        <button
          onClick={onCopyLink}
          className="w-full py-2.5 px-4 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold flex items-center justify-center gap-2 border border-indigo-500/30 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add others (Copy joining link)</span>
        </button>

        {onMuteAll && participants.length > 1 && (
          <button
            onClick={onMuteAll}
            className="w-full py-2 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <VolumeX className="w-4 h-4" />
            <span>Mute everyone</span>
          </button>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search for people"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          IN CALL
        </div>

        {filtered.map((p) => {
          const isMe = p.peerId === myPeerId;
          const initial = p.name ? p.name.charAt(0).toUpperCase() : 'U';

          return (
            <div
              key={p.peerId}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {initial}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">
                      {p.name} {isMe && '(You)'}
                    </span>
                    {p.isHost && (
                      <span className="text-[10px] text-slate-400">Meeting host</span>
                    )}
                  </div>
                  {p.handRaised && (
                    <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                      <Hand className="w-3 h-3" /> Hand raised
                    </span>
                  )}
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-2 text-slate-400">
                {p.micMuted ? (
                  <MicOff className="w-4 h-4 text-rose-400" />
                ) : (
                  <Mic className="w-4 h-4 text-emerald-400" />
                )}
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity">
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
