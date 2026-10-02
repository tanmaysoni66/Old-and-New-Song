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
  Hand, 
  Star, 
  UserCheck, 
  UserX, 
  DoorClosed, 
  Sparkles,
  ShieldAlert,
  Trash2
} from 'lucide-react';

export interface ParticipantInfo {
  peerId: string;
  name: string;
  isHost?: boolean;
  micMuted: boolean;
  videoOff: boolean;
  handRaised?: boolean;
  isMe?: boolean;
  feedback?: string | null;
}

export interface WaitingParticipant {
  id: string;
  name: string;
  requestedAt: number;
}

interface PeoplePanelProps {
  participants: ParticipantInfo[];
  waitingList?: WaitingParticipant[];
  myPeerId: string;
  isHost: boolean;
  spotlightedPeerId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onMuteAll?: () => void;
  onAdmit?: (id: string) => void;
  onDeny?: (id: string) => void;
  onAdmitAll?: () => void;
  onSimulateKnock?: () => void;
  onToggleSpotlight?: (peerId: string) => void;
  onRemoveParticipant?: (peerId: string) => void;
}

export default function PeoplePanel({ 
  participants, 
  waitingList = [],
  myPeerId, 
  isHost,
  spotlightedPeerId,
  isOpen, 
  onClose, 
  onCopyLink, 
  onMuteAll,
  onAdmit,
  onDeny,
  onAdmitAll,
  onSimulateKnock,
  onToggleSpotlight,
  onRemoveParticipant,
}: PeoplePanelProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = participants.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const feedbackEmojiMap: Record<string, string> = {
    yes: '🟢 Yes',
    no: '🔴 No',
    slower: '🐢 Slower',
    faster: '🐇 Faster',
    coffee: '☕ Away',
  };

  return (
    <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shrink-0 text-white shadow-2xl animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
            <span>People ({participants.length})</span>
            {waitingList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                {waitingList.length} in Lobby
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-400">Roster, waiting room & participant controls</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons: Add People & Mute All */}
      <div className="p-4 border-b border-slate-800 space-y-2.5 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCopyLink}
            className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-indigo-500/30 transition-colors truncate"
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Invite Link</span>
          </button>

          {isHost && onMuteAll && (
            <button
              onClick={onMuteAll}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700 truncate"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">Mute All</span>
            </button>
          )}
        </div>

        {/* Demo Button to simulate participant knock if host wants to test waiting room */}
        {isHost && onSimulateKnock && (
          <button
            onClick={onSimulateKnock}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-[11px] text-slate-300 font-medium flex items-center justify-center gap-1.5 border border-slate-700/80 transition-colors"
            title="Simulate someone knocking in the lobby to test Waiting Room"
          >
            <DoorClosed className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Knocking Guest in Lobby</span>
          </button>
        )}

        {/* Search */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search for people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Waiting Room Lobby Section (Zoom & Google Meet Knocking) */}
        {isHost && waitingList.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <DoorClosed className="w-4 h-4 text-amber-400" />
                <span>Waiting Room ({waitingList.length})</span>
              </div>

              {onAdmitAll && waitingList.length > 1 && (
                <button
                  onClick={onAdmitAll}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                >
                  Admit All
                </button>
              )}
            </div>

            <div className="space-y-2">
              {waitingList.map((waiter) => (
                <div 
                  key={waiter.id}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {waiter.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Knocked {new Date(waiter.requestedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onAdmit && (
                      <button
                        onClick={() => onAdmit(waiter.id)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Admit</span>
                      </button>
                    )}

                    {onDeny && (
                      <button
                        onClick={() => onDeny(waiter.id)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition-colors"
                        title="Deny entry"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In-Call Participants List */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>IN CALL ({filtered.length})</span>
            {spotlightedPeerId && (
              <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> 1 Spotlighted
              </span>
            )}
          </div>

          {filtered.map((p) => {
            const isMe = p.peerId === myPeerId;
            const initial = p.name ? p.name.charAt(0).toUpperCase() : 'U';
            const isSpotlighted = spotlightedPeerId === p.peerId;

            return (
              <div
                key={p.peerId}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                  isSpotlighted
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-850 hover:bg-slate-800/60 border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0 ${
                    isSpotlighted 
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-600 ring-2 ring-amber-400' 
                      : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                  }`}>
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-semibold text-white truncate">
                        {p.name} {isMe && '(You)'}
                      </span>
                      {p.isHost && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 text-[9px] font-bold border border-indigo-700/50">
                          Host
                        </span>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                      {p.handRaised && (
                        <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                          <Hand className="w-2.5 h-2.5" /> Hand
                        </span>
                      )}

                      {p.feedback && feedbackEmojiMap[p.feedback] && (
                        <span className="text-slate-300 bg-slate-800 px-1 rounded border border-slate-700 font-medium">
                          {feedbackEmojiMap[p.feedback]}
                        </span>
                      )}

                      {isSpotlighted && (
                        <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> Spotlighted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Participant Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                  {p.micMuted ? (
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  )}

                  {/* Spotlight for Everyone button (Zoom & Meet) */}
                  {isHost && onToggleSpotlight && (
                    <button
                      onClick={() => onToggleSpotlight(p.peerId)}
                      className={`p-1 rounded-lg transition-colors ${
                        isSpotlighted 
                          ? 'text-amber-400 bg-amber-500/20' 
                          : 'hover:text-amber-400 hover:bg-slate-800'
                      }`}
                      title={isSpotlighted ? 'Remove Spotlight' : 'Spotlight for Everyone (Zoom)'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isSpotlighted ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  {/* Remove attendee button */}
                  {isHost && !p.isHost && onRemoveParticipant && (
                    <button
                      onClick={() => onRemoveParticipant(p.peerId)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Remove participant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
