'use client';

import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  MonitorUp, 
  Smile, 
  MoreVertical, 
  PhoneOff, 
  Info, 
  Users, 
  MessageSquare, 
  Subtitles, 
  PenTool, 
  Disc, 
  Maximize, 
  Minimize, 
  Sparkles,
  Settings,
  Circle
} from 'lucide-react';

interface ControlBarProps {
  roomId: string;
  micMuted: boolean;
  videoOff: boolean;
  handRaised: boolean;
  isSharingScreen: boolean;
  captionsActive: boolean;
  isRecording: boolean;
  participantCount: number;
  activeSidePanel: 'none' | 'info' | 'people' | 'chat';
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleHand: () => void;
  onToggleScreenShare: () => void;
  onToggleCaptions: () => void;
  onToggleRecording: () => void;
  onSendReaction: (emoji: string) => void;
  onOpenWhiteboard: () => void;
  onTogglePanel: (panel: 'info' | 'people' | 'chat') => void;
  onLeaveCall: () => void;
  onOpenSettings: () => void;
}

const REACTIONS = ['💖', '👍', '👏', '😂', '😮', '🎉', '🔥', '🚀'];

export default function ControlBar({
  roomId,
  micMuted,
  videoOff,
  handRaised,
  isSharingScreen,
  captionsActive,
  isRecording,
  participantCount,
  activeSidePanel,
  onToggleMic,
  onToggleVideo,
  onToggleHand,
  onToggleScreenShare,
  onToggleCaptions,
  onToggleRecording,
  onSendReaction,
  onOpenWhiteboard,
  onTogglePanel,
  onLeaveCall,
  onOpenSettings,
}: ControlBarProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <footer className="h-20 bg-slate-950 px-4 sm:px-6 flex items-center justify-between border-t border-slate-900 select-none relative z-40">
      
      {/* Left: Time & Room Code */}
      <div className="hidden md:flex items-center gap-2 text-white">
        <span className="font-mono text-xs font-semibold tracking-wider text-slate-300">
          {roomId}
        </span>
        <button
          onClick={() => onTogglePanel('info')}
          className="text-[11px] text-slate-400 hover:text-white underline ml-1"
        >
          Details
        </button>

        {isRecording && (
          <div className="flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[10px] font-bold animate-pulse">
            <Circle className="w-2.5 h-2.5 fill-rose-500" />
            <span>REC</span>
          </div>
        )}
      </div>

      {/* Center Action Buttons (The Google Meet Signature Dock) */}
      <div className="flex items-center gap-2 sm:gap-3 mx-auto md:mx-0">
        
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
            micMuted
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title={micMuted ? 'Turn on microphone (Ctrl + D)' : 'Turn off microphone (Ctrl + D)'}
        >
          {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleVideo}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
            videoOff
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title={videoOff ? 'Turn on camera (Ctrl + E)' : 'Turn off camera (Ctrl + E)'}
        >
          {videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Live Captions (CC) */}
        <button
          onClick={onToggleCaptions}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full hidden sm:flex items-center justify-center transition-all ${
            captionsActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Turn on live captions"
        >
          <Subtitles className="w-5 h-5" />
        </button>

        {/* Raise Hand */}
        <button
          onClick={onToggleHand}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
            handRaised
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title={handRaised ? 'Lower hand' : 'Raise hand'}
        >
          <Hand className="w-5 h-5" />
        </button>

        {/* Reactions / Emojis */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              showReactions ? 'bg-slate-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Send a reaction"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Reaction Popover */}
          {showReactions && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 p-2 bg-slate-800/95 backdrop-blur-md rounded-full shadow-2xl border border-slate-700 flex items-center gap-1 z-50 animate-in zoom-in-95">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowReactions(false);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-slate-700 hover:scale-125 transition-all text-base flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Screen Share (Present now) */}
        <button
          onClick={onToggleScreenShare}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
            isSharingScreen
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title={isSharingScreen ? 'Stop presenting' : 'Present now'}
        >
          <MonitorUp className="w-5 h-5" />
        </button>

        {/* Whiteboard / Jamboard */}
        <button
          onClick={onOpenWhiteboard}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full hidden sm:flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          title="Open collaborative whiteboard"
        >
          <PenTool className="w-5 h-5" />
        </button>

        {/* More Options Popover */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              showMoreMenu ? 'bg-slate-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute bottom-14 right-0 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-200">
              <button
                onClick={() => {
                  onOpenWhiteboard();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <PenTool className="w-4 h-4 text-indigo-400" />
                <span>Whiteboard (Open a Jam)</span>
              </button>

              <button
                onClick={() => {
                  onToggleRecording();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <Disc className={`w-4 h-4 ${isRecording ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>{isRecording ? 'Stop recording' : 'Record meeting (MP4)'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings (Audio/Video)</span>
              </button>
            </div>
          )}
        </div>

        {/* End Call Button (Google Meet Signature Red Pill) */}
        <button
          onClick={onLeaveCall}
          className="h-10 sm:h-11 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
          title="Leave call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold">Leave</span>
        </button>

      </div>

      {/* Right Controls: Details, People, Chat */}
      <div className="flex items-center gap-1 sm:gap-2">
        
        {/* Info */}
        <button
          onClick={() => onTogglePanel('info')}
          className={`p-2.5 rounded-full transition-colors ${
            activeSidePanel === 'info'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title="Meeting details"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* People */}
        <button
          onClick={() => onTogglePanel('people')}
          className={`relative p-2.5 rounded-full transition-colors ${
            activeSidePanel === 'people'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title="People"
        >
          <Users className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-bold text-white border border-slate-700">
            {participantCount}
          </span>
        </button>

        {/* Chat */}
        <button
          onClick={() => onTogglePanel('chat')}
          className={`p-2.5 rounded-full transition-colors ${
            activeSidePanel === 'chat'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title="Chat with everyone"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

      </div>

    </footer>
  );
}
