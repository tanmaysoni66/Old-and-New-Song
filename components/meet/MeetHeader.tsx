'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  HelpCircle, 
  MessageSquareWarning, 
  Grid, 
  Video, 
  GraduationCap
} from 'lucide-react';

export default function MeetHeader() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      setCurrentTime(`${timeStr} • ${dateStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 select-none">
      
      {/* Left: Google Meet Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* Authentic Google Meet 4-Color Camera Icon */}
          <div className="w-10 h-10 flex items-center justify-center relative">
            <svg viewBox="0 0 87.2 73.1" className="w-8 h-8">
              {/* Green Base */}
              <path d="M51.9 36.6l10.3-8.8v26.7l-10.3-8.9V36.6z" fill="#00832d" />
              {/* Red Top Left */}
              <path d="M0 52.8V20.3C0 14.8 4.5 10.3 10 10.3h22.6v23.2L10 52.8H0z" fill="#ea4335" />
              {/* Blue Right Angle */}
              <path d="M0 52.8l22.6-19.3v39.6H10c-5.5 0-10-4.5-10-10V52.8z" fill="#4285f4" />
              {/* Yellow Top */}
              <path d="M32.6 10.3h20.3c5.5 0 10 4.5 10 10v17.5L51.9 46 32.6 33.5V10.3z" fill="#fbbc04" />
              {/* Green Bottom */}
              <path d="M52.9 73.1H32.6V33.5L51.9 46v17.1c0 5.5-4.4 10-9.9 10" fill="#00ac47" />
              {/* Camera Lens Arrow */}
              <path d="M62.2 27.8l20.4-15.6c2.9-2.2 4.6.1 4.6 2.8v43.1c0 2.8-1.7 5.1-4.6 2.8L62.2 45.3V27.8z" fill="#00832d" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-normal text-slate-700 dark:text-slate-200 tracking-tight font-sans">
              Google <span className="font-semibold text-slate-900 dark:text-white">Meet</span>
            </span>
          </div>
        </Link>

        {/* Link to Coaching Admin Console */}
        <Link 
          href="/admin-panel" 
          className="ml-3 hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
          <span>Academy Admin Panel</span>
        </Link>
      </div>

      {/* Right Controls & Clock */}
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
        
        {/* Real-time Clock */}
        <span className="font-medium text-slate-600 dark:text-slate-400 text-xs sm:text-sm tracking-normal">
          {currentTime}
        </span>

        <div className="hidden sm:flex items-center gap-1">
          <button 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="Support & Feedback"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="Report an issue"
          >
            <MessageSquareWarning className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Google Apps & Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <button 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title="Google apps"
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-indigo-500/20">
            T
          </div>
        </div>

      </div>

    </header>
  );
}
