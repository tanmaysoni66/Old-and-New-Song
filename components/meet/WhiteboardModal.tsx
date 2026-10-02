'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  PenTool, 
  Eraser, 
  Download, 
  Sparkles,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Video as VideoIcon,
  Type,
  Check,
  Undo2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  Hash,
  Calculator
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StrokePoint {
  x: number;
  y: number;
}

interface WhiteboardStroke {
  id?: string;
  points: StrokePoint[];
  color: string;
  width: number;
  isHighlighter?: boolean;
  createdAt: number;
}

interface WhiteboardTextItem {
  id?: string;
  text: string;
  x: number; // 0 to 1 relative coordinate
  y: number;
  color: string;
  fontSize: number;
  createdAt: number;
}

interface WhiteboardMediaItem {
  id?: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  x: number; // 0 to 1 relative coordinate
  y: number;
  width: number; // relative 0 to 1 or px
  height: number;
  createdAt: number;
  isPlaying?: boolean;
}

interface WhiteboardModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  isHost?: boolean;
}

const PEN_COLORS = [
  { label: 'Blue (नीला)', value: '#2563eb', bgClass: 'bg-blue-600' },
  { label: 'White (सफ़ेद)', value: '#ffffff', bgClass: 'bg-white border-slate-300' },
  { label: 'Black (काला)', value: '#000000', bgClass: 'bg-black' },
  { label: 'Green (हरा)', value: '#16a34a', bgClass: 'bg-green-600' },
  { label: 'Red (लाल)', value: '#dc2626', bgClass: 'bg-red-600' },
  { label: 'Yellow (पीला)', value: '#eab308', bgClass: 'bg-yellow-500' },
  { label: 'Purple (बैंगनी)', value: '#9333ea', bgClass: 'bg-purple-600' },
];

const QUICK_ALPHABETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const QUICK_NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '100'];
const QUICK_MATH = ['+', '−', '×', '÷', '=', '%', '√', 'π', '(', ')'];

export default function WhiteboardModal({ roomId, isOpen, onClose }: WhiteboardModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Drawing Tools
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#2563eb'); // Default Blue as requested
  const [currentWidth, setCurrentWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Text & Auto Spell / Recognition
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [spellSuggestions, setSpellSuggestions] = useState<string[]>([]);
  const [showAlphaBar, setShowAlphaBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'draw' | 'media' | 'alphabet'>('draw');

  // Media (Photos & Videos)
  const [mediaList, setMediaList] = useState<WhiteboardMediaItem[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaTitleInput, setMediaTitleInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [videoMuted, setVideoMuted] = useState<Record<string, boolean>>({});

  // Sync state
  const strokesRef = useRef<WhiteboardStroke[]>([]);
  const textItemsRef = useRef<WhiteboardTextItem[]>([]);
  const [textItems, setTextItems] = useState<WhiteboardTextItem[]>([]);
  const currentPointsRef = useRef<StrokePoint[]>([]);

  // 1. Firebase Listeners for Strokes & Text Items
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const boardRef = collection(db, 'meet_rooms', roomId, 'whiteboard');
    const unsubscribeStrokes = onSnapshot(
      boardRef,
      (snapshot) => {
        const strokes: WhiteboardStroke[] = [];
        snapshot.forEach((docSnap) => {
          strokes.push({ id: docSnap.id, ...docSnap.data() } as WhiteboardStroke);
        });
        strokes.sort((a, b) => a.createdAt - b.createdAt);
        strokesRef.current = strokes;
        redrawCanvas();
      },
      (err) => {
        console.warn('Whiteboard strokes listener notice:', err);
      }
    );

    // Text Items Listener
    const textRef = collection(db, 'meet_rooms', roomId, 'whiteboard_text');
    const unsubscribeText = onSnapshot(
      textRef,
      (snapshot) => {
        const items: WhiteboardTextItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as WhiteboardTextItem);
        });
        textItemsRef.current = items;
        setTextItems(items);
        redrawCanvas();
      },
      (err) => {
        console.warn('Whiteboard text listener notice:', err);
      }
    );

    // Media (Photos & Videos) Listener
    const mediaRef = collection(db, 'meet_rooms', roomId, 'whiteboard_media');
    const unsubscribeMedia = onSnapshot(
      mediaRef,
      (snapshot) => {
        const list: WhiteboardMediaItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as WhiteboardMediaItem);
        });
        list.sort((a, b) => a.createdAt - b.createdAt);
        setMediaList(list);
      },
      (err) => {
        console.warn('Whiteboard media listener notice:', err);
      }
    );

    return () => {
      unsubscribeStrokes();
      unsubscribeText();
      unsubscribeMedia();
    };
  }, [isOpen, roomId]);

  // Adjust canvas size when window changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      redrawCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isOpen, isFullscreen]);

  // Redraw Canvas (Strokes + Text Labels)
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Draw Strokes
    strokesRef.current.forEach((stroke) => {
      if (!stroke.points || stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      if (stroke.isHighlighter) {
        ctx.globalAlpha = 0.4;
      }
      ctx.moveTo(stroke.points[0].x * width, stroke.points[0].y * height);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * width, stroke.points[i].y * height);
      }
      ctx.stroke();
      ctx.restore();
    });

    // 2. Draw Text Items
    textItemsRef.current.forEach((item) => {
      ctx.save();
      ctx.font = `bold ${item.fontSize || 22}px Inter, sans-serif`;
      ctx.fillStyle = item.color || '#000000';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 4;
      ctx.fillText(item.text, item.x * width, item.y * height);
      ctx.restore();
    });
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  };

  // Drawing Handlers
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (tool === 'text') {
      const p = getCanvasCoords(e);
      setTextPosition(p);
      return;
    }

    setIsDrawing(true);
    const p = getCanvasCoords(e);
    currentPointsRef.current = [p];
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'text') return;
    const p = getCanvasCoords(e);
    currentPointsRef.current.push(p);

    // Live instant local preview
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const points = currentPointsRef.current;
    if (points.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = tool === 'eraser' ? 26 : (tool === 'highlighter' ? currentWidth * 3 : currentWidth);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'highlighter') ctx.globalAlpha = 0.35;

    ctx.moveTo(points[points.length - 2].x * width, points[points.length - 2].y * height);
    ctx.lineTo(points[points.length - 1].x * width, points[points.length - 1].y * height);
    ctx.stroke();
    ctx.restore();
  };

  const handleStopDraw = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPointsRef.current.length > 1) {
      const strokeData: WhiteboardStroke = {
        points: currentPointsRef.current,
        color: tool === 'eraser' ? '#ffffff' : currentColor,
        width: tool === 'eraser' ? 26 : (tool === 'highlighter' ? currentWidth * 3 : currentWidth),
        isHighlighter: tool === 'highlighter',
        createdAt: Date.now(),
      };

      try {
        const boardRef = collection(db, 'meet_rooms', roomId, 'whiteboard');
        await addDoc(boardRef, strokeData);
      } catch (err) {
        console.warn('Failed to sync stroke to Firebase:', err);
      }
    }
    currentPointsRef.current = [];
  };

  // Auto-Spelling / Text Recognition with AI & Spelling Engine
  const handleRecognizeHandwriting = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecognizing(true);
    try {
      const imageBase64 = canvas.toDataURL('image/png');
      const res = await fetch('/api/whiteboard/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mode: 'ocr' })
      });
      const data = await res.json();
      
      if (data.recognizedText) {
        // Place recognized clean alphabet / word / number onto canvas
        const newTextItem: WhiteboardTextItem = {
          text: data.recognizedText,
          x: 0.45,
          y: 0.5,
          color: currentColor,
          fontSize: 28,
          createdAt: Date.now()
        };
        const textRef = collection(db, 'meet_rooms', roomId, 'whiteboard_text');
        await addDoc(textRef, newTextItem);
      }
    } catch (err) {
      console.warn('Recognition failed:', err);
    } finally {
      setIsRecognizing(false);
    }
  };

  // Add Clean Alphabet / Number / Symbol to Board
  const handleAddQuickSymbol = async (symbol: string) => {
    try {
      const newTextItem: WhiteboardTextItem = {
        text: symbol,
        x: Math.random() * 0.6 + 0.2,
        y: Math.random() * 0.5 + 0.25,
        color: currentColor === '#ffffff' ? '#000000' : currentColor,
        fontSize: 32,
        createdAt: Date.now()
      };
      const textRef = collection(db, 'meet_rooms', roomId, 'whiteboard_text');
      await addDoc(textRef, newTextItem);
    } catch (e) {
      console.warn('Failed to add symbol:', e);
    }
  };

  // Submit Text Input with Auto Spelling
  const handleSubmitText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !textPosition) return;

    try {
      // Auto check spelling if possible
      let finalWord = textInput.trim();
      
      const newTextItem: WhiteboardTextItem = {
        text: finalWord,
        x: textPosition.x,
        y: textPosition.y,
        color: currentColor === '#ffffff' ? '#000000' : currentColor,
        fontSize: currentWidth > 6 ? 32 : 22,
        createdAt: Date.now()
      };

      const textRef = collection(db, 'meet_rooms', roomId, 'whiteboard_text');
      await addDoc(textRef, newTextItem);

      setTextInput('');
      setTextPosition(null);
      setSpellSuggestions([]);
    } catch (err) {
      console.warn('Failed to add text:', err);
    }
  };

  // Auto-Spell Check as user types
  const handleTextChange = async (val: string) => {
    setTextInput(val);
    if (val.trim().length > 2) {
      try {
        const res = await fetch('/api/whiteboard/recognize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textInput: val, mode: 'spellcheck' })
        });
        const data = await res.json();
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSpellSuggestions(data.suggestions.slice(0, 4));
        }
      } catch {
        // Ignore background spell check errors
      }
    } else {
      setSpellSuggestions([]);
    }
  };

  // Photo & Video Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const isVideo = file.type.startsWith('video');
    const reader = new FileReader();

    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const mediaRef = collection(db, 'meet_rooms', roomId, 'whiteboard_media');
        await addDoc(mediaRef, {
          type: isVideo ? 'video' : 'image',
          url: dataUrl,
          title: file.name,
          x: 0.1 + Math.random() * 0.2,
          y: 0.1 + Math.random() * 0.2,
          width: isVideo ? 0.45 : 0.35,
          height: isVideo ? 0.35 : 0.3,
          createdAt: Date.now(),
          isPlaying: false
        });
        setShowMediaModal(false);
      } catch (err) {
        console.warn('Failed to upload media:', err);
        alert('Could not sync media file to Firebase. Try a smaller image or URL.');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      alert('Error reading file');
    };

    reader.readAsDataURL(file);
  };

  // Add Photo or Video from Web URL
  const handleAddMediaUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrlInput.trim()) return;

    try {
      const mediaRef = collection(db, 'meet_rooms', roomId, 'whiteboard_media');
      await addDoc(mediaRef, {
        type: mediaType,
        url: mediaUrlInput.trim(),
        title: mediaTitleInput.trim() || (mediaType === 'video' ? 'Shared Video' : 'Shared Photo'),
        x: 0.2 + Math.random() * 0.1,
        y: 0.2 + Math.random() * 0.1,
        width: mediaType === 'video' ? 0.45 : 0.35,
        height: mediaType === 'video' ? 0.35 : 0.3,
        createdAt: Date.now(),
        isPlaying: false
      });
      setMediaUrlInput('');
      setMediaTitleInput('');
      setShowMediaModal(false);
    } catch (err) {
      console.warn('Failed to add media URL:', err);
    }
  };

  // Remove Photo or Video from board
  const handleDeleteMedia = async (id?: string) => {
    if (!id) return;
    try {
      const docRef = doc(db, 'meet_rooms', roomId, 'whiteboard_media', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Delete media error:', e);
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(!isFullscreen);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Clear Entire Whiteboard
  const handleClearBoard = async () => {
    if (!confirm('क्या आप पूरा व्हाइटबोर्ड साफ़ करना चाहते हैं? (Clear all drawings, text & uploaded media)')) return;
    try {
      // Clear Strokes
      const boardRef = collection(db, 'meet_rooms', roomId, 'whiteboard');
      const snapStrokes = await getDocs(boardRef);
      snapStrokes.forEach(async (d) => await deleteDoc(d.ref));

      // Clear Text
      const textRef = collection(db, 'meet_rooms', roomId, 'whiteboard_text');
      const snapText = await getDocs(textRef);
      snapText.forEach(async (d) => await deleteDoc(d.ref));

      // Clear Media
      const mediaRef = collection(db, 'meet_rooms', roomId, 'whiteboard_media');
      const snapMedia = await getDocs(mediaRef);
      snapMedia.forEach(async (d) => await deleteDoc(d.ref));

      strokesRef.current = [];
      textItemsRef.current = [];
      setTextItems([]);
      setMediaList([]);
      redrawCanvas();
    } catch (err) {
      console.warn('Clear error:', err);
    }
  };

  // Undo Last Stroke
  const handleUndo = async () => {
    if (strokesRef.current.length === 0) return;
    const lastStroke = strokesRef.current[strokesRef.current.length - 1];
    if (lastStroke.id) {
      try {
        const docRef = doc(db, 'meet_rooms', roomId, 'whiteboard', lastStroke.id);
        await deleteDoc(docRef);
      } catch (e) {
        console.warn('Undo error:', e);
      }
    }
  };

  // Download Snapshot
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${roomId}-${Date.now()}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden ${
        isFullscreen ? 'p-0 w-screen h-screen' : 'p-2 sm:p-4'
      }`}
    >
      <div className={`relative bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shadow-2xl transition-all duration-200 ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[90vh] rounded-3xl'
      }`}>
        
        {/* =========================================================
            HEADER: Title, Live Indicator, AI Tools & Fullscreen
        ========================================================= */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  Google Meet Whiteboard &amp; Jamboard
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Synced
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                लाइव ड्रॉइंग, फ़ोटो/वीडियो शेयरिंग, अल्फ़ाबेट &amp; ऑटो-स्पेलिंग डिटेक्शन
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto Recognize / Smart Handwriting Button */}
            <button
              onClick={handleRecognizeHandwriting}
              disabled={isRecognizing}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isRecognizing 
                  ? 'bg-purple-900/50 text-purple-300 animate-pulse' 
                  : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30'
              }`}
              title="ड्रॉ किए गए अक्षर/नंबर को टेक्स्ट में बदलें (Auto-Recognize Alphabet & Numbers)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">
                {isRecognizing ? 'पहचान रहा है...' : '✨ ऑटो पहचान (Auto Spell)'}
              </span>
            </button>

            {/* Undo */}
            <button
              onClick={handleUndo}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Undo last stroke"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            {/* Download PNG */}
            <button
              onClick={handleDownloadImage}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Download Snapshot (PNG)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear Board */}
            <button
              onClick={handleClearBoard}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
              title="Clear Whiteboard"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={handleToggleFullscreen}
              className={`p-2 rounded-xl transition-colors ${
                isFullscreen 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (फुल स्क्रीन मोड)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors ml-1"
              title="Close Whiteboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================
            TOOLBAR: Pens, Colors (Blue, White, Black, Green, Red), Tools, Media & Alphabet
        ========================================================= */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Left: Tools Selection */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            
            {/* Pen Tool */}
            <button
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                tool === 'pen'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              पेन (Pen)
            </button>

            {/* Highlighter */}
            <button
              onClick={() => setTool('highlighter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                tool === 'highlighter'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              हाइलाइटर
            </button>

            {/* Eraser */}
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                tool === 'eraser'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              इरेज़र (Eraser)
            </button>

            {/* Text & Typing Tool */}
            <button
              onClick={() => setTool('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                tool === 'text'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Click on canvas to type text & auto-spell"
            >
              <Type className="w-3.5 h-3.5" />
              टेक्स्ट (Text)
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* REQUIRED PEN COLORS: Blue, White, Black, Green, Red, Yellow, Purple */}
            <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
              {PEN_COLORS.map((col) => {
                const isSelected = currentColor.toLowerCase() === col.value.toLowerCase() && tool !== 'eraser';
                return (
                  <button
                    key={col.value}
                    onClick={() => {
                      setCurrentColor(col.value);
                      if (tool === 'eraser') setTool('pen');
                    }}
                    className={`relative w-6 h-6 rounded-full transition-transform flex items-center justify-center ${col.bgClass} ${
                      isSelected 
                        ? 'scale-115 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 shadow-md' 
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={col.label}
                  >
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${col.value === '#ffffff' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Photo & Video Upload Button */}
            <button
              onClick={() => setShowMediaModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>फ़ोटो/वीडियो अपलोड (Add Media)</span>
            </button>

            {/* Alphabets & Numbers Toggle Bar */}
            <button
              onClick={() => setShowAlphaBar(!showAlphaBar)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showAlphaBar
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>A-Z / 0-9 पैड</span>
            </button>
          </div>

          {/* Right: Width Slider */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800">
            <span>साइज:</span>
            <input
              type="range"
              min="2"
              max="24"
              value={currentWidth}
              onChange={(e) => setCurrentWidth(Number(e.target.value))}
              className="w-20 sm:w-28 accent-blue-500 cursor-pointer"
            />
            <span className="font-mono text-slate-200 text-xs w-5 text-right">{currentWidth}px</span>
          </div>

        </div>

        {/* =========================================================
            QUICK ALPHABET & NUMBERS / MATH INSERTION BAR
        ========================================================= */}
        {showAlphaBar && (
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0 animate-in slide-in-from-top-2">
            <span className="text-slate-400 font-semibold text-[11px] shrink-0 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              त्वरित अक्षर/नंबर:
            </span>
            
            {/* Letters A-Z */}
            <div className="flex items-center gap-1 shrink-0">
              {QUICK_ALPHABETS.slice(0, 13).map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleAddQuickSymbol(letter)}
                  className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center transition-colors"
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-800 shrink-0" />

            {/* Numbers 0-9 */}
            <div className="flex items-center gap-1 shrink-0">
              {QUICK_NUMBERS.map((num) => (
                <button
                  key={num}
                  onClick={() => handleAddQuickSymbol(num)}
                  className="px-2 h-6 rounded-lg bg-slate-800 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-800 shrink-0" />

            {/* Math Symbols */}
            <div className="flex items-center gap-1 shrink-0">
              {QUICK_MATH.map((m) => (
                <button
                  key={m}
                  onClick={() => handleAddQuickSymbol(m)}
                  className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-xs flex items-center justify-center transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            WHITEBOARD CANVAS & LIVE MEDIA OVERLAYS
        ========================================================= */}
        <div className="flex-1 bg-white relative overflow-hidden select-none touch-none">
          
          {/* Main Drawing Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleStartDraw}
            onMouseMove={handleDraw}
            onMouseUp={handleStopDraw}
            onMouseLeave={handleStopDraw}
            onTouchStart={handleStartDraw}
            onTouchMove={handleDraw}
            onTouchEnd={handleStopDraw}
            className={`w-full h-full block ${
              tool === 'eraser' ? 'cursor-crosshair' : tool === 'text' ? 'cursor-text' : 'cursor-crosshair'
            }`}
          />

          {/* Interactive Text Box Placement with Live Spelling Suggestions */}
          {textPosition && (
            <div 
              className="absolute z-20 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 w-72 animate-in fade-in zoom-in-95"
              style={{
                left: `${Math.min(75, Math.max(5, textPosition.x * 100))}%`,
                top: `${Math.min(75, Math.max(5, textPosition.y * 100))}%`,
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-blue-400" />
                  टेक्स्ट / स्पेलिंग लिखें
                </span>
                <button
                  onClick={() => setTextPosition(null)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleSubmitText} className="mt-2 space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={textInput}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Type word, number or letter..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />

                {/* Live Spell Suggestions */}
                {spellSuggestions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-400 font-medium">सही स्पेलिंग सुझाव:</span>
                    <div className="flex flex-wrap gap-1">
                      {spellSuggestions.map((sugg, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setTextInput(sugg);
                            setSpellSuggestions([]);
                          }}
                          className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium border border-amber-500/30"
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">Enter दबाकर बोर्ड पर जोड़ें</span>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    जोड़ें (Place)
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================
              UPLOADED PHOTOS & VIDEOS (Live Synchronized on Whiteboard)
          ========================================================= */}
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="absolute z-10 bg-slate-900/95 border-2 border-indigo-500/80 rounded-2xl shadow-2xl overflow-hidden group transition-transform"
              style={{
                left: `${item.x * 100}%`,
                top: `${item.y * 100}%`,
                width: `${(item.width || 0.35) * 100}%`,
                maxWidth: '450px',
                minWidth: '220px',
              }}
            >
              {/* Media Header */}
              <div className="px-3 py-1.5 bg-slate-950/90 flex items-center justify-between border-b border-slate-800 text-white">
                <span className="text-xs font-semibold truncate flex items-center gap-1.5">
                  {item.type === 'video' ? <VideoIcon className="w-3.5 h-3.5 text-blue-400" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
                  {item.title}
                </span>
                <button
                  onClick={() => handleDeleteMedia(item.id)}
                  className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                  title="Remove from whiteboard"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Media Content */}
              <div className="relative bg-black flex items-center justify-center overflow-hidden">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto max-h-64 object-contain"
                  />
                ) : (
                  <div className="w-full relative">
                    <video
                      src={item.url}
                      controls
                      autoPlay={false}
                      muted={videoMuted[item.id || ''] ?? false}
                      className="w-full h-auto max-h-64 object-contain bg-black"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>

        {/* =========================================================
            UPLOAD PHOTO / VIDEO MODAL POPUP
        ========================================================= */}
        {showMediaModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  व्हाइटबोर्ड पर फ़ोटो या वीडियो जोड़ें (Add Media)
                </h4>
                <button
                  onClick={() => setShowMediaModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Media Type Tabs */}
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMediaType('image')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mediaType === 'image' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  फ़ोटो (Photo / Image)
                </button>
                <button
                  onClick={() => setMediaType('video')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mediaType === 'video' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  वीडियो (Video / Clip)
                </button>
              </div>

              {/* Option 1: File Upload */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 text-center space-y-2">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    {isUploading ? 'अपलोड हो रहा है...' : `अपने डिवाइस से ${mediaType === 'image' ? 'फ़ोटो' : 'वीडियो'} चुनें`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    PNG, JPG, WebP, MP4, WebM (Live Synced for all users)
                  </p>
                </label>
              </div>

              {/* Option 2: URL Link */}
              <form onSubmit={handleAddMediaUrl} className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    या वेब लिंक (Direct Image/Video URL) डालें:
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <LinkIcon className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg or video.mp4"
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Title / Description (वैकल्पिक)"
                    value={mediaTitleInput}
                    onChange={(e) => setMediaTitleInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    रद्द करें (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={!mediaUrlInput.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    बोर्ड पर जोड़ें (Add to Board)
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
