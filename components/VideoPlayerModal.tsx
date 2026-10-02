'use client';

import React from 'react';
import { X, Video, FileText, ExternalLink } from 'lucide-react';

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'mp4';
  subject: string;
  batchName: string;
  duration: string;
  pdfMaterialUrl?: string;
  description: string;
}

interface VideoPlayerModalProps {
  video: VideoData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayerModal({ video, isOpen, onClose }: VideoPlayerModalProps) {
  if (!isOpen || !video) return null;

  // Extract YouTube ID if valid
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('v=')) {
          videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0];
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(video.videoUrl);
  const isEmbeddable = video.videoType === 'youtube' && embedUrl.includes('embed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-900 text-indigo-300">
                {video.subject} • {video.batchName}
              </span>
              <h3 className="text-base font-bold line-clamp-1 mt-0.5">
                {video.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {isEmbeddable ? (
            <iframe
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <Video className="w-12 h-12 text-indigo-500 mx-auto opacity-70" />
              <p className="text-slate-300 text-sm font-medium">
                {video.title}
              </p>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                ओपन लेक्चर लिंक (Watch External Stream)
              </a>
            </div>
          )}
        </div>

        {/* Details & PDF Material Link */}
        <div className="p-6 bg-slate-950 text-slate-300 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <p className="text-xs text-slate-400 leading-relaxed">
              {video.description}
            </p>
            <p className="text-[11px] text-slate-500">
              अवधि (Duration): <span className="text-slate-300 font-medium">{video.duration}</span>
            </p>
          </div>

          {video.pdfMaterialUrl && (
            <a
              href={video.pdfMaterialUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              अटैच्ड PDF स्टडी नोट्स (Download Sheet)
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
