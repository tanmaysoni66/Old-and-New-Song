'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  ArrowLeft, 
  GraduationCap, 
  BookOpen, 
  Atom, 
  Dna, 
  Calculator, 
  Clock, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Atom,
    label: 'Photoelectric Effect',
    prompt: 'Explain Photoelectric Effect and Einstein’s equation with graph and key formula.',
  },
  {
    icon: Dna,
    label: 'NEET NCERT Biology',
    prompt: 'Which are the top 10 highest-weightage NCERT chapters for NEET Biology 360/360?',
  },
  {
    icon: Calculator,
    label: 'JEE Calculus Shortcuts',
    prompt: 'Explain standard shortcut tricks and properties for Definite Integrals in JEE Advanced.',
  },
  {
    icon: Clock,
    label: '60-Day Study Timetable',
    prompt: 'Create a realistic, disciplined 60-day revision timetable for Class 12 Board + JEE Mains.',
  },
  {
    icon: BookOpen,
    label: 'Anti-Piracy Notes',
    prompt: 'How do the Apex Academy Anti-Piracy Watermarked notes help student security?',
  },
  {
    icon: Lightbulb,
    label: 'Organic Chemistry Reactions',
    prompt: 'Explain the mechanism of Aldol Condensation vs Cannizzaro Reaction with examples.',
  },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `नमस्ते! 🙏 मैं **Apex AI Guru** हूँ — आपका 24x7 पर्सनल एकेडमिक मेंटर व डाउट सॉल्वर।\n\nआप मुझसे **Physics, Chemistry, Maths, Biology** के कॉन्सेप्ट्स, कठिन प्रश्न, डेरिवेशन, **JEE / NEET परीक्षा रणनीति**, या अपेक्स एकेडमी के बैचेस व स्टडी नोट्स के बारे में कुछ भी पूछ सकते हैं!\n\nनीचे दिए गए किसी भी टॉपिक पर क्लिक करें या अपना प्रश्न सीधे टाइप करें:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from AI service');
      }

      const data = await response.json();
      const aiContent = data.text || 'मुझे क्षमा करें, उत्तर तैयार करने में तकनीकी समस्या आई। कृपया पुनः प्रयास करें।';

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Optional Text-To-Speech if enabled
      if (speechEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const cleanText = aiContent.replace(/[*#_`]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 300));
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('TTS error:', e);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          content: '⚠️ क्षमा करें, सर्वर से संपर्क नहीं हो पाया। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रश्न पूछें।',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (confirm('क्या आप चैट हिस्ट्री को रीसेट करना चाहते हैं?')) {
      setMessages([
        {
          id: 'welcome_reset',
          role: 'model',
          content: 'चैट हिस्ट्री रीसेट कर दी गई है। आप कोई भी नया प्रश्न पूछ सकते हैं!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Home Portal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">मुख्य पोर्टल</span>
            </Link>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Apex AI Guru
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  24x7 Academic Mentor & Doubt Solver (JEE • NEET • 9-12)
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                speechEnabled 
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle Text-To-Speech Audio"
            >
              {speechEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline text-[11px]">Audio</span>
            </button>

            <button
              onClick={clearChat}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link
              href="/admin-panel"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow transition-all hidden sm:flex items-center gap-1"
            >
              Admin Panel
            </Link>
          </div>

        </div>
      </header>

      {/* Chat Messages Scroll Container */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Quick Preset Suggested Prompts */}
          <div className="space-y-2 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>त्वरित प्रश्न व कॉन्सेप्ट्स (Quick Academic Prompts):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group flex items-start gap-2 text-xs"
                  >
                    <IconComponent className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-semibold text-slate-200 line-clamp-1 group-hover:text-indigo-300">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-800/80 my-2" />

          {/* Conversation Bubbles */}
          <div className="space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Left Avatar for AI */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-indigo-600/20">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble Body */}
                  <div
                    className={`relative max-w-2xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-tr-none'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 dark:border-slate-800 text-[11px] opacity-75">
                      <span className="font-semibold">
                        {isUser ? 'आप (Student / Aspirant)' : 'Apex AI Guru (मेंटोर)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="hover:text-white p-1 rounded transition-colors"
                            title="Copy Answer"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content with whitespace formatting and line breaks */}
                    <div className="whitespace-pre-wrap space-y-2 text-xs sm:text-sm font-sans selection:bg-indigo-500 selection:text-white">
                      {msg.content}
                    </div>
                  </div>

                  {/* Right Avatar for User */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-900 border border-indigo-700 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing / Loading indicator */}
            {loading && (
              <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-indigo-600/20">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-300 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-slate-400 font-medium">
                    Apex AI Guru उत्तर तैयार कर रहा है...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

        </div>
      </main>

      {/* Bottom Sticky Input Bar */}
      <footer className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-end gap-2 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 rounded-2xl p-2 transition-all shadow-inner"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="भौतिकी, रसायन, गणित, जीवविज्ञान या परीक्षा की तैयारी से जुड़ा कोई भी प्रश्न पूछें... (Enter to send)"
              className="flex-1 max-h-32 min-h-[44px] bg-transparent text-sm text-white placeholder-slate-500 resize-none px-3 py-2.5 focus:outline-none leading-relaxed"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all shrink-0"
            >
              <span>भेजें</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span>
              💡 Shift + Enter दबाकर नई लाइन जोड़ें।
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Powered by Google Gemini
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
