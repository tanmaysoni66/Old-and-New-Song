'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Video, 
  Keyboard, 
  Link as LinkIcon, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  X, 
  GraduationCap, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import MeetHeader from '@/components/meet/MeetHeader';

export default function MeetHomePage() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState('');
  const [newMeetingMenuOpen, setNewMeetingMenuOpen] = useState(false);
  const [createdLaterLink, setCreatedLaterLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Generate random Google Meet format code e.g. "xqm-vwrt-kzp"
  const generateMeetingCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segment = (len: number) => {
      let res = '';
      for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    };
    return `${segment(3)}-${segment(4)}-${segment(3)}`;
  };

  const handleStartInstantMeeting = () => {
    const code = generateMeetingCode();
    router.push(`/meet/${code}`);
  };

  const handleCreateMeetingForLater = () => {
    const code = generateMeetingCode();
    setCreatedLaterLink(code);
    setNewMeetingMenuOpen(false);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingCode.trim()) return;
    let cleanCode = meetingCode.trim();
    if (cleanCode.includes('/meet/')) {
      cleanCode = cleanCode.split('/meet/')[1];
    }
    cleanCode = cleanCode.replace(/[^a-zA-Z0-9-]/g, '');
    router.push(`/meet/${cleanCode}`);
  };

  const handleCopyLink = () => {
    if (!createdLaterLink) return;
    const url = `${window.location.origin}/meet/${createdLaterLink}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const carouselCards = [
    {
      title: 'Get a link you can share',
      description: 'Click New meeting to get a link you can send to people you want to meet with.',
      badge: 'Easy Invites',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      title: 'See everyone together in HD grid',
      description: 'To see more people at the same time, experience adaptive video layouts with active speaker glow.',
      badge: 'Adaptive Grid',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'Plan ahead and collaborate live',
      description: 'Use the interactive collaborative whiteboard, live captions, and in-call screen sharing.',
      badge: 'Interactive Tools',
      color: 'from-purple-600 to-pink-700',
    },
    {
      title: 'Your meeting is safe & encrypted',
      description: 'WebRTC end-to-end encrypted video streaming with Firestore real-time security.',
      badge: 'Protected',
      color: 'from-amber-600 to-orange-700',
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Standard Google Meet Header */}
      <MeetHeader />

      {/* Main Hero Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Column: Heading, Instant Meeting Button & Code Input */}
        <div className="w-full lg:max-w-xl space-y-7 text-center lg:text-left">
          
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-normal tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Video calls and meetings for{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                everyone
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
              Google Meet enables you to connect, collaborate, and celebrate from anywhere with crystal clear audio, video, and screen sharing.
            </p>
          </div>

          {/* Action Row: [New Meeting] + [Enter Code] + [Join] */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 relative">
            
            {/* New Meeting Dropdown Button */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setNewMeetingMenuOpen(!newMeetingMenuOpen)}
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-102"
              >
                <Video className="w-4 h-4" />
                <span>New meeting</span>
              </button>

              {/* Signature Google Meet Dropdown Menu */}
              {newMeetingMenuOpen && (
                <div className="absolute top-14 left-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-800 dark:text-slate-200 text-left">
                  
                  <button
                    onClick={handleCreateMeetingForLater}
                    className="w-full px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Create a meeting for later</div>
                      <div className="text-[11px] text-slate-500">Get a link you can share with others</div>
                    </div>
                  </button>

                  <button
                    onClick={handleStartInstantMeeting}
                    className="w-full px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Start an instant meeting</div>
                      <div className="text-[11px] text-slate-500">Jump right into a video call now</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setNewMeetingMenuOpen(false);
                      handleStartInstantMeeting();
                    }}
                    className="w-full px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                    <div>
                      <div className="font-semibold">Schedule in Google Calendar</div>
                      <div className="text-[11px] text-slate-500">Plan ahead with calendar invites</div>
                    </div>
                  </button>

                </div>
              )}
            </div>

            {/* Code / Link Input Field */}
            <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Keyboard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter a code or link"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!meetingCode.trim()}
                className="px-5 py-3 rounded-full font-semibold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:pointer-events-none text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                Join
              </button>
            </form>

          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
            <span className="text-slate-400">
              सुरक्षित रियल-टाइम WebRTC लाइव स्ट्रीमिंग
            </span>
            <span>•</span>
            <Link 
              href="/admin-panel" 
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>कोचिंग एडमिन पैनल (8 मॉड्यूल्स) &gt;</span>
            </Link>
          </div>

        </div>

        {/* Right Column: Google Meet Feature Presentation Carousel */}
        <div className="w-full lg:max-w-md flex flex-col items-center">
          
          <div className="relative w-full aspect-square max-w-sm rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between overflow-hidden">
            
            {/* Top Graphic Circle */}
            <div className="flex justify-center">
              <div className={`w-36 h-36 rounded-full bg-gradient-to-tr ${carouselCards[activeSlide].color} text-white flex items-center justify-center shadow-2xl shadow-indigo-500/20 animate-in zoom-in-90 duration-300`}>
                <Video className="w-16 h-16" />
              </div>
            </div>

            {/* Slide Content */}
            <div className="text-center space-y-2 pt-4">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                {carouselCards[activeSlide].badge}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {carouselCards[activeSlide].title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                {carouselCards[activeSlide].description}
              </p>
            </div>

            {/* Carousel Navigation Dots */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {carouselCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === i ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

          </div>

          {/* Quick Instant Meeting Launcher Card */}
          <div className="mt-4 w-full max-w-sm p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
            <span className="text-blue-900 dark:text-blue-200 font-medium">
              त्वरित लाइव क्लास या मीटिंग शुरू करें
            </span>
            <button
              onClick={handleStartInstantMeeting}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow transition-all flex items-center gap-1"
            >
              Start Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </main>

      {/* Modal: "Here's the link to your meeting" (Create for Later) */}
      {createdLaterLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Here&apos;s the link to your meeting
              </h3>
              <button
                onClick={() => setCreatedLaterLink(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Copy this link and send it to people you want to meet with. Be sure to save it so you can use it later, too.
            </p>

            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/meet/${createdLaterLink}` : `meet.google.com/${createdLaterLink}`}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                title="Copy joining link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCreatedLaterLink(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => router.push(`/meet/${createdLaterLink}`)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow"
              >
                Join meeting now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Google Meet Clone</span>
          <span>•</span>
          <span>WebRTC Realtime Video & Audio</span>
        </div>
        <div>
          <span>© 2026 Google Meet Experience</span>
        </div>
      </footer>

    </div>
  );
}
