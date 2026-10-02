'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  Video, 
  Volume2, 
  Check, 
  Settings, 
  Sliders, 
  Sparkles, 
  Play, 
  RotateCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { soundManager } from '@/lib/audio-effects';

interface MediaDeviceItem {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  localStream: MediaStream | null;
  selectedMicId: string;
  selectedCameraId: string;
  selectedSpeakerId: string;
  onChangeMic: (deviceId: string) => void;
  onChangeCamera: (deviceId: string) => void;
  onChangeSpeaker: (deviceId: string) => void;
  onRequestPermissions: () => void;
  permissionState: 'prompt' | 'granted' | 'denied';
}

export default function DeviceSettingsModal({
  isOpen,
  onClose,
  localStream,
  selectedMicId,
  selectedCameraId,
  selectedSpeakerId,
  onChangeMic,
  onChangeCamera,
  onChangeSpeaker,
  onRequestPermissions,
  permissionState,
}: DeviceSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'general'>('audio');
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceItem[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceItem[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceItem[]>([]);
  const [testAudioLevel, setTestAudioLevel] = useState(0);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);
  const [videoResolution, setVideoResolution] = useState<'720p' | '360p' | 'auto'>('720p');

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Enumerate devices when open
  useEffect(() => {
    if (!isOpen) return;

    async function loadDevices() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const mics = devices.filter(d => d.kind === 'audioinput').map(d => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`,
          kind: d.kind,
        }));
        const cams = devices.filter(d => d.kind === 'videoinput').map(d => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${d.deviceId.slice(0, 5)}`,
          kind: d.kind,
        }));
        const speakers = devices.filter(d => d.kind === 'audiooutput').map(d => ({
          deviceId: d.deviceId,
          label: d.label || `Speaker ${d.deviceId.slice(0, 5)}`,
          kind: d.kind,
        }));

        setAudioInputDevices(mics);
        setVideoInputDevices(cams);
        setAudioOutputDevices(speakers);
      } catch (err) {
        console.warn('Error loading media devices:', err);
      }
    }

    loadDevices();
  }, [isOpen, permissionState]);

  // Attach local stream to video preview ref
  useEffect(() => {
    if (isOpen && activeTab === 'video' && videoPreviewRef.current && localStream) {
      videoPreviewRef.current.srcObject = localStream;
    }
  }, [isOpen, activeTab, localStream]);

  // Audio level meter listener for audio tab
  useEffect(() => {
    if (!isOpen || !localStream || localStream.getAudioTracks().length === 0) return;
    let active = true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        const source = ctx.createMediaStreamSource(localStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const check = () => {
          if (!active) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setTestAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          requestAnimationFrame(check);
        };
        check();

        return () => {
          active = false;
          ctx.close().catch(() => {});
        };
      }
    } catch (e) {
      console.warn('Audio meter error', e);
    }
  }, [isOpen, localStream]);

  const handleTestSpeakerSound = () => {
    setIsPlayingTestSound(true);
    soundManager.playTimerChime();
    setTimeout(() => setIsPlayingTestSound(false), 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Audio & Video Settings</h3>
              <p className="text-[11px] text-slate-400">Select microphone, camera, speakers & permissions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Banner if not granted */}
        {permissionState !== 'granted' && (
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Camera or Microphone access is needed for meetings.</span>
            </div>
            <button
              onClick={onRequestPermissions}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
            >
              Allow Access
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'audio' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Audio (Mic & Speaker)</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'video' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video (Camera & Quality)</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'general' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>General</span>
          </button>
        </div>

        {/* Tab 1: Audio Settings */}
        {activeTab === 'audio' && (
          <div className="space-y-4 text-xs">
            {/* Microphone Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-blue-400" />
                <span>Microphone (माइक चुनें)</span>
              </label>
              <select
                value={selectedMicId}
                onChange={(e) => onChangeMic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {audioInputDevices.length > 0 ? (
                  audioInputDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))
                ) : (
                  <option value="default">Default System Microphone</option>
                )}
              </select>
            </div>

            {/* Live Mic Level Test Bar */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Mic Input Level (आवाज का स्तर):</span>
                <span className="font-mono text-emerald-400 font-bold">{testAudioLevel}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-75"
                  style={{ width: `${testAudioLevel}%` }}
                />
              </div>
            </div>

            {/* Speakers Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Speakers / Audio Output (स्पीकर)</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedSpeakerId}
                  onChange={(e) => onChangeSpeaker(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {audioOutputDevices.length > 0 ? (
                    audioOutputDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label}
                      </option>
                    ))
                  ) : (
                    <option value="default">Default System Speaker</option>
                  )}
                </select>

                <button
                  type="button"
                  onClick={handleTestSpeakerSound}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0"
                  title="Play speaker test chime"
                >
                  <Play className={`w-3.5 h-3.5 ${isPlayingTestSound ? 'text-emerald-400 animate-spin' : 'text-blue-400'}`} />
                  <span>Test Audio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Video Settings */}
        {activeTab === 'video' && (
          <div className="space-y-4 text-xs">
            {/* Camera Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-400" />
                <span>Camera (कैमरा चुनें)</span>
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => onChangeCamera(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {videoInputDevices.length > 0 ? (
                  videoInputDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))
                ) : (
                  <option value="default">Default Integrated Webcam</option>
                )}
              </select>
            </div>

            {/* Video Resolution */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Send Resolution (अधिकतम वीडियो क्वालिटी)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '720p', label: 'High Definition (720p)' },
                  { id: '360p', label: 'Standard (360p)' },
                  { id: 'auto', label: 'Auto (Bandwidth Adapt)' },
                ].map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setVideoResolution(res.id as any)}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                      videoResolution === res.id
                        ? 'bg-blue-600/30 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {res.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Preview */}
            <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] backdrop-blur-md">
                Camera Live Preview ({videoResolution})
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: General & Permissions */}
        {activeTab === 'general' && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Browser Permissions (ब्राउज़र अनुमतियाँ)</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Google Meet and Zoom require camera, microphone, and screen recording permissions. If your camera is not showing up, click below to re-trigger the browser permission dialog.
              </p>
              <button
                type="button"
                onClick={onRequestPermissions}
                className="mt-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow"
              >
                Request Camera & Mic Permissions
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
