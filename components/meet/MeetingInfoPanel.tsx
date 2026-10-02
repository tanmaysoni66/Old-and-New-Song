'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Paperclip, Info } from 'lucide-react';

interface MeetingInfoPanelProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

export default function MeetingInfoPanel({ 
  roomId, 
  isOpen, 
  onClose, 
  onCopyLink,
  copied 
}: MeetingInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'attachments'>('info');

  if (!isOpen) return null;

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/meet/${roomId}` : `https://meet.google.com/${roomId}`;

  return (
    <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shrink-0 text-white shadow-2xl animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-base tracking-tight text-white">
          Meeting details
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 shrink-0 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Joining info
        </button>
        <button
          onClick={() => setActiveTab('attachments')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === 'attachments'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Attachments (0)
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        {activeTab === 'info' ? (
          <>
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Joining info
              </span>
              <p className="text-xs text-slate-200 font-mono break-all select-all bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                {joinUrl}
              </p>
            </div>

            <button
              onClick={onCopyLink}
              className="w-full py-2.5 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Joining info copied!' : 'Copy joining info'}</span>
            </button>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p>Dial-in: (US) +1 415-555-0199</p>
              <p>PIN: 482 910 234#</p>
              <p className="text-slate-500 pt-2">
                More phone numbers available globally.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs space-y-2">
            <Paperclip className="w-8 h-8 mx-auto opacity-50" />
            <p>Google Calendar attachments will appear here</p>
          </div>
        )}
      </div>

    </div>
  );
}
