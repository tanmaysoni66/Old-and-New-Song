'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  PenTool, 
  Eraser, 
  Download, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  getDocs 
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
  createdAt: number;
}

interface WhiteboardModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhiteboardModal({ roomId, isOpen, onClose }: WhiteboardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#2563eb');
  const [currentWidth, setCurrentWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const currentPointsRef = useRef<StrokePoint[]>([]);

  // Remote strokes state
  const strokesRef = useRef<WhiteboardStroke[]>([]);

  // Listen for remote strokes in real time
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const boardRef = collection(db, 'meet_rooms', roomId, 'whiteboard');
    const unsubscribe = onSnapshot(
      boardRef,
      (snapshot) => {
        const strokes: WhiteboardStroke[] = [];
        snapshot.forEach((doc) => {
          strokes.push({ id: doc.id, ...doc.data() } as WhiteboardStroke);
        });
        strokes.sort((a, b) => a.createdAt - b.createdAt);
        strokesRef.current = strokes;
        redrawCanvas();
      },
      (err) => {
        console.warn('Whiteboard listener notice:', err);
      }
    );

    return () => unsubscribe();
  }, [isOpen, roomId]);

  // Adjust canvas size to window/container
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    redrawCanvas();
  }, [isOpen]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokesRef.current.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * 2;
      ctx.moveTo(stroke.points[0].x * canvas.width, stroke.points[0].y * canvas.height);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x * canvas.width, stroke.points[i].y * canvas.height);
      }
      ctx.stroke();
    });
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const p = getCanvasCoords(e);
    currentPointsRef.current = [p];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const p = getCanvasCoords(e);
    currentPointsRef.current.push(p);

    // Live preview on local canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = currentPointsRef.current;
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = (tool === 'eraser' ? 24 : currentWidth) * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(points[points.length - 2].x * canvas.width, points[points.length - 2].y * canvas.height);
    ctx.lineTo(points[points.length - 1].x * canvas.width, points[points.length - 1].y * canvas.height);
    ctx.stroke();
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPointsRef.current.length > 1) {
      const strokeData: WhiteboardStroke = {
        points: currentPointsRef.current,
        color: tool === 'eraser' ? '#ffffff' : currentColor,
        width: tool === 'eraser' ? 24 : currentWidth,
        createdAt: Date.now(),
      };

      try {
        const boardRef = collection(db, 'meet_rooms', roomId, 'whiteboard');
        await addDoc(boardRef, strokeData);
      } catch (err) {
        console.warn('Failed to sync stroke:', err);
      }
    }
    currentPointsRef.current = [];
  };

  const handleClearBoard = async () => {
    if (!confirm('क्या आप व्हाइटबोर्ड साफ़ करना चाहते हैं? (Clear entire whiteboard)')) return;
    try {
      const boardRef = collection(db, 'meet_rooms', roomId, 'whiteboard');
      const snap = await getDocs(boardRef);
      snap.forEach(async (d) => {
        await deleteDoc(d.ref);
      });
      strokesRef.current = [];
      redrawCanvas();
    } catch (err) {
      console.warn('Clear error:', err);
    }
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${roomId}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-hidden">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                Google Meet Whiteboard (Jamboard)
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Live Synced
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                मीटिंग में उपस्थित सभी सदस्य इस बोर्ड पर एक साथ ड्रॉ और नोट कर सकते हैं।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadImage}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Download Snapshot (PNG)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearBoard}
              className="p-2 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Clear Whiteboard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                tool === 'pen'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              पेन (Pen)
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                tool === 'eraser'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              इरेज़र (Eraser)
            </button>

            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              {['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#000000'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrentColor(c);
                    setTool('pen');
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    currentColor === c && tool === 'pen'
                      ? 'scale-110 border-slate-800 dark:border-white shadow-sm'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width Slider */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>साइज:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={currentWidth}
              onChange={(e) => setCurrentWidth(Number(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="font-mono text-[11px] w-4">{currentWidth}</span>
          </div>

        </div>

        {/* Whiteboard Canvas Area */}
        <div className="flex-1 bg-white relative overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full block"
          />
        </div>

      </div>
    </div>
  );
}
