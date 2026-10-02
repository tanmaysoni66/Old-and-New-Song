'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { soundManager } from '@/lib/audio-effects';

export interface ChatMessage {
  id?: string;
  senderName: string;
  senderPeerId: string;
  text: string;
  createdAt: number;
}

interface InCallChatProps {
  roomId: string;
  myPeerId: string;
  myName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InCallChat({ roomId, myPeerId, myName, isOpen, onClose }: InCallChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!roomId) return;
    const chatRef = collection(db, 'meet_rooms', roomId, 'messages');
    const q = query(chatRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(list);

      // Play sound if new message from others
      if (!initialLoadRef.current) {
        const lastMsg = list[list.length - 1];
        if (lastMsg && lastMsg.senderPeerId !== myPeerId) {
          soundManager.playMessageSound();
        }
      }
      initialLoadRef.current = false;
    });

    return () => unsubscribe();
  }, [roomId, myPeerId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const payload: ChatMessage = {
      senderName: myName,
      senderPeerId: myPeerId,
      text: inputText.trim(),
      createdAt: Date.now(),
    };

    setInputText('');
    try {
      const chatRef = collection(db, 'meet_rooms', roomId, 'messages');
      await addDoc(chatRef, payload);
    } catch (err) {
      console.warn('Chat send error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shrink-0 text-white shadow-2xl animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
          In-call messages
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Meet Warning Notice */}
      <div className="p-3 mx-4 mt-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 leading-normal flex items-start gap-2 shrink-0">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Messages can be seen only by people in the call and are deleted when the call ends.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderPeerId === myPeerId;
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          return (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`font-semibold ${isMe ? 'text-indigo-400' : 'text-slate-200'}`}>
                  {isMe ? 'You' : msg.senderName}
                </span>
                <span className="text-[10px] text-slate-500">{time}</span>
              </div>
              <div className="text-xs text-slate-200 bg-slate-800/60 p-3 rounded-2xl rounded-tl-sm border border-slate-700/50 break-words leading-relaxed">
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 shrink-0 bg-slate-900">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Send a message to everyone"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 rounded-full bg-slate-800 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-1.5 p-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-indigo-400 transition-colors"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
}
