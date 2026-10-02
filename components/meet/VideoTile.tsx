'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Pin, 
  Hand, 
  Maximize2 
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
  filterEffect?: string;
  onTogglePin?: () => void;
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
  filterEffect,
  onTogglePin,
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

  return (
    <div 
      className={`relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center select-none transition-all border ${
        isSpeaking
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

      {/* Hand Raised Banner / Badge */}
      {handRaised && (
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg animate-bounce">
          <Hand className="w-3.5 h-3.5 fill-current" />
          <span>Hand raised</span>
        </div>
      )}

      {/* Pin Button */}
      {onTogglePin && (
        <button
          onClick={onTogglePin}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            isPinned
              ? 'bg-blue-600 text-white'
              : 'bg-black/40 text-slate-300 hover:bg-black/60 hover:text-white'
          }`}
          title={isPinned ? 'Unpin' : 'Pin to spotlight'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Bottom Name Pill & Audio Status */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-2 text-white text-xs font-medium max-w-[80%]">
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
