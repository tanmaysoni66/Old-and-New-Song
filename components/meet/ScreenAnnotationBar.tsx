'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Pointer, 
  Pen, 
  Highlighter, 
  Eraser, 
  Trash2, 
  X, 
  CircleDot 
} from 'lucide-react';

interface AnnotationPoint {
  x: number;
  y: number;
}

interface ScreenAnnotationBarProps {
  isSharing: boolean;
  onClose?: () => void;
}

export default function ScreenAnnotationBar({ isSharing, onClose }: ScreenAnnotationBarProps) {
  const [activeTool, setActiveTool] = useState<'laser' | 'pen' | 'highlighter' | 'none'>('laser');
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [penColor, setPenColor] = useState('#ef4444');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<AnnotationPoint | null>(null);

  // Resize canvas to match screen container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const handleResize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse move handler for Laser Pointer & Drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'laser') {
      setLaserPos({ x, y });
    } else {
      setLaserPos(null);
    }

    if (isDrawingRef.current && (activeTool === 'pen' || activeTool === 'highlighter')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !lastPointRef.current) return;

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);

      if (activeTool === 'highlighter') {
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)'; // Yellow translucent highlighter
        ctx.lineWidth = 18;
      } else {
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 3;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPointRef.current = { x, y };
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      isDrawingRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      lastPointRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div 
      className="absolute inset-0 z-30 pointer-events-auto select-none"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setLaserPos(null);
        handleMouseUp();
      }}
      style={{
        cursor: activeTool === 'laser' ? 'none' : activeTool !== 'none' ? 'crosshair' : 'default',
      }}
    >
      
      {/* Drawing Canvas Overlay */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Zoom Glowing Red Laser Pointer */}
      {activeTool === 'laser' && laserPos && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: laserPos.x, top: laserPos.y }}
        >
          {/* Intense center red core */}
          <div className="w-4 h-4 rounded-full bg-rose-600 shadow-[0_0_16px_6px_rgba(244,63,94,0.9)] animate-pulse" />
          {/* Fading ripple ring */}
          <div className="w-8 h-8 rounded-full border border-rose-400/80 -mt-6 -ml-2 animate-ping" />
        </div>
      )}

      {/* Floating Zoom Annotation Bar at Top Center */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-700/80 shadow-2xl flex items-center gap-2 text-xs text-white"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 hidden sm:inline">
          Zoom Annotate:
        </span>

        {/* 1. Laser Pointer */}
        <button
          onClick={() => setActiveTool(activeTool === 'laser' ? 'none' : 'laser')}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
            activeTool === 'laser'
              ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
          title="Zoom Laser Pointer"
        >
          <CircleDot className="w-3.5 h-3.5 text-rose-400" />
          <span>Laser</span>
        </button>

        {/* 2. Pen */}
        <button
          onClick={() => setActiveTool(activeTool === 'pen' ? 'none' : 'pen')}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
            activeTool === 'pen'
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
          title="Draw on Screen"
        >
          <Pen className="w-3.5 h-3.5 text-blue-400" />
          <span>Pen</span>
        </button>

        {/* 3. Highlighter */}
        <button
          onClick={() => setActiveTool(activeTool === 'highlighter' ? 'none' : 'highlighter')}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
            activeTool === 'highlighter'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
          title="Highlighter"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-400" />
          <span>Highlighter</span>
        </button>

        <div className="h-4 w-px bg-slate-700" />

        {/* Clear Drawings */}
        <button
          onClick={handleClear}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-full transition-colors"
          title="Clear all screen drawings"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}
