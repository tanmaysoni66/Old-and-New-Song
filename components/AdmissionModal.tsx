'use client';

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdmissionModal({ isOpen, onClose, onSuccess }: AdmissionModalProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    grade: 'Class 12 (JEE)',
    previousScore: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.parentName || !formData.phone) {
      setErrorMsg('कृपया सभी अनिवार्य फ़ील्ड्स भरें (नाम, अभिभावक का नाम, फोन)।');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const admissionPayload = {
        studentName: formData.studentName.trim(),
        parentName: formData.parentName.trim(),
        grade: formData.grade,
        previousScore: formData.previousScore ? `${formData.previousScore.trim()}%` : 'N/A',
        phone: formData.phone.trim(),
        email: formData.email.trim() || 'student@admission.in',
        status: 'pending',
        appliedAt: new Date().toISOString(),
        notes: formData.notes.trim() || 'Online Admission Form Submission',
      };

      await addDoc(collection(db, 'admissions'), admissionPayload);
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to submit admission:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'admissions');
      } catch (e: any) {
        setErrorMsg('एडमिशन फॉर्म सबमिट करने में समस्या आई। कृपया पुनः प्रयास करें।');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setFormData({
      studentName: '',
      parentName: '',
      grade: 'Class 12 (JEE)',
      previousScore: '',
      phone: '',
      email: '',
      notes: '',
    });
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              आवेदन सफलतापूर्वक प्राप्त हुआ!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              धन्यवाद <span className="font-semibold text-slate-900 dark:text-white">{formData.studentName}</span>, आपका एडमिशन फॉर्म एडमिन पैनल में दर्ज हो गया है। हमारी काउंसलिंग टीम 24 घंटे में संपर्क करेगी।
            </p>
            <div className="pt-4">
              <button
                onClick={resetAndClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  ऑनलाइन एडमिशन फॉर्म (2026-27)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  सीट आरक्षण व स्कॉलरशिप टेस्ट काउंसलिंग के लिए फॉर्म भरें
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    छात्र का नाम (Student Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    अभिभावक का नाम (Parent Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    क्लास / टारगेट एग्जाम (Grade / Target)
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Class 12 (JEE Main + Adv)">Class 12 (JEE Main + Adv)</option>
                    <option value="Class 11 (JEE Main + Adv)">Class 11 (JEE Main + Adv)</option>
                    <option value="Class 12 (NEET Medical)">Class 12 (NEET Medical)</option>
                    <option value="Class 11 (NEET Medical)">Class 11 (NEET Medical)</option>
                    <option value="Class 10 (Board & NTSE)">Class 10 (Board & NTSE)</option>
                    <option value="Class 9 (Foundation Olympiad)">Class 9 (Foundation Olympiad)</option>
                    <option value="Dropper / Repeater Batch">Dropper / Repeater Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    पिछली परीक्षा के अंक (% Marks)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 92.4%"
                    value={formData.previousScore}
                    onChange={(e) => setFormData({ ...formData, previousScore: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    फोन नंबर (Mobile Number) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ईमेल (Email Address)
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  कोई विशेष प्रश्न / विवरण (Special Requests / Notes)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hostel facility required, Morning batch preference..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      सबमिट किया जा रहा है...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      आवेदन सबमिट करें (Submit Application)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
