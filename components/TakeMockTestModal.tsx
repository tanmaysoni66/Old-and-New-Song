'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  Send,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { defaultQuestionsByTest, MCQQuestion } from '@/lib/mock-test-questions';

interface MockTestData {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  totalQuestions: number;
  passingMarks: number;
  durationMinutes: number;
}

interface TakeMockTestModalProps {
  test: MockTestData | null;
  isOpen: boolean;
  onClose: () => void;
  onResultSubmitted?: () => void;
}

export default function TakeMockTestModal({ test, isOpen, onClose, onResultSubmitted }: TakeMockTestModalProps) {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  // Fallback questions if test ID not in questions dataset
  const questions: MCQQuestion[] = (test && defaultQuestionsByTest[test.id]) || defaultQuestionsByTest['mock_jee_phy_01'];

  useEffect(() => {
    if (!started || testResult !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, testResult]);

  if (!isOpen || !test) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    setTimeLeft(test.durationMinutes * 60);
    setStarted(true);
  };

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optionIdx,
    }));
  };

  const finishTest = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      let calculatedScore = 0;
      const totalMarks = questions.length * 4; // 4 marks each

      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          calculatedScore += 4;
        }
      });

      const percentage = Math.round((calculatedScore / totalMarks) * 100);
      const passed = calculatedScore >= (test.passingMarks || 12);

      const resultPayload = {
        testId: test.id,
        testTopic: test.topic,
        studentName: studentName.trim() || 'Online Student',
        studentEmail: studentEmail.trim() || 'student@test.in',
        score: calculatedScore,
        totalMarks: totalMarks,
        percentage: percentage,
        passed: passed,
        submittedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'test_results'), resultPayload);

      setTestResult({
        score: calculatedScore,
        totalMarks,
        percentage,
        passed,
      });

      if (onResultSubmitted) onResultSubmitted();
    } catch (err) {
      console.error('Failed to submit test result:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'test_results');
      } catch (e: any) {
        alert('टेस्ट स्कोर सबमिट करने में त्रुटि आई।');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStarted(false);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setTestResult(null);
    setStudentName('');
    setStudentEmail('');
    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {test.subject} • {test.grade}
              </span>
              <span className="text-xs text-slate-500">
                {questions.length} Questions • {test.durationMinutes} Mins
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
              {test.topic}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {started && testResult === null && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
            )}
            <button
              onClick={resetAndClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          
          {!started ? (
            /* Student Registration before test */
            <form onSubmit={handleStart} className="max-w-md mx-auto py-6 space-y-4 text-center">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  ऑनलाइन टेस्ट शुरू करें (Begin Test)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  प्रत्येक सही उत्तर के 4 अंक हैं। पासिंग मार्क्स: {test.passingMarks} अंक।
                </p>
              </div>

              <div className="text-left space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    आपका नाम (Student Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ईमेल (Email Address)
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md transition-all"
                >
                  🚀 टेस्ट शुरू करें (Start Now)
                </button>
              </div>
            </form>
          ) : testResult !== null ? (
            /* Results & Score Card */
            <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg border-2 border-dashed"
                style={{
                  backgroundColor: testResult.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderColor: testResult.passed ? '#10b981' : '#ef4444',
                  color: testResult.passed ? '#10b981' : '#ef4444'
                }}
              >
                {testResult.passed ? <CheckCircle2 className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
              </div>

              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  testResult.passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {testResult.passed ? 'QUALIFIED (पास)' : 'NEEDS IMPROVEMENT (पुनः प्रयास करें)'}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {studentName} का टेस्ट रिजल्ट
                </h3>
              </div>

              {/* Score Matrix */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">कुल प्राप्तांक</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {testResult.score} / {testResult.totalMarks}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">प्रतिशत स्कोर</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {testResult.percentage}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">कट-ऑफ</span>
                  <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
                    {test.passingMarks}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-200 max-w-md mx-auto">
                आपका यह टेस्ट परिणाम सीधे एडमिन पैनल के <b>Mock Test Series</b> और <b>Console Analytics</b> लीडरबोर्ड में लाइव सिंक हो गया है!
              </div>

              <div>
                <button
                  onClick={resetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow transition-all"
                >
                  समाप्त करें व लीडरबोर्ड देखें (Close)
                </button>
              </div>
            </div>
          ) : (
            /* Active Test MCQ Questions */
            <div className="space-y-6">
              
              {/* Question Navigation Bubbles */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500">
                  प्रश्न {currentIdx + 1} / {questions.length}
                </span>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                        currentIdx === i
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : selectedAnswers[i] !== undefined
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold">
                    Q{currentIdx + 1}
                  </span>
                  <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-relaxed">
                    {questions[currentIdx].question}
                  </p>
                </div>
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-2.5">
                {questions[currentIdx].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === optIdx;
                  const labelLetter = String.fromCharCode(65 + optIdx);
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentIdx, optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {labelLetter}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Next / Previous / Submit Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  पिछला प्रश्न (Previous)
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow"
                  >
                    अगला प्रश्न (Next)
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={finishTest}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'सबमिट हो रहा है...' : 'टेस्ट फाइनल सबमिट करें (Finish)'}
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
