'use client';

import React from 'react';
import { 
  X, 
  ShieldCheck, 
  MonitorUp, 
  MessageSquare, 
  Mic, 
  Video, 
  Lock, 
  VolumeX,
  Sparkles
} from 'lucide-react';

export interface HostPermissions {
  allowScreenShare: boolean;
  allowChat: boolean;
  allowMic: boolean;
  allowVideo: boolean;
  lockMeeting: boolean;
}

interface HostControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: HostPermissions;
  onChangePermissions: (p: HostPermissions) => void;
  onMuteAll: () => void;
}

export default function HostControlsModal({
  isOpen,
  onClose,
  permissions,
  onChangePermissions,
  onMuteAll,
}: HostControlsModalProps) {
  if (!isOpen) return null;

  const toggle = (key: keyof HostPermissions) => {
    onChangePermissions({
      ...permissions,
      [key]: !permissions[key],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Host controls
              </h3>
              <p className="text-[11px] text-slate-400">
                Use these settings to keep your meeting safe and organized.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions Toggles */}
        <div className="space-y-4 text-xs">
          
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            MEETING PARTICIPANTS CAN
          </div>

          {/* 1. Share screen */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <MonitorUp className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-semibold text-white block">Share their screen</span>
                <span className="text-[11px] text-slate-400">Allow participants to present</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.allowScreenShare}
              onChange={() => toggle('allowScreenShare')}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 2. Send chat */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-white block">Send chat messages</span>
                <span className="text-[11px] text-slate-400">Allow in-call text messaging</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.allowChat}
              onChange={() => toggle('allowChat')}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 3. Turn on microphone */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <Mic className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-semibold text-white block">Turn on their microphone</span>
                <span className="text-[11px] text-slate-400">Uncheck to keep all attendees muted</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.allowMic}
              onChange={() => toggle('allowMic')}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 4. Turn on video */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <Video className="w-4 h-4 text-rose-400" />
              <div>
                <span className="font-semibold text-white block">Turn on their video</span>
                <span className="text-[11px] text-slate-400">Allow webcam streams</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.allowVideo}
              onChange={() => toggle('allowVideo')}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 5. Meeting lock */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-semibold text-white block">Lock meeting</span>
                <span className="text-[11px] text-slate-400">Block new participants from joining</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.lockMeeting}
              onChange={() => toggle('lockMeeting')}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </div>

        </div>

        {/* Quick Mute All Button */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              onMuteAll();
              onClose();
            }}
            className="w-full py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <VolumeX className="w-4 h-4 text-rose-400" />
            <span>Mute everyone in call</span>
          </button>
        </div>

      </div>
    </div>
  );
}
