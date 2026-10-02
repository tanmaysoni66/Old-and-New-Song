'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  BookOpen, 
  Video, 
  FileText, 
  Newspaper, 
  MessageSquare, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  GraduationCap, 
  IndianRupee, 
  Award, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowLeft,
  Lock,
  Smartphone,
  User,
  Bot
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { checkAndSeedInitialData } from '@/lib/seed-data';
import NotesSampleModal from '@/components/NotesSampleModal';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import TakeMockTestModal from '@/components/TakeMockTestModal';

type ActiveTab = 
  | 'analytics' 
  | 'admissions' 
  | 'batches' 
  | 'notes' 
  | 'videos' 
  | 'tests' 
  | 'blogs' 
  | 'inquiries';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Live Data State from Firestore
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Modals state
  const [selectedNoteForPreview, setSelectedNoteForPreview] = useState<any | null>(null);
  const [selectedVideoForPlayer, setSelectedVideoForPlayer] = useState<any | null>(null);
  const [selectedTestForSimulation, setSelectedTestForSimulation] = useState<any | null>(null);

  // Create Form Modals
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [showAddAdmissionModal, setShowAddAdmissionModal] = useState(false);

  // Filter states
  const [admissionFilter, setAdmissionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'pending' | 'contacted' | 'resolved'>('all');

  // Anti-piracy simulator live controls
  const [watermarkName, setWatermarkName] = useState('Aarav Sharma');
  const [watermarkPhone, setWatermarkPhone] = useState('+91 98765 43210');
  const [antiPiracyGlobalEnabled, setAntiPiracyGlobalEnabled] = useState(true);

  // Initialize and attach Firestore real-time listeners
  useEffect(() => {
    // 1. Initial Seeding if empty
    checkAndSeedInitialData();

    // 2. Admissions Listener
    const unsubAdmissions = onSnapshot(collection(db, 'admissions'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAdmissions(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'admissions'));

    // 3. Batches Listener
    const unsubBatches = onSnapshot(collection(db, 'batches'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBatches(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'batches'));

    // 4. Notes Listener
    const unsubNotes = onSnapshot(collection(db, 'notes'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotes(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'notes'));

    // 5. Videos Listener
    const unsubVideos = onSnapshot(collection(db, 'videos'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setVideos(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'videos'));

    // 6. Mock Tests Listener
    const unsubTests = onSnapshot(collection(db, 'mock_tests'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMockTests(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'mock_tests'));

    // 7. Test Results Listener
    const unsubResults = onSnapshot(collection(db, 'test_results'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTestResults(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'test_results'));

    // 8. Blogs Listener
    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBlogs(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'blogs'));

    // 9. Inquiries Listener
    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setInquiries(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'inquiries'));

    return () => {
      unsubAdmissions();
      unsubBatches();
      unsubNotes();
      unsubVideos();
      unsubTests();
      unsubResults();
      unsubBlogs();
      unsubInquiries();
    };
  }, []);

  // Live Console Analytics Calculations
  const totalEnrolledStudents = batches.reduce((acc, b) => acc + (Number(b.enrolledCount) || 0), 0);
  const totalNotesSoldOrders = notes.reduce((acc, n) => acc + (Number(n.downloadCount) || 0), 0);
  
  // Total Revenue: sum of enrolled student fees + notes sold revenue
  const batchRevenue = batches.reduce((acc, b) => acc + ((Number(b.enrolledCount) || 0) * (Number(b.fees) || 0)), 0);
  const notesRevenue = notes.reduce((acc, n) => acc + ((Number(n.downloadCount) || 0) * (Number(n.price) || 0)), 0);
  const totalRevenueINR = batchRevenue + notesRevenue;

  // Average Test Score Percentage
  const avgTestPercentage = testResults.length > 0
    ? Math.round(testResults.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0) / testResults.length)
    : 84;

  // Handlers for Admissions Approve/Reject
  const handleUpdateAdmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'admissions', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `admissions/${id}`);
    }
  };

  const handleDeleteDoc = async (collName: string, id: string) => {
    if (!confirm('क्या आप निश्चित रूप से इसे डिलीट करना चाहते हैं? (Confirm Delete)')) return;
    try {
      await deleteDoc(doc(db, collName, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collName}/${id}`);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: 'pending' | 'contacted' | 'resolved') => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  // Re-seed demo data helper
  const handleManualReSeed = async () => {
    setSyncing(true);
    await checkAndSeedInitialData();
    setTimeout(() => setSyncing(false), 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Student Home Portal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">मुख्य पोर्टल (Home)</span>
            </Link>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Apex Academy Admin Panel
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Master Console
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden md:block">
                  8 प्रमुख मॉड्यूल्स • लाइव फायरबेस रियल-टाइम डेटाबेस सिंक
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Realtime Live Pulse Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Firestore Realtime</span>
            </div>

            {/* Direct AI Chat Link */}
            <Link
              href="/ai-chat"
              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-indigo-500/30 transition-all shadow-xs"
              title="Open AI Academic Mentor & Doubt Solver"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">AI Guru</span>
            </Link>

            {/* Quick Demo Re-seed Button */}
            <button
              onClick={handleManualReSeed}
              disabled={syncing}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Reset & Verify Pre-seeded Academy Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">सिंक डेमो डेटा</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar Navigation (The 8 Modules / Tabs) */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3 space-y-1 sticky top-20 backdrop-blur-md">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              मुख्य मॉड्यूल्स (8 TABS)
            </div>

            {/* Tab 1: Console Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-300" />
                Console Analytics
              </span>
              <span className="text-[10px] opacity-75">डैशबोर्ड</span>
            </button>

            {/* Tab 2: Admissions Applications */}
            <button
              onClick={() => setActiveTab('admissions')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                activeTab === 'admissions'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Admissions Applications
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
                {admissions.length}
              </span>
            </button>

            {/* Tab 3: Coaching Batches */}
            <button
              onClick={() => setActiveTab('batches')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                activeTab === 'batches'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-blue-400" />
                Coaching Batches
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
                {batches.length}
              </span>
            </button>

            {/* Tab 4: Study Notes Store */}
            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Study Notes Store
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {notes.length}
              </span>
            </button>

            {/* Tab 5: Video Lectures */}
            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                activeTab === 'videos'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-purple-400" />
                Video Lectures
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
                {videos.length}
              </span>
            </button>

            {/* Tab 6: Mock Test Series */}
            <button
              onClick={() => setActiveTab('tests')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                activeTab === 'tests'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-rose-400" />
                Mock Test Series
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
                {mockTests.length}
              </span>
            </button>

            {/* Tab 7: Blogs & News */}
            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                activeTab === 'blogs'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4 text-teal-400" />
                Blogs & News
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
                {blogs.length}
              </span>
            </button>

            {/* Tab 8: Contact Inquiries */}
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                Contact Inquiries
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-sky-500/20 text-sky-300 font-mono">
                {inquiries.length}
              </span>
            </button>

            {/* Anti-Piracy Security Status Widget */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 px-2 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Anti-Piracy Shield
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                PDF नोट्स पर छात्र नाम व मोबाइल वाटरमार्किंग सक्रिय है।
              </p>
            </div>

          </div>
        </aside>

        {/* Right Active Tab Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* ==============================================================
              TAB 1: CONSOLE ANALYTICS (डैशबोर्ड एनालिटिक्स)
          ============================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Console Analytics (डैशबोर्ड एनालिटिक्स)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  कोचिंग संस्थान के सभी प्रमुख पैरामीटर्स का रियल-टाइम वित्तीय व शैक्षणिक विश्लेषण
                </p>
              </div>

              {/* 4 Primary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Enrolled Students */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total Enrolled
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {totalEnrolledStudents}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5 font-medium">छात्र</span>
                  </div>
                  <p className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    कुल नामांकित छात्रों की संख्या
                  </p>
                </div>

                {/* 2. Study Notes Sold */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Notes Sold Orders
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {totalNotesSoldOrders.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5 font-medium">ऑर्डर्स</span>
                  </div>
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    कुल बेचे गए नोट्स के ऑर्डर्स
                  </p>
                </div>

                {/* 3. Total Revenue (INR) */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total Revenue (INR)
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      ₹{totalRevenueINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    कुल कमाई (₹ में लाइव कैलकुलेशन)
                  </p>
                </div>

                {/* 4. Avg Test Percentage */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Avg Test Score
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {avgTestPercentage}%
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-400 mt-1 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    छात्रों का औसत टेस्ट स्कोर
                  </p>
                </div>

              </div>

              {/* Quick Actions Bar */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-200">
                    त्वरित शॉर्टकट (Quick Action Shortcuts):
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAddBatchModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    नया बैच बनाएं
                  </button>
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    स्टडी नोट्स जोड़ें
                  </button>
                  <button
                    onClick={() => setShowAddTestModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    मॉक टेस्ट बनाएं
                  </button>
                  <button
                    onClick={() => setShowAddAdmissionModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    एडमिशन जोड़ें
                  </button>
                </div>
              </div>

              {/* Two Column Grid: Batches Live Status & Recent Admissions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Batches Capacity & Enrollment Progress */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      बैच क्षमता व एनरोलमेंट स्थिति (Batch Status)
                    </h3>
                    <button
                      onClick={() => setActiveTab('batches')}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      सभी देखें &gt;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {batches.slice(0, 4).map((b) => {
                      const pct = Math.min(100, Math.round(((Number(b.enrolledCount) || 0) / (Number(b.capacity) || 50)) * 100));
                      return (
                        <div key={b.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200 line-clamp-1">{b.batchName}</span>
                            <span className="text-indigo-400 font-mono font-bold">{b.enrolledCount} / {b.capacity}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>फीस: ₹{Number(b.fees).toLocaleString('en-IN')}</span>
                            <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                              {b.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Admissions Stream */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      नवीनतम एडमिशन फॉर्म्स (Recent Admissions)
                    </h3>
                    <button
                      onClick={() => setActiveTab('admissions')}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      प्रबंधन करें &gt;
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {admissions.slice(0, 4).map((adm) => (
                      <div key={adm.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{adm.studentName}</span>
                            <span className="text-[10px] text-slate-400">({adm.grade})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            अभिभावक: {adm.parentName} • फोन: {adm.phone}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {adm.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              लंबित (Pending)
                            </span>
                          ) : adm.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              स्वीकृत (Approved)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              अस्वीकृत (Rejected)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==============================================================
              TAB 2: ADMISSIONS APPLICATIONS (एडमिशन मैनेजमेंट)
          ============================================================== */}
          {activeTab === 'admissions' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Admissions Applications (एडमिशन मैनेजमेंट)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    छात्रों व अभिभावकों द्वारा सबमिट किए गए एडमिशन फॉर्म्स की लाइव सूची
                  </p>
                </div>

                <button
                  onClick={() => setShowAddAdmissionModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  नया ऑफलाइन एडमिशन दर्ज करें
                </button>
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setAdmissionFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      admissionFilter === st
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {st === 'all' ? 'सभी (All)' : st === 'pending' ? 'लंबित (Pending)' : st === 'approved' ? 'स्वीकृत (Approved)' : 'अस्वीकृत (Rejected)'}
                  </button>
                ))}
              </div>

              {/* Admissions Table / Card List */}
              <div className="space-y-3">
                {admissions
                  .filter(a => admissionFilter === 'all' || a.status === admissionFilter)
                  .map((adm) => (
                    <div
                      key={adm.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {adm.studentName}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {adm.grade}
                          </span>
                          <span className="text-xs text-emerald-400 font-medium">
                            पिछला स्कोर: {adm.previousScore || 'N/A'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-400">
                          <div>
                            <span className="text-slate-500">अभिभावक:</span> <span className="text-slate-300">{adm.parentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">फोन:</span> <span className="text-slate-300 font-mono">{adm.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">ईमेल:</span> <span className="text-slate-300">{adm.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">आवेदन दिनांक:</span> <span className="text-slate-300">{new Date(adm.appliedAt || Date.now()).toLocaleDateString('hi-IN')}</span>
                          </div>
                        </div>

                        {adm.notes && (
                          <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mt-1">
                            &quot;{adm.notes}&quot;
                          </p>
                        )}
                      </div>

                      {/* Status and Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                        {adm.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateAdmissionStatus(adm.id, 'approved')}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              स्वीकारें (Approve)
                            </button>
                            <button
                              onClick={() => handleUpdateAdmissionStatus(adm.id, 'rejected')}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              अस्वीकार (Reject)
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                              adm.status === 'approved'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                            }`}>
                              {adm.status === 'approved' ? '✓ स्वीकृत' : '✕ अस्वीकृत'}
                            </span>
                            <button
                              onClick={() => handleUpdateAdmissionStatus(adm.id, adm.status === 'approved' ? 'rejected' : 'approved')}
                              className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                            >
                              बदलें
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleDeleteDoc('admissions', adm.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}

                {admissions.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    कोई एडमिशन फॉर्म उपलब्ध नहीं है।
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==============================================================
              TAB 3: COACHING BATCHES (बैच / कोर्स मैनेजमेंट)
          ============================================================== */}
          {activeTab === 'batches' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Coaching Batches (बैच / कोर्स मैनेजमेंट)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    नए कोचिंग बैच बनाना, फीस, समय व एक्टिव बैचेस का प्रबंधन
                  </p>
                </div>

                <button
                  onClick={() => setShowAddBatchModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  नया कोचिंग बैच बनाएं (New Batch)
                </button>
              </div>

              {/* Batches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.map((batch) => {
                  const pct = Math.min(100, Math.round(((Number(batch.enrolledCount) || 0) / (Number(batch.capacity) || 50)) * 100));
                  return (
                    <div
                      key={batch.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {batch.grade}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            batch.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {batch.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white line-clamp-2">
                          {batch.batchName}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-1">
                          सब्जेक्ट: <span className="text-slate-200 font-medium">{batch.subject}</span>
                        </p>

                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              समय (IST):
                            </span>
                            <span className="text-slate-200 font-medium">{batch.batchTiming}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                              कोर्स फीस:
                            </span>
                            <span className="text-emerald-400 font-bold font-mono">
                              ₹{Number(batch.fees).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {batch.syllabus && (
                          <div className="text-[11px] text-slate-400 line-clamp-2">
                            <span className="font-semibold text-slate-300">सिलेबस टॉपिक्स:</span> {batch.syllabus}
                          </div>
                        )}
                      </div>

                      {/* Capacity Bar & Action Buttons */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">नामांकित छात्र (Enrolled):</span>
                          <span className="font-mono font-bold text-white">
                            {batch.enrolledCount} / {batch.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'batches', batch.id), {
                                  enrolledCount: (Number(batch.enrolledCount) || 0) + 1
                                });
                              } catch (e) {
                                handleFirestoreError(e, OperationType.UPDATE, `batches/${batch.id}`);
                              }
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            + 1 छात्र जोड़ें (+Enroll)
                          </button>

                          <button
                            onClick={() => handleDeleteDoc('batches', batch.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ==============================================================
              TAB 4: STUDY NOTES STORE (PDF नोट्स कैटलॉग)
          ============================================================== */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Study Notes Store (PDF नोट्स कैटलॉग)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    डिजिटल नोट्स, 2-पेज फ्री सैंपल प्रिव्यू और एंटी-पायरेसी वाटरमार्किंग
                  </p>
                </div>

                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  नए नोट्स अपलोड/ऐड करें (Upload Note)
                </button>
              </div>

              {/* Anti-Piracy Feature Control Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      Anti-Piracy Security Protection Engine
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    ऑटोमैटिक डायनामिक वाटरमार्क सक्रिय
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  इस फीचर से छात्र का <b>नाम</b> और <b>मोबाइल नंबर</b> हर PDF पेज के पीछे विकर्ण (diagonal) रूप से वाटरमार्क होता है। यदि कोई छात्र नोट्स को अनधिकृत रूप से शेयर करता है, तो उसकी तुरंत पहचान हो जाती है।
                </p>

                {/* Live Watermark Testing Playground */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-slate-400 font-medium">वाटरमार्क टेस्ट डेटा:</span>
                  <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={watermarkName}
                      onChange={(e) => setWatermarkName(e.target.value)}
                      placeholder="Student Name"
                      className="bg-transparent text-white outline-none w-28 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={watermarkPhone}
                      onChange={(e) => setWatermarkPhone(e.target.value)}
                      placeholder="Mobile"
                      className="bg-transparent text-white outline-none w-28 text-xs font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-amber-400">
                    (नीचे किसी भी नोट पर &apos;2-पेज सैंपल प्रिव्यू&apos; क्लिक करके चेक करें)
                  </span>
                </div>
              </div>

              {/* Notes Catalog List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {note.subject} • {note.grade}
                        </span>
                        <span className="text-xs text-emerald-400 font-mono font-bold">
                          ₹{note.price}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-2">
                        {note.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {note.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                        <span>कुल पृष्ठ: <b className="text-slate-200">{note.pagesCount}</b></span>
                        <span>•</span>
                        <span>डाउनलोड्स: <b className="text-slate-200">{note.downloadCount}</b></span>
                        <span>•</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Watermark ON
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      {/* 2-Page Sample Preview Trigger */}
                      <button
                        onClick={() => setSelectedNoteForPreview(note)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        2-पेज सैंपल प्रिव्यू (View Sample)
                      </button>

                      <button
                        onClick={() => handleDeleteDoc('notes', note.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==============================================================
              TAB 5: VIDEO LECTURES (वीडियो लेक्चर्स व रिकॉर्डिंग्स)
          ============================================================== */}
          {activeTab === 'videos' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Video Lectures (वीडियो लेक्चर्स व रिकॉर्डिंग्स)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    नए वीडियो लेक्चर्स जोड़ना, यूट्यूब/Vimeo लिंक व अटैच्ड PDF स्टडी मटेरियल
                  </p>
                </div>

                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  नया वीडियो लेक्चर जोड़ें
                </button>
              </div>

              {/* Video Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {vid.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          अवधि: {vid.duration}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-2">
                        {vid.title}
                      </h3>

                      <p className="text-xs text-slate-400">
                        असाइन्ड बैच: <span className="text-slate-200 font-medium">{vid.batchName}</span>
                      </p>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {vid.description}
                      </p>

                      {vid.pdfMaterialUrl && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          अटैच्ड PDF स्टडी मटेरियल लिंक उपलब्ध
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedVideoForPlayer(vid)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        प्ले लेक्चर (Watch Preview)
                      </button>

                      <button
                        onClick={() => handleDeleteDoc('videos', vid.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==============================================================
              TAB 6: MOCK TEST SERIES (ऑनलाइन टेस्ट मैनेजमेंट)
          ============================================================== */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Mock Test Series (ऑनलाइन टेस्ट मैनेजमेंट)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    नए टेस्ट व क्विज़ तैयार करना, MCQ प्रश्न जोड़ना और छात्रों का लाइव लीडरबोर्ड
                  </p>
                </div>

                <button
                  onClick={() => setShowAddTestModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  नया मॉक टेस्ट बनाएं
                </button>
              </div>

              {/* Active Mock Tests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTests.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {t.subject} • {t.grade}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {t.durationMinutes} मिनट
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {t.topic}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        कुल प्रश्न: <b className="text-white">{t.totalQuestions} MCQs</b>
                      </div>
                      <div>
                        पासिंग मार्क्स: <b className="text-emerald-400">{t.passingMarks}</b>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setSelectedTestForSimulation(t)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        टेस्ट सिमुलेटर (Test Simulator)
                      </button>

                      <button
                        onClick={() => handleDeleteDoc('mock_tests', t.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Delete Test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Live Student Test Results & Leaderboard */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      छात्रों के रिजल्ट्स और लाइव लीडरबोर्ड (Student Leaderboard)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ऑनलाइन मॉक टेस्ट सबमिट करने वाले छात्रों के वास्तविक प्राप्तांक व स्टेटस
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    कुल सबमिशन: {testResults.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2 font-semibold">छात्र का नाम (Student)</th>
                        <th className="pb-2 font-semibold">टेस्ट टॉपिक (Test)</th>
                        <th className="pb-2 font-semibold">प्राप्तांक (Score)</th>
                        <th className="pb-2 font-semibold">प्रतिशत (%)</th>
                        <th className="pb-2 font-semibold">परिणाम (Status)</th>
                        <th className="pb-2 font-semibold">दिनांक (Date)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {testResults.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 font-bold text-white">
                            {res.studentName}
                          </td>
                          <td className="py-2.5 text-slate-300 max-w-xs truncate">
                            {res.testTopic}
                          </td>
                          <td className="py-2.5 font-mono text-indigo-400 font-bold">
                            {res.score} / {res.totalMarks}
                          </td>
                          <td className="py-2.5 font-mono font-bold text-emerald-400">
                            {res.percentage}%
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              res.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            }`}>
                              {res.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500">
                            {new Date(res.submittedAt || Date.now()).toLocaleDateString('hi-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==============================================================
              TAB 7: BLOGS & NEWS (शिक्षा ब्लॉग्स व अपडेट्स)
          ============================================================== */}
          {activeTab === 'blogs' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Blogs & News (शिक्षा ब्लॉग्स व अपडेट्स)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    नए आर्टिकल्स पब्लिश करना, परीक्षा रणनीतियाँ व टॉपर टिप्स
                  </p>
                </div>

                <button
                  onClick={() => setShowAddBlogModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  नया ब्लॉग आर्टिकल पब्लिश करें
                </button>
              </div>

              {/* Blogs List */}
              <div className="space-y-4">
                {blogs.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {b.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {b.readTime} • {new Date(b.createdAt || Date.now()).toLocaleDateString('hi-IN')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {b.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {b.excerpt}
                    </p>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 whitespace-pre-line max-h-32 overflow-y-auto">
                      {b.content}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>लेखक (Author): <b className="text-slate-200">{b.author}</b></span>

                      <button
                        onClick={() => handleDeleteDoc('blogs', b.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==============================================================
              TAB 8: CONTACT INQUIRIES (पूछताछ व संदेश)
          ============================================================== */}
          {activeTab === 'inquiries' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Contact Inquiries (पूछताछ व संदेश)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    छात्रों व अभिभावकों के संदेश, ईमेल व संपर्क विवरण का स्टेटस ट्रैकिंग
                  </p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-1.5">
                  {(['all', 'pending', 'contacted', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setInquiryFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
                        inquiryFilter === st ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inquiries Stream */}
              <div className="space-y-3">
                {inquiries
                  .filter(inq => inquiryFilter === 'all' || inq.status === inquiryFilter)
                  .map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">
                            {inq.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">
                            {inq.phone}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {inq.email}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-indigo-300">
                          विषय: {inq.subject}
                        </p>

                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                          {inq.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as any)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                            inq.status === 'resolved'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : inq.status === 'contacted'
                              ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                              : 'bg-amber-950 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          <option value="pending">लंबित (Pending)</option>
                          <option value="contacted">संपर्क किया (Contacted)</option>
                          <option value="resolved">समाधान (Resolved)</option>
                        </select>

                        <button
                          onClick={() => handleDeleteDoc('inquiries', inq.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}

                {inquiries.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    कोई पूछताछ संदेश उपलब्ध नहीं है।
                  </div>
                )}
              </div>

            </div>
          )}

        </main>

      </div>

      {/* ==============================================================
          CREATION MODALS (FOR ADDING NEW ITEMS ACROSS THE 8 MODULES)
      ============================================================== */}

      {/* 1. Modal: Add New Coaching Batch */}
      {showAddBatchModal && (
        <CreateBatchModal 
          onClose={() => setShowAddBatchModal(false)} 
        />
      )}

      {/* 2. Modal: Add Study Note */}
      {showAddNoteModal && (
        <CreateNoteModal 
          onClose={() => setShowAddNoteModal(false)} 
        />
      )}

      {/* 3. Modal: Add Video Lecture */}
      {showAddVideoModal && (
        <CreateVideoModal 
          batches={batches}
          onClose={() => setShowAddVideoModal(false)} 
        />
      )}

      {/* 4. Modal: Add Mock Test */}
      {showAddTestModal && (
        <CreateTestModal 
          onClose={() => setShowAddTestModal(false)} 
        />
      )}

      {/* 5. Modal: Add Blog Article */}
      {showAddBlogModal && (
        <CreateBlogModal 
          onClose={() => setShowAddBlogModal(false)} 
        />
      )}

      {/* 6. Modal: Add Manual Offline Admission */}
      {showAddAdmissionModal && (
        <CreateAdmissionModal 
          onClose={() => setShowAddAdmissionModal(false)} 
        />
      )}

      {/* Interactive 2-Page Sample Viewer Modal with Anti-Piracy Watermark */}
      <NotesSampleModal
        note={selectedNoteForPreview}
        isOpen={selectedNoteForPreview !== null}
        onClose={() => setSelectedNoteForPreview(null)}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideoForPlayer}
        isOpen={selectedVideoForPlayer !== null}
        onClose={() => setSelectedVideoForPlayer(null)}
      />

      {/* Student Test Simulator Modal */}
      <TakeMockTestModal
        test={selectedTestForSimulation}
        isOpen={selectedTestForSimulation !== null}
        onClose={() => setSelectedTestForSimulation(null)}
      />

    </div>
  );
}

/* ==============================================================
   SUB-MODALS FOR ADMIN CREATION
============================================================== */

function CreateBatchModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    batchName: '',
    fees: 35000,
    subject: 'Physics, Chemistry, Maths',
    grade: 'Class 12 / JEE',
    batchTiming: '05:00 PM - 08:00 PM IST',
    syllabus: 'Electrostatics, Magnetism, Calculus, Chemical Kinetics',
    capacity: 45,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchName) return;
    try {
      setSaving(true);
      await addDoc(collection(db, 'batches'), {
        ...form,
        fees: Number(form.fees),
        capacity: Number(form.capacity),
        enrolledCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'batches');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 text-white">
        <h3 className="text-lg font-bold">नया कोचिंग बैच बनाएं (Create Coaching Batch)</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">बैच का नाम (Batch Name) *</label>
            <input
              type="text"
              required
              placeholder="e.g. JEE Target 2027 Rankers"
              value={form.batchName}
              onChange={(e) => setForm({ ...form, batchName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">क्लास/ग्रेड (Target Grade)</label>
              <input
                type="text"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">कोर्स फीस (Fees INR) *</label>
              <input
                type="number"
                required
                value={form.fees}
                onChange={(e) => setForm({ ...form, fees: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">सब्जेक्ट (Subjects)</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">बैच टाइमिंग (Timing IST)</label>
              <input
                type="text"
                value={form.batchTiming}
                onChange={(e) => setForm({ ...form, batchTiming: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">सिलेबस विवरण (Syllabus Highlights)</label>
            <textarea
              rows={2}
              value={form.syllabus}
              onChange={(e) => setForm({ ...form, syllabus: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {saving ? 'सेव हो रहा है...' : 'बैच पब्लिश करें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateNoteModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    title: '',
    subject: 'Physics',
    grade: 'Class 12 / JEE',
    price: 349,
    isFreeSample: true,
    pagesCount: 88,
    description: 'पूर्ण हस्तलिखित नोट्स, फॉर्मूला शीट्स व पिछले 10 वर्षों के हल प्रश्न।',
    sampleText: '1. Standard formulas & rapid derivation tips\n2. Worked examples with shortcuts\n3. Anti-Piracy Watermark applied automatically.',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    try {
      setSaving(true);
      await addDoc(collection(db, 'notes'), {
        ...form,
        price: Number(form.price),
        pagesCount: Number(form.pagesCount),
        downloadCount: 0,
        watermarkEnabled: true,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 text-white">
        <h3 className="text-lg font-bold">नए डिजिटल नोट्स जोड़ें (Add Study Note)</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">नोट्स का शीर्षक (Title) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Physics Master Formulas Sheet"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">सब्जेक्ट (Subject)</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">मूल्य (Price INR)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">कुल पृष्ठ (Pages Count)</label>
              <input
                type="number"
                value={form.pagesCount}
                onChange={(e) => setForm({ ...form, pagesCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isFreeSample"
                checked={form.isFreeSample}
                onChange={(e) => setForm({ ...form, isFreeSample: e.target.checked })}
                className="rounded text-amber-500"
              />
              <label htmlFor="isFreeSample" className="text-slate-300 cursor-pointer">
                2-Page Free Sample Enable
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">विवरण (Description)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/20 text-[11px] text-amber-300">
            ✓ Anti-Piracy Watermarking: छात्र का नाम और फोन नंबर स्वतः हर पेज पर वाटरमार्क होगा।
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              {saving ? 'अपलोड हो रहा है...' : 'नोट्स कैटलॉग में जोड़ें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateVideoModal({ batches, onClose }: { batches: any[]; onClose: () => void }) {
  const [form, setForm] = useState({
    title: '',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube' as 'youtube' | 'vimeo' | 'mp4',
    subject: 'Physics',
    batchName: batches[0]?.batchName || 'General Coaching Batch',
    batchId: batches[0]?.id || 'b1',
    duration: '55 mins',
    pdfMaterialUrl: 'https://example.com/material.pdf',
    description: 'विस्तृत कॉन्सेप्ट एक्सप्लेनेशन, शॉर्ट ट्रिक्स व पिछले सालों के प्रश्न।',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    try {
      setSaving(true);
      await addDoc(collection(db, 'videos'), {
        ...form,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'videos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 text-white">
        <h3 className="text-lg font-bold">नया वीडियो लेक्चर जोड़ें (Add Video Lecture)</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">लेक्चर शीर्षक (Lecture Title) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Electromagnetic Induction Complete One-Shot"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">वीडियो URL (YouTube / Vimeo / MP4 Link) *</label>
            <input
              type="text"
              required
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">सब्जेक्ट (Subject)</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">अवधि (Duration)</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">असाइन किया गया बैच (Assigned Batch)</label>
            <select
              value={form.batchName}
              onChange={(e) => {
                const b = batches.find(x => x.batchName === e.target.value);
                setForm({ ...form, batchName: e.target.value, batchId: b?.id || 'b1' });
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500"
            >
              {batches.map(b => (
                <option key={b.id} value={b.batchName}>{b.batchName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">अटैच्ड PDF स्टडी मटेरियल URL</label>
            <input
              type="text"
              placeholder="https://example.com/class-sheet.pdf"
              value={form.pdfMaterialUrl}
              onChange={(e) => setForm({ ...form, pdfMaterialUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {saving ? 'सेव हो रहा है...' : 'लेक्चर पब्लिश करें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateTestModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    topic: '',
    subject: 'Physics',
    grade: 'Class 12 / JEE',
    totalQuestions: 5,
    passingMarks: 12,
    durationMinutes: 15,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic) return;
    try {
      setSaving(true);
      await addDoc(collection(db, 'mock_tests'), {
        ...form,
        totalQuestions: Number(form.totalQuestions),
        passingMarks: Number(form.passingMarks),
        durationMinutes: Number(form.durationMinutes),
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'mock_tests');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 text-white">
        <h3 className="text-lg font-bold">नया मॉक टेस्ट बनाएं (Create Mock Test)</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">टेस्ट का विषय/टॉपिक (Test Topic) *</label>
            <input
              type="text"
              required
              placeholder="e.g. JEE Full Length Physics Unit Test"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">सब्जेक्ट (Subject)</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">टारगेट ग्रेड (Target)</label>
              <input
                type="text"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">कुल प्रश्न</label>
              <input
                type="number"
                value={form.totalQuestions}
                onChange={(e) => setForm({ ...form, totalQuestions: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">पासिंग मार्क्स</label>
              <input
                type="number"
                value={form.passingMarks}
                onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">समय (Minutes)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {saving ? 'तैयार हो रहा है...' : 'टेस्ट लाइव करें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateBlogModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    title: '',
    category: 'JEE Preparation',
    excerpt: 'महत्वपूर्ण परीक्षा रणनीति और रिवीजन तकनीक।',
    content: '1. प्रतिदिन 40 प्रश्नों का टाइम बाउंड प्रैक्टिस करें।\n2. एरर लॉग नोटबुक में अपनी गलतियों को रिकॉर्ड करें।\n3. हर रविवार को पिछले सप्ताह का फुल रिवीजन अनिवार्य रखें।',
    author: 'Er. Rajesh Singhania (Head of Academics)',
    readTime: '5 mins read',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    try {
      setSaving(true);
      await addDoc(collection(db, 'blogs'), {
        ...form,
        published: true,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'blogs');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 text-white">
        <h3 className="text-lg font-bold">नया ब्लॉग आर्टिकल पब्लिश करें (Publish Blog)</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">आर्टिकल शीर्षक (Title) *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">कैटेगरी (Category)</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">लेखक (Author)</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">संक्षिप्त सारांश (Excerpt)</label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">विस्तृत सामग्री (Article Content)</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-teal-500 font-sans"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {saving ? 'पब्लिश हो रहा है...' : 'ब्लॉग पब्लिश करें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateAdmissionModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    studentName: '',
    parentName: '',
    grade: 'Class 12 (JEE Main + Adv)',
    previousScore: '92.5%',
    phone: '',
    email: '',
    notes: 'Direct offline walk-in admission',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.parentName || !form.phone) return;
    try {
      setSaving(true);
      await addDoc(collection(db, 'admissions'), {
        ...form,
        status: 'approved', // Direct admin entry can be pre-approved
        appliedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'admissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 text-white">
        <h3 className="text-lg font-bold">ऑफलाइन एडमिशन दर्ज करें (Offline Admission Entry)</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">छात्र का नाम *</label>
              <input
                type="text"
                required
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">अभिभावक का नाम *</label>
              <input
                type="text"
                required
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">क्लास/ग्रेड</label>
              <input
                type="text"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">पिछला प्राप्तांक (%)</label>
              <input
                type="text"
                value={form.previousScore}
                onChange={(e) => setForm({ ...form, previousScore: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">फोन नंबर *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">ईमेल</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {saving ? 'दर्ज हो रहा है...' : 'एडमिशन कन्फर्म करें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
