'use client';

import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  DoorClosed, 
  Mic, 
  Video, 
  MonitorUp, 
  MessageSquare, 
  UserX, 
  AlertOctagon, 
  Check, 
  PenTool,
  VolumeX,
  Smile
} from 'lucide-react';

export interface SecuritySettings {
  lockMeeting: boolean;
  waitingRoom: boolean;
  hideProfilePictures: boolean;
  muteOnEntry: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowRename: boolean;
  allowUnmute: boolean;
  allowStartVideo: boolean;
  allowWhiteboard: boolean;
  allowReactions: boolean;
}

interface SecurityShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  settings: SecuritySettings;
  onChangeSettings: (settings: SecuritySettings) => void;
  onSuspendAllActivities: () => void;
  onMuteAll: () => void;
}

export default function SecurityShieldModal({
  isOpen,
  onClose,
  isHost,
  settings,
  onChangeSettings,
  onSuspendAllActivities,
  onMuteAll,
}: SecurityShieldModalProps) {
  if (!isOpen) return null;

  const toggle = (key: keyof SecuritySettings) => {
    onChangeSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Security & Host Controls</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                  Zoom & Meet
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Manage access, waiting room, and attendee permissions
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

        {/* Quick Host Shields */}
        <div className="space-y-2 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Room Protection
          </div>

          {/* 1. Lock Meeting */}
          <div 
            onClick={() => toggle('lockMeeting')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              settings.lockMeeting 
                ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock className={`w-4 h-4 ${settings.lockMeeting ? 'text-amber-400' : 'text-slate-400'}`} />
              <div>
                <span className="font-semibold text-white block">Lock Meeting</span>
                <span className="text-[10px] text-slate-400">No new participants can join this call</span>
              </div>
            </div>
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${settings.lockMeeting ? 'bg-amber-500' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.lockMeeting ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* 2. Enable Waiting Room */}
          <div 
            onClick={() => toggle('waitingRoom')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              settings.waitingRoom 
                ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <DoorClosed className={`w-4 h-4 ${settings.waitingRoom ? 'text-indigo-400' : 'text-slate-400'}`} />
              <div>
                <span className="font-semibold text-white block">Enable Waiting Room</span>
                <span className="text-[10px] text-slate-400">Host must admit attendees before entry</span>
              </div>
            </div>
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${settings.waitingRoom ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.waitingRoom ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* 3. Mute Upon Entry */}
          <div 
            onClick={() => toggle('muteOnEntry')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              settings.muteOnEntry 
                ? 'bg-blue-950/30 border-blue-500/50 text-blue-200' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <VolumeX className={`w-4 h-4 ${settings.muteOnEntry ? 'text-blue-400' : 'text-slate-400'}`} />
              <div>
                <span className="font-semibold text-white block">Mute Upon Entry</span>
                <span className="text-[10px] text-slate-400">Automatically silence new joining mics</span>
              </div>
            </div>
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${settings.muteOnEntry ? 'bg-blue-500' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.muteOnEntry ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        {/* Attendee Permissions */}
        <div className="space-y-2 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Allow Participants To
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'allowScreenShare', label: 'Share Screen', icon: MonitorUp },
              { key: 'allowChat', label: 'Chat & Message', icon: MessageSquare },
              { key: 'allowUnmute', label: 'Unmute Themselves', icon: Mic },
              { key: 'allowStartVideo', label: 'Start Video', icon: Video },
              { key: 'allowWhiteboard', label: 'Use Whiteboard', icon: PenTool },
              { key: 'allowReactions', label: 'Send Reactions', icon: Smile },
            ].map(({ key, label, icon: Icon }) => {
              const active = settings[key as keyof SecuritySettings];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key as keyof SecuritySettings)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    active
                      ? 'bg-slate-800 border-indigo-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500 line-through'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-medium">{label}</span>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Emergency Lockdown Action */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={onSuspendAllActivities}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Suspend Participant Activities (Emergency Freeze)</span>
          </button>
          <p className="text-[10px] text-center text-slate-400">
            Emergency lockdown: mutes all mics, stops cameras & screen share, and locks the room.
          </p>
        </div>
      </div>
    </div>
  );
}
