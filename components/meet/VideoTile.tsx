'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Pin, 
  Hand, 
  Star,
  Sparkles
} from 'lucide-react';

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isMe?: boolean;
  micMuted: boolean;
  videoOff: boolean;
  handRaised?: boolean;
  isSpeaking?: boolean;
  isPinned?: boolean;
  isSpotlighted?: boolean;
  feedbackBadge?: string | null;
  filterEffect?: string;
  onTogglePin?: () => void;
  onToggleSpotlight?: () => void;
  canSpotlight?: boolean;
}

export default function VideoTile({
  stream,
  name,
  isMe,
  micMuted,
  videoOff,
  handRaised,
  isSpeaking,
  isPinned,
  isSpotlighted,
  feedbackBadge,
  filterEffect,
  onTogglePin,
  onToggleSpotlight,
  canSpotlight,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (stream && stream.getTracks().length > 0) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  const feedbackEmojiMap: Record<string, string> = {
    yes: '🟢 Yes',
    no: '🔴 No',
    slower: '🐢 Slower',
    faster: '🐇 Faster',
    coffee: '☕ Away',
  };

  return (
    <div 
      className={`relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center select-none transition-all border ${
        isSpotlighted
          ? 'border-amber-400 ring-4 ring-amber-400/50 shadow-2xl shadow-amber-500/20'
          : isSpeaking
            ? 'border-blue-500 ring-4 ring-blue-500/40 shadow-xl shadow-blue-500/10'
            : 'border-slate-800'
      }`}
    >
      
      {/* Real Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMe} // Mute self video to avoid local echo
        className={`w-full h-full object-cover transition-all ${
          videoOff ? 'hidden' : 'block'
        } ${isMe ? 'scale-x-[-1]' : ''}`} // Mirror local camera view like Google Meet
        style={{
          filter: filterEffect || 'none',
        }}
      />

      {/* Avatar Fallback when camera is Off */}
      {videoOff && (
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-xl ring-4 ring-white/10 animate-in zoom-in-90">
            {initial}
          </div>
          <span className="text-xs font-semibold text-slate-300">
            {name}
          </span>
        </div>
      )}

      {/* Top Left Badges Container */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
        {/* Spotlight Badge */}
        {isSpotlighted && (
          <div className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-lg">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Spotlight</span>
          </div>
        )}

        {/* Hand Raised Banner / Badge */}
        {handRaised && (
          <div className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg animate-bounce">
            <Hand className="w-3.5 h-3.5 fill-current" />
            <span>Hand raised</span>
          </div>
        )}

        {/* Non-Verbal Feedback Badge (Zoom Flagship) */}
        {feedbackBadge && feedbackEmojiMap[feedbackBadge] && (
          <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 backdrop-blur-md text-white font-semibold text-[11px] flex items-center gap-1 shadow-md">
            <span>{feedbackEmojiMap[feedbackBadge]}</span>
          </div>
        )}
      </div>

      {/* Top Right Pin & Spotlight Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        {canSpotlight && onToggleSpotlight && (
          <button
            onClick={onToggleSpotlight}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isSpotlighted
                ? 'bg-amber-500 text-slate-950'
                : 'bg-black/40 text-slate-300 hover:bg-black/60 hover:text-white'
            }`}
            title={isSpotlighted ? 'Remove Spotlight' : 'Spotlight for Everyone'}
          >
            <Star className="w-3.5 h-3.5" />
          </button>
        )}

        {onTogglePin && (
          <button
            onClick={onTogglePin}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isPinned
                ? 'bg-blue-600 text-white'
                : 'bg-black/40 text-slate-300 hover:bg-black/60 hover:text-white'
            }`}
            title={isPinned ? 'Unpin' : 'Pin to my screen'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom Name Pill & Audio Status */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-2 text-white text-xs font-medium max-w-[80%] z-20">
        <span className="truncate">
          {name} {isMe && '(You)'}
        </span>

        {micMuted ? (
          <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center shrink-0">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-0.5 shrink-0">
            <span className={`w-1 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            <span className={`w-1 h-3 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            <span className={`w-1 h-1.5 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
          </div>
        )}
      </div>

    </div>
  );
}
