'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  User, 
  Smartphone,
  CheckCircle,
  Download
} from 'lucide-react';

interface NoteData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  price: number;
  isFreeSample: boolean;
  pagesCount: number;
  description: string;
  sampleText?: string;
  watermarkEnabled?: boolean;
}

interface NotesSampleModalProps {
  note: NoteData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotesSampleModal({ note, isOpen, onClose }: NotesSampleModalProps) {
  const [activePage, setActivePage] = useState<1 | 2>(1);
  const [watermarkName, setWatermarkName] = useState('Aarav Sharma');
  const [watermarkPhone, setWatermarkPhone] = useState('+91 98765 43210');
  const [watermarkActive, setWatermarkActive] = useState(true);

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {note.subject} • {note.grade}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Anti-Piracy Protected
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                {note.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Piracy Controller Bar */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 px-6 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">Anti-Piracy Watermark Simulator:</span>
            <span className="hidden sm:inline text-amber-700 dark:text-amber-300">
              प्रत्येक पेज पर छात्र का नाम और फोन नंबर एम्बेड होता है।
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[11px] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={watermarkActive}
                onChange={(e) => setWatermarkActive(e.target.checked)}
                className="rounded border-amber-400 text-indigo-600 focus:ring-indigo-500"
              />
              Watermark On
            </label>
            <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              <User className="w-3 h-3 text-slate-400" />
              <input
                type="text"
                value={watermarkName}
                onChange={(e) => setWatermarkName(e.target.value)}
                placeholder="Student Name"
                className="w-24 text-[11px] bg-transparent outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              <Smartphone className="w-3 h-3 text-slate-400" />
              <input
                type="text"
                value={watermarkPhone}
                onChange={(e) => setWatermarkPhone(e.target.value)}
                placeholder="Mobile"
                className="w-24 text-[11px] bg-transparent outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* 2-Page Sample Viewer */}
        <div className="relative flex-1 p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex flex-col items-center">
          
          {/* Simulated A4 PDF Document Sheet */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-300 dark:border-slate-700 rounded-lg p-8 sm:p-10 min-h-[460px] text-slate-800 dark:text-slate-200 font-serif leading-relaxed select-none overflow-hidden">
            
            {/* Top Sheet Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 flex items-center justify-between text-xs font-sans text-slate-400">
              <span>APEX ACADEMY • OFFICIAL STUDY COMPENDIUM</span>
              <span className="font-mono">PAGE {activePage} OF 2 (SAMPLE PREVIEW)</span>
            </div>

            {/* Diagonal Repeating Anti-Piracy Watermark Overlay */}
            {watermarkActive && (
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-around items-center opacity-25 dark:opacity-20 rotate-[-25deg] scale-110">
                <div className="text-sm font-sans font-black text-rose-600 dark:text-rose-400 tracking-wider text-center">
                  LICENSED TO: {watermarkName.toUpperCase()} | {watermarkPhone} | APX-SEC-{note.id.slice(0, 6)}
                </div>
                <div className="text-lg font-sans font-black text-slate-800 dark:text-slate-300 tracking-widest text-center">
                  DO NOT DISTRIBUTE • PIRACY IS STRICTLY TRACKED
                </div>
                <div className="text-sm font-sans font-black text-rose-600 dark:text-rose-400 tracking-wider text-center">
                  USER ID: {watermarkName.replace(/\s+/g, '').toLowerCase()}@uid • {watermarkPhone}
                </div>
              </div>
            )}

            {/* Document Content according to Page 1 or Page 2 */}
            {activePage === 1 ? (
              <div className="space-y-4 text-xs sm:text-sm font-sans">
                <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans">
                    {note.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Prepared by Apex Faculty Master Panel • {note.pagesCount} Pages Full Manual
                  </p>
                </div>

                <div className="space-y-3 font-mono text-[11px] sm:text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded border border-slate-200 dark:border-slate-700/80">
                  <p className="font-semibold text-indigo-700 dark:text-indigo-400">
                    § 1. CORE THEORETICAL FOUNDATION & SUMMARY MATRIX
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                    {note.sampleText || `1. Definition & Fundamental Theorem:
All standard formulas and high-impact shortcuts curated specifically for competitive exams.
2. Derivations & Direct Question Linkages:
Formulas are tagged with previous 10-year question frequency in JEE Main, Advanced, and NEET.`}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold mb-1">Key Memory Anchor:</p>
                  <p>Remember that dimensional consistency and boundary conditions eliminate 50% of incorrect options in multi-choice questions.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs sm:text-sm font-sans">
                <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    PAGE 2: WORKED EXAMPLE & QUESTION SOLVING STRATEGY
                  </h4>
                  <p className="text-xs text-slate-500">
                    Standard Exam Problem with Step-by-Step Short Calculation
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Problem 2.4 (High Yield Model Question):
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    Calculate the effective value under given boundary conditions when parameters alpha and beta vary synchronously with temperature T.
                  </p>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded text-indigo-900 dark:text-indigo-200 text-xs font-mono">
                    Solution Step: Apply Conservation Law directly -&gt; Lambda_effective = sqrt(2 * m * E_kinetic). Result matches Option B.
                  </div>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center space-y-2 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    यह सिर्फ 2-पेज का फ्री सैंपल प्रिव्यू है। पूर्ण {note.pagesCount} पेजों की हस्तलिखित डिजिटल गाइड अनलॉक करें।
                  </p>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Full Notes Price: ₹{note.price} (Lifetime Digital Access)
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Page Footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-sans">
              <span>Apex Academy Notes Portal © 2026</span>
              <span>Watermark ID: APX-{note.id.toUpperCase()}</span>
            </div>
          </div>

          {/* Page Switcher Buttons */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setActivePage(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                activePage === 1
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              पेज 1 (Page 1)
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              टॉगल करें: 2-Page Sample
            </span>
            <button
              onClick={() => setActivePage(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                activePage === 2
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              पेज 2 (Page 2)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            कुल पेज: <span className="font-semibold text-slate-900 dark:text-white">{note.pagesCount} Pages</span> | डाउनलोड्स: <span className="font-semibold text-slate-900 dark:text-white">{note.downloadCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              बंद करें (Close)
            </button>
            <button
              onClick={() => {
                alert(`नोट्स ऑर्डर ₹${note.price} का डेमो कार्ट में जुड़ गया है! (Anti-piracy watermark will be branded with your details).`);
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              खरीदें (Buy ₹{note.price})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
