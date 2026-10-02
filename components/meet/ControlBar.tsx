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
  Sparkles, 
  Settings, 
  Circle,
  ShieldCheck, 
  Grid,
  FileSpreadsheet,
  PictureInPicture2,
  Clock,
  Bot,
  DoorClosed,
  Lock,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  Coffee
} from 'lucide-react';

interface ControlBarProps {
  roomId: string;
  isHost: boolean;
  micMuted: boolean;
  videoOff: boolean;
  handRaised: boolean;
  isSharingScreen: boolean;
  captionsActive: boolean;
  isRecording: boolean;
  participantCount: number;
  activeSidePanel: 'none' | 'info' | 'people' | 'chat' | 'activities';
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleHand: () => void;
  onToggleScreenShare: () => void;
  onToggleCaptions: () => void;
  onToggleRecording: () => void;
  onSendReaction: (emoji: string) => void;
  onSendFeedback?: (type: 'yes' | 'no' | 'slower' | 'faster' | 'coffee') => void;
  onOpenWhiteboard: () => void;
  onOpenBackgrounds: () => void;
  onOpenLayoutModal: () => void;
  onOpenHostControls: () => void;
  onOpenSecurityShield: () => void;
  onOpenAICompanion: () => void;
  onOpenAgendaTimer: () => void;
  onOpenAttendance: () => void;
  onTogglePiP: () => void;
  onTogglePanel: (panel: 'info' | 'people' | 'chat' | 'activities') => void;
  onLeaveCall: () => void;
  onOpenSettings: () => void;
}

const REACTIONS = ['💖', '👍', '👏', '😂', '😮', '🎉', '🔥', '🚀'];

const NON_VERBAL = [
  { id: 'yes', label: 'Yes', icon: '🟢' },
  { id: 'no', label: 'No', icon: '🔴' },
  { id: 'slower', label: 'Slower', icon: '🐢' },
  { id: 'faster', label: 'Faster', icon: '🐇' },
  { id: 'coffee', label: 'Away', icon: '☕' },
];

export default function ControlBar({
  roomId,
  isHost,
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
  onSendFeedback,
  onOpenWhiteboard,
  onOpenBackgrounds,
  onOpenLayoutModal,
  onOpenHostControls,
  onOpenSecurityShield,
  onOpenAICompanion,
  onOpenAgendaTimer,
  onOpenAttendance,
  onTogglePiP,
  onTogglePanel,
  onLeaveCall,
  onOpenSettings,
}: ControlBarProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <footer className="h-20 bg-slate-950 px-3 sm:px-6 flex items-center justify-between border-t border-slate-900 select-none relative z-40">
      
      {/* Left: Time & Room Code & Quick Host Tools */}
      <div className="hidden lg:flex items-center gap-2 text-white">
        <span className="font-mono text-xs font-semibold tracking-wider text-slate-300">
          {roomId}
        </span>

        {isRecording && (
          <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[10px] font-bold animate-pulse">
            <Circle className="w-2.5 h-2.5 fill-rose-500" />
            <span>REC</span>
          </div>
        )}

        {/* Meeting Timer & Agenda Button (Host Only) */}
        {isHost && onOpenAgendaTimer && (
          <button
            onClick={onOpenAgendaTimer}
            className="ml-2 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-800 transition-colors"
            title="Meeting Timer & Agenda (Host Control)"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Timer &amp; Agenda</span>
          </button>
        )}

        {/* AI Companion Quick Button (Host Only) */}
        {isHost && onOpenAICompanion && (
          <button
            onClick={onOpenAICompanion}
            className="px-2.5 py-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-indigo-700/50 shadow-sm transition-colors"
            title="AI Companion & Live Meeting Minutes (Host Only)"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Companion</span>
          </button>
        )}
      </div>

      {/* Center Action Buttons (Google Meet & Zoom Signature Dock) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 mx-auto md:mx-0">
        
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

        {/* Raise Hand (User / Student feature) */}
        <button
          onClick={onToggleHand}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
            handRaised
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title={handRaised ? 'Lower hand' : 'Raise hand (हाथ उठाएं)'}
        >
          <Hand className="w-5 h-5" />
        </button>

        {/* Reactions / Emojis & Like Button */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              showReactions ? 'bg-slate-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Send Like / Emoji Reactions"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Reaction & Non-Verbal Popover */}
          {showReactions && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 p-3 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 z-50 animate-in zoom-in-95 space-y-2.5 min-w-[280px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Reactions &amp; Likes
              </div>
              {/* Emojis row */}
              <div className="flex items-center justify-between gap-1">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setShowReactions(false);
                    }}
                    className="w-8 h-8 rounded-full hover:bg-slate-800 hover:scale-125 transition-all text-base flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Non-Verbal Feedback row */}
              {onSendFeedback && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                  {NON_VERBAL.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSendFeedback(item.id as any);
                        setShowReactions(false);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs flex items-center gap-1 text-slate-200 transition-colors"
                      title={item.label}
                    >
                      <span>{item.icon}</span>
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
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
          title={isSharingScreen ? 'Stop presenting' : 'Present / Share screen'}
        >
          <MonitorUp className="w-5 h-5" />
        </button>

        {/* Whiteboard / Jamboard (Host or collaborative) */}
        {isHost && onOpenWhiteboard && (
          <button
            onClick={onOpenWhiteboard}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full hidden sm:flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Open collaborative whiteboard"
          >
            <PenTool className="w-5 h-5" />
          </button>
        )}

        {/* Zoom Security Shield Quick Button (Host Only) */}
        {isHost && onOpenSecurityShield && (
          <button
            onClick={onOpenSecurityShield}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-all shadow-sm"
            title="Admin &amp; Host Security Shield (Lock, Permissions &amp; Waiting Room)"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        )}

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
            <div className="absolute bottom-14 right-0 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-200">
              
              {/* Visual effects & Backdrops */}
              <button
                onClick={() => {
                  onOpenBackgrounds();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Virtual Backdrops &amp; Lighting</span>
              </button>

              {/* Host only: AI Companion */}
              {isHost && (
                <button
                  onClick={() => {
                    onOpenAICompanion?.();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left text-indigo-300"
                >
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span>AI Companion &amp; Meeting Minutes</span>
                </button>
              )}

              {/* Host only: Timer & Agenda */}
              {isHost && (
                <button
                  onClick={() => {
                    onOpenAgendaTimer?.();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left text-amber-300"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Speaker Timer &amp; Agenda</span>
                </button>
              )}

              {/* Change layout */}
              <button
                onClick={() => {
                  onOpenLayoutModal();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <Grid className="w-4 h-4 text-blue-400" />
                <span>Change layout (Grid / Spotlight)</span>
              </button>

              {/* Whiteboard (Host only) */}
              {isHost && (
                <button
                  onClick={() => {
                    onOpenWhiteboard();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left"
                >
                  <PenTool className="w-4 h-4 text-emerald-400" />
                  <span>Whiteboard (Open a Jam)</span>
                </button>
              )}

              {/* Host only: Record meeting */}
              {isHost && (
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
              )}

              {/* Picture in picture */}
              <button
                onClick={() => {
                  onTogglePiP();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left"
              >
                <PictureInPicture2 className="w-4 h-4 text-amber-400" />
                <span>Open Picture-in-Picture (PiP)</span>
              </button>

              {/* Host only: Attendance Sheet */}
              {isHost && (
                <button
                  onClick={() => {
                    onOpenAttendance?.();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left text-teal-300"
                >
                  <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                  <span>Download Attendance (CSV)</span>
                </button>
              )}

              {/* Host only: Security Shield */}
              {isHost && (
                <button
                  onClick={() => {
                    onOpenSecurityShield?.();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left text-emerald-300"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security &amp; Waiting Room</span>
                </button>
              )}

              {/* Settings */}
              <button
                onClick={() => {
                  onOpenSettings();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-left border-t border-slate-800 mt-1 pt-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Device &amp; Audio Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* End / Leave Call Button */}
        <button
          onClick={onLeaveCall}
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
          title={isHost ? 'End call or Leave meeting' : 'Exit / Leave call'}
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold">Exit</span>
        </button>

      </div>

      {/* Right Controls: Details, People, Chat, Activities */}
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
          title="People & Waiting Room"
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
          title="In-call chat & Direct Messaging"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Google Meet Activities Icon (Triangle, Square, Circle) */}
        <button
          onClick={() => onTogglePanel('activities')}
          className={`p-2.5 rounded-full transition-colors ${
            activeSidePanel === 'activities'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title="Activities (Polls, Q&A, Breakout rooms)"
        >
          <div className="flex items-center gap-0.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="w-2 h-2 bg-yellow-400" />
            <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-rose-400" />
          </div>
        </button>

      </div>

    </footer>
  );
}
