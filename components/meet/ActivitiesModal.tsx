'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  BarChart2, 
  HelpCircle, 
  Layers, 
  Plus, 
  Trash2, 
  Check, 
  ThumbsUp, 
  Clock, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PollOption {
  text: string;
  votes: number;
  votedUserIds?: string[];
}

export interface MeetPoll {
  id?: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  creatorPeerId: string;
  isOpen: boolean;
  createdAt: number;
}

export interface MeetQuestion {
  id?: string;
  question: string;
  askedBy: string;
  askerPeerId: string;
  upvotes: number;
  upvotedUserIds?: string[];
  isAnswered: boolean;
  createdAt: number;
}

interface ActivitiesModalProps {
  roomId: string;
  myPeerId: string;
  myName: string;
  isHost: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivitiesModal({
  roomId,
  myPeerId,
  myName,
  isHost,
  isOpen,
  onClose,
}: ActivitiesModalProps) {
  const [activeTab, setActiveTab] = useState<'polls' | 'qa' | 'breakout'>('polls');

  // Polls State
  const [polls, setPolls] = useState<MeetPoll[]>([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState<string[]>(['Yes, understood', 'Need revision']);

  // Q&A State
  const [questions, setQuestions] = useState<MeetQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Breakout Rooms State
  const [breakoutRoomsCount, setBreakoutRoomsCount] = useState(2);
  const [breakoutTimerMinutes, setBreakoutTimerMinutes] = useState(10);
  const [breakoutActive, setBreakoutActive] = useState(false);
  const [activeBreakoutRoom, setActiveBreakoutRoom] = useState<string | null>(null);

  // Firestore listeners for Polls and Q&A
  useEffect(() => {
    if (!isOpen || !roomId) return;

    // Polls Listener
    const pollsRef = collection(db, 'meet_rooms', roomId, 'polls');
    const unsubPolls = onSnapshot(pollsRef, (snapshot) => {
      const list: MeetPoll[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as MeetPoll);
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      setPolls(list);
    });

    // Q&A Listener
    const qaRef = collection(db, 'meet_rooms', roomId, 'questions');
    const unsubQA = onSnapshot(qaRef, (snapshot) => {
      const list: MeetQuestion[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as MeetQuestion);
      });
      list.sort((a, b) => b.upvotes - a.upvotes); // highest upvotes on top
      setQuestions(list);
    });

    return () => {
      unsubPolls();
      unsubQA();
    };
  }, [isOpen, roomId]);

  // Create Poll
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestion.trim()) return;
    const validOptions = newPollOptions.filter(o => o.trim().length > 0);
    if (validOptions.length < 2) return;

    const payload: MeetPoll = {
      question: newPollQuestion.trim(),
      options: validOptions.map(opt => ({ text: opt.trim(), votes: 0, votedUserIds: [] })),
      createdBy: myName,
      creatorPeerId: myPeerId,
      isOpen: true,
      createdAt: Date.now(),
    };

    try {
      const pollsRef = collection(db, 'meet_rooms', roomId, 'polls');
      await addDoc(pollsRef, payload);
      setNewPollQuestion('');
      setNewPollOptions(['Yes, understood', 'Need revision']);
      setShowCreatePoll(false);
    } catch (err) {
      console.warn('Poll creation error:', err);
    }
  };

  // Vote on Poll
  const handleVotePoll = async (poll: MeetPoll, optionIndex: number) => {
    if (!poll.id || !poll.isOpen) return;

    // Clone options
    const updatedOptions = poll.options.map((opt, idx) => {
      const voters = opt.votedUserIds || [];
      const hasVotedThis = voters.includes(myPeerId);

      if (idx === optionIndex) {
        if (!hasVotedThis) {
          return {
            ...opt,
            votes: opt.votes + 1,
            votedUserIds: [...voters, myPeerId],
          };
        }
      } else {
        // remove vote if previously voted other option
        if (hasVotedThis) {
          return {
            ...opt,
            votes: Math.max(0, opt.votes - 1),
            votedUserIds: voters.filter(id => id !== myPeerId),
          };
        }
      }
      return opt;
    });

    try {
      const pollDocRef = doc(db, 'meet_rooms', roomId, 'polls', poll.id);
      await updateDoc(pollDocRef, { options: updatedOptions });
    } catch (err) {
      console.warn('Voting error:', err);
    }
  };

  // Close or Delete Poll
  const handleTogglePollOpen = async (pollId: string, currentOpen: boolean) => {
    try {
      const pollDocRef = doc(db, 'meet_rooms', roomId, 'polls', pollId);
      await updateDoc(pollDocRef, { isOpen: !currentOpen });
    } catch (err) {
      console.warn('Poll status error:', err);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    try {
      const pollDocRef = doc(db, 'meet_rooms', roomId, 'polls', pollId);
      await deleteDoc(pollDocRef);
    } catch (err) {
      console.warn('Poll delete error:', err);
    }
  };

  // Ask Question in Q&A
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const payload: MeetQuestion = {
      question: newQuestionText.trim(),
      askedBy: myName,
      askerPeerId: myPeerId,
      upvotes: 1,
      upvotedUserIds: [myPeerId],
      isAnswered: false,
      createdAt: Date.now(),
    };

    setNewQuestionText('');
    try {
      const qaRef = collection(db, 'meet_rooms', roomId, 'questions');
      await addDoc(qaRef, payload);
    } catch (err) {
      console.warn('Question ask error:', err);
    }
  };

  // Upvote Question
  const handleUpvoteQuestion = async (q: MeetQuestion) => {
    if (!q.id) return;
    const voters = q.upvotedUserIds || [];
    const hasVoted = voters.includes(myPeerId);

    const newUpvotes = hasVoted ? Math.max(0, q.upvotes - 1) : q.upvotes + 1;
    const newVoters = hasVoted ? voters.filter(id => id !== myPeerId) : [...voters, myPeerId];

    try {
      const qDocRef = doc(db, 'meet_rooms', roomId, 'questions', q.id);
      await updateDoc(qDocRef, {
        upvotes: newUpvotes,
        upvotedUserIds: newVoters,
      });
    } catch (err) {
      console.warn('Upvote error:', err);
    }
  };

  // Mark Question Answered
  const handleToggleAnswered = async (qId: string, current: boolean) => {
    try {
      const qDocRef = doc(db, 'meet_rooms', roomId, 'questions', qId);
      await updateDoc(qDocRef, { isAnswered: !current });
    } catch (err) {
      console.warn('Answered toggle error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shrink-0 text-white shadow-2xl animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Google Meet Activities Icon (Triangle, Square, Circle) */}
          <div className="flex items-center gap-0.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="w-2.5 h-2.5 bg-yellow-400" />
            <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-rose-500" />
          </div>
          <h3 className="font-semibold text-base tracking-tight text-white">
            Activities
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs: Polls | Q&A | Breakout */}
      <div className="flex border-b border-slate-800 shrink-0 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('polls')}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'polls'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Polls ({polls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'qa'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Q&amp;A ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('breakout')}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'breakout'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Breakout</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* =========================================================
            TAB 1: POLLS (लाइव पोलिंग व वोटिंग)
        ========================================================= */}
        {activeTab === 'polls' && (
          <div className="space-y-4">
            
            {!showCreatePoll ? (
              <button
                onClick={() => setShowCreatePoll(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center justify-center gap-2 border border-blue-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Start a new poll</span>
              </button>
            ) : (
              /* Create Poll Form */
              <form onSubmit={handleCreatePoll} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Create a Poll</span>
                  <button
                    type="button"
                    onClick={() => setShowCreatePoll(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Question</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Do you understand this theorem?"
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300">Options</label>
                  {newPollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newPollOptions];
                          updated[i] = e.target.value;
                          setNewPollOptions(updated);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 text-xs"
                      />
                      {newPollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setNewPollOptions(newPollOptions.filter((_, idx) => idx !== i))}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {newPollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setNewPollOptions([...newPollOptions, `Option ${newPollOptions.length + 1}`])}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      + Add option
                    </button>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePoll(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Launch
                  </button>
                </div>
              </form>
            )}

            {/* Polls List */}
            {polls.map((p) => {
              const totalVotes = p.options.reduce((acc, o) => acc + o.votes, 0);

              return (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm leading-snug">
                      {p.question}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.isOpen ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {p.isOpen ? 'Active' : 'Closed'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    By {p.createdBy} • {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                  </p>

                  {/* Options with live vote bars */}
                  <div className="space-y-2 pt-1">
                    {p.options.map((opt, optIdx) => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const hasVotedThis = opt.votedUserIds?.includes(myPeerId);

                      return (
                        <div
                          key={optIdx}
                          onClick={() => p.isOpen && handleVotePoll(p, optIdx)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                            hasVotedThis
                              ? 'border-blue-500 bg-blue-950/40 text-white'
                              : 'border-slate-700 hover:border-slate-600 bg-slate-900/60 text-slate-200'
                          }`}
                        >
                          {/* Progress fill bar */}
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-blue-600/20 transition-all duration-500 pointer-events-none"
                            style={{ width: `${pct}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between text-xs">
                            <span className="font-medium flex items-center gap-1.5">
                              {hasVotedThis && <Check className="w-3.5 h-3.5 text-blue-400" />}
                              {opt.text}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              {pct}% ({opt.votes})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Host controls for poll */}
                  {isHost && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-700/60 text-[11px]">
                      <button
                        onClick={() => handleTogglePollOpen(p.id!, p.isOpen)}
                        className="text-blue-400 hover:underline font-semibold"
                      >
                        {p.isOpen ? 'End poll' : 'Re-open poll'}
                      </button>

                      <button
                        onClick={() => handleDeletePoll(p.id!)}
                        className="text-slate-500 hover:text-rose-400"
                        title="Delete poll"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {polls.length === 0 && !showCreatePoll && (
              <div className="text-center py-10 text-slate-500 text-xs">
                No active polls yet. Click above to start one!
              </div>
            )}

          </div>
        )}

        {/* =========================================================
            TAB 2: Q&A (प्रश्न और उत्तर)
        ========================================================= */}
        {activeTab === 'qa' && (
          <div className="space-y-4">
            
            {/* Ask Question Input */}
            <form onSubmit={handleAskQuestion} className="space-y-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newQuestionText.trim()}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-40 transition-colors"
              >
                Post question
              </button>
            </form>

            {/* Questions Stream */}
            <div className="space-y-3 pt-2">
              {questions.map((q) => {
                const hasUpvoted = q.upvotedUserIds?.includes(myPeerId);

                return (
                  <div key={q.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-300 text-[11px] block">
                          {q.askedBy}
                        </span>
                        <p className="text-white text-xs mt-0.5 leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvoteQuestion(q)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border transition-colors ${
                          hasUpvoted
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{q.upvotes}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/50">
                      <span className={q.isAnswered ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {q.isAnswered ? '✓ Answered' : 'Unanswered'}
                      </span>

                      {isHost && (
                        <button
                          onClick={() => handleToggleAnswered(q.id!, q.isAnswered)}
                          className="text-blue-400 hover:underline"
                        >
                          Mark as {q.isAnswered ? 'unanswered' : 'answered'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {questions.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No questions asked yet. Be the first to ask!
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 3: BREAKOUT ROOMS (उप-कक्ष)
        ========================================================= */}
        {activeTab === 'breakout' && (
          <div className="space-y-4 text-xs">
            
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Breakout Rooms
              </h4>
              <p className="text-slate-400 text-xs leading-normal">
                Split large classes or team meetings into smaller discussion pods for group exercises.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 mb-1">Number of rooms</label>
                  <select
                    value={breakoutRoomsCount}
                    onChange={(e) => setBreakoutRoomsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                  >
                    <option value={2}>2 Rooms</option>
                    <option value={3}>3 Rooms</option>
                    <option value={4}>4 Rooms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Timer (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={breakoutTimerMinutes}
                    onChange={(e) => setBreakoutTimerMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setBreakoutActive(!breakoutActive)}
                  className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                    breakoutActive
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {breakoutActive ? 'End breakout rooms (Ask all to return)' : 'Open breakout rooms now'}
                </button>
              </div>
            </div>

            {/* List of active breakout rooms */}
            {breakoutActive && (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ACTIVE ROOMS ({breakoutTimerMinutes} MINS LEFT)
                </div>

                {Array.from({ length: breakoutRoomsCount }).map((_, i) => {
                  const roomName = `Breakout Room ${i + 1}`;
                  const isJoined = activeBreakoutRoom === roomName;

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white text-xs">{roomName}</span>
                        <p className="text-[11px] text-slate-400">Discussion Pod {i + 1}</p>
                      </div>

                      <button
                        onClick={() => setActiveBreakoutRoom(isJoined ? null : roomName)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isJoined
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {isJoined ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
