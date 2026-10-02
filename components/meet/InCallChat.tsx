'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  AlertCircle, 
  Paperclip, 
  Smile, 
  Download, 
  FileText, 
  FileCode, 
  Image as ImageIcon,
  Lock,
  ChevronDown
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { soundManager } from '@/lib/audio-effects';

export interface ChatAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'img' | 'code' | 'doc';
  dataUrl?: string;
}

export interface ChatMessage {
  id?: string;
  senderName: string;
  senderPeerId: string;
  recipientPeerId?: string; // 'everyone' or specific peerId
  recipientName?: string;
  text: string;
  attachment?: ChatAttachment;
  createdAt: number;
}

interface InCallChatProps {
  roomId: string;
  myPeerId: string;
  myName: string;
  isOpen: boolean;
  onClose: () => void;
  participants?: { peerId: string; name: string }[];
}

export default function InCallChat({ 
  roomId, 
  myPeerId, 
  myName, 
  isOpen, 
  onClose,
  participants = []
}: InCallChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [targetRecipient, setTargetRecipient] = useState<string>('everyone');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initialLoadRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const emojiList = ['👍', '👏', '❤️', '🎉', '🚀', '🔥', '💡', '✅'];

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
          // Only play if message is for everyone or specifically for me
          if (!lastMsg.recipientPeerId || lastMsg.recipientPeerId === 'everyone' || lastMsg.recipientPeerId === myPeerId) {
            soundManager.playMessageSound();
          }
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

  const handleSendMessage = async (e?: React.FormEvent, customAttachment?: ChatAttachment) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !customAttachment) return;

    const recipientObj = participants.find(p => p.peerId === targetRecipient);
    const recipientName = targetRecipient === 'everyone' ? 'Everyone' : (recipientObj?.name || 'Direct Message');

    const payload: ChatMessage = {
      senderName: myName,
      senderPeerId: myPeerId,
      recipientPeerId: targetRecipient,
      recipientName: recipientName,
      text: inputText.trim(),
      attachment: customAttachment,
      createdAt: Date.now(),
    };

    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    try {
      const chatRef = collection(db, 'meet_rooms', roomId, 'messages');
      await addDoc(chatRef, payload);
    } catch (err) {
      console.warn('Chat send error:', err);
    }
  };

  const handleSendSampleAttachment = (type: 'pdf' | 'img' | 'code' | 'doc') => {
    const samples: Record<string, ChatAttachment> = {
      pdf: { name: 'Meeting_Agenda_Notes.pdf', size: '2.4 MB', type: 'pdf' },
      img: { name: 'Architecture_Diagram.png', size: '1.8 MB', type: 'img' },
      code: { name: 'webrtc-stream-config.ts', size: '14 KB', type: 'code' },
      doc: { name: 'Project_Sprint_Deliverables.docx', size: '540 KB', type: 'doc' },
    };

    handleSendMessage(undefined, samples[type]);
  };

  const handleDownloadAttachment = (att: ChatAttachment) => {
    // Generate text blob download for demonstration
    const blob = new Blob([`Simulated attachment download for: ${att.name}\nSize: ${att.size}\nSession: ${roomId}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = att.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  // Filter messages: show if everyone, or if sender is me, or if recipient is me
  const visibleMessages = messages.filter((msg) => {
    if (!msg.recipientPeerId || msg.recipientPeerId === 'everyone') return true;
    return msg.senderPeerId === myPeerId || msg.recipientPeerId === myPeerId;
  });

  return (
    <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shrink-0 text-white shadow-2xl animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
            <span>In-call messages</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
              {visibleMessages.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">Direct & group chat with file sharing</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Recipient Selector (Zoom Flagship Feature: Everyone or Private DM) */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
          {targetRecipient !== 'everyone' ? (
            <Lock className="w-3 h-3 text-purple-400" />
          ) : (
            <MessageSquare className="w-3 h-3 text-indigo-400" />
          )}
          <span>To:</span>
        </span>

        <select
          value={targetRecipient}
          onChange={(e) => setTargetRecipient(e.target.value)}
          className="bg-slate-800 text-xs text-white rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium max-w-[200px] truncate"
        >
          <option value="everyone">Everyone (In Meeting)</option>
          {participants
            .filter((p) => p.peerId !== myPeerId)
            .map((p) => (
              <option key={p.peerId} value={p.peerId}>
                🔒 {p.name} (Direct Message)
              </option>
            ))}
        </select>
      </div>

      {/* Meet Warning Notice */}
      <div className="p-3 mx-4 mt-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 leading-normal flex items-start gap-2 shrink-0">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Messages are visible to participants in this meeting and are wiped when the call ends.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {visibleMessages.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No messages yet. Say hello or share a document with the team!
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const isMe = msg.senderPeerId === myPeerId;
            const isDirect = msg.recipientPeerId && msg.recipientPeerId !== 'everyone';
            const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

            return (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                  <span className={`font-semibold ${isMe ? 'text-indigo-400' : 'text-slate-200'}`}>
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  
                  {isDirect && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 text-[10px] font-semibold border border-purple-700/50 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Direct {isMe ? `to ${msg.recipientName}` : 'from sender'}</span>
                    </span>
                  )}

                  <span className="text-[10px] text-slate-500 ml-auto">{time}</span>
                </div>

                <div className={`text-xs p-3 rounded-2xl rounded-tl-sm border break-words leading-relaxed space-y-2 ${
                  isDirect 
                    ? 'bg-purple-950/30 border-purple-800/40 text-purple-100' 
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-200'
                }`}>
                  {msg.text && <div>{msg.text}</div>}

                  {/* Attachment Card */}
                  {msg.attachment && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                          {msg.attachment.type === 'pdf' && <FileText className="w-4 h-4 text-rose-400" />}
                          {msg.attachment.type === 'img' && <ImageIcon className="w-4 h-4 text-emerald-400" />}
                          {msg.attachment.type === 'code' && <FileCode className="w-4 h-4 text-amber-400" />}
                          {msg.attachment.type === 'doc' && <FileText className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {msg.attachment.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {msg.attachment.size}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadAttachment(msg.attachment!)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                        title="Download attachment"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Shortcuts Picker */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 flex-wrap shrink-0">
          {emojiList.map(emoji => (
            <button
              key={emoji}
              onClick={() => setInputText(prev => prev + emoji)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-base transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Options Menu */}
      {showAttachMenu && (
        <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs shrink-0 animate-in slide-in-from-bottom duration-150">
          <button
            onClick={() => handleSendSampleAttachment('pdf')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center gap-2 text-slate-300 text-left"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span className="truncate">Meeting_Notes.pdf</span>
          </button>
          <button
            onClick={() => handleSendSampleAttachment('img')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center gap-2 text-slate-300 text-left"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span className="truncate">Slide_Mockup.png</span>
          </button>
          <button
            onClick={() => handleSendSampleAttachment('code')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center gap-2 text-slate-300 text-left"
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="truncate">stream-code.ts</span>
          </button>
          <button
            onClick={() => handleSendSampleAttachment('doc')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center gap-2 text-slate-300 text-left"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="truncate">Sprint_Specs.docx</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={(e) => handleSendMessage(e)} className="p-3 border-t border-slate-800 shrink-0 bg-slate-900">
        <div className="relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            className={`p-2 rounded-full transition-colors ${
              showAttachMenu ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Attach File (Zoom file sharing)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className={`p-2 rounded-full transition-colors ${
              showEmojiPicker ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={
              targetRecipient === 'everyone'
                ? "Send a message to everyone..."
                : `Private message to ${participants.find(p => p.peerId === targetRecipient)?.name || 'attendee'}...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 pl-3 pr-10 py-2.5 rounded-full bg-slate-800 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition-colors shrink-0"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
}
