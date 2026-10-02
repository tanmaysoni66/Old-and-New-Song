'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  ShieldAlert, 
  Menu, 
  X, 
  Sparkles,
  Bot
} from 'lucide-react';

interface NavbarProps {
  onOpenAdmission?: () => void;
}

export default function Navbar({ onOpenAdmission }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Institute Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Apex Academy
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-700">
                  JEE • NEET • 9-12
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Premier Coaching & Study Systems
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link 
              href="/#batches" 
              className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              Batches
            </Link>
            <Link 
              href="/#notes" 
              className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Notes Store
            </Link>
            <Link 
              href="/#tests" 
              className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              Mock Tests
            </Link>
            <Link 
              href="/#videos" 
              className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <Video className="w-4 h-4 text-purple-500" />
              Lectures
            </Link>
            <Link 
              href="/#blogs" 
              className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/#contact" 
              className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Inquiry
            </Link>
            {/* AI Chat Link */}
            <Link 
              href="/ai-chat" 
              className="px-3 py-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800/80 shadow-xs"
            >
              <Bot className="w-4 h-4 text-purple-500 animate-pulse" />
              <span>AI Chat</span>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1 rounded font-normal">गुरु</span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenAdmission && (
              <button
                onClick={onOpenAdmission}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Admission
              </button>
            )}

            {/* Direct Admin Panel Link */}
            <Link
              href="/admin-panel"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Panel</span>
              <span className="hidden xl:inline text-indigo-200 text-xs">(8 मॉड्यूल्स)</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <Link 
              href="/ai-chat" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold col-span-2 flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              🤖 AI Chat (एआई गुरु - डाउट सॉल्वर)
            </Link>
            <Link 
              href="/#batches" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              📚 Batches
            </Link>
            <Link 
              href="/#notes" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              📖 Study Notes
            </Link>
            <Link 
              href="/#tests" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              📝 Mock Tests
            </Link>
            <Link 
              href="/#videos" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              🎥 Lectures
            </Link>
            <Link 
              href="/#blogs" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              📰 Blogs & Tips
            </Link>
            <Link 
              href="/#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              💬 Contact
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {onOpenAdmission && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmission();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-emerald-600 text-white"
              >
                ✨ Apply for Admission
              </button>
            )}
            <Link
              href="/admin-panel"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-indigo-600 text-white flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Open Admin Panel (एडमिन पैनल)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
