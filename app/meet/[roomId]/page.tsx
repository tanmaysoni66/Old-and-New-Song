'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Sparkles, 
  UserPlus, 
  Copy, 
  Check, 
  MonitorUp, 
  GraduationCap, 
  ArrowLeft,
  Settings,
  HelpCircle,
  Subtitles,
  Volume2,
  Users,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  addDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WebRTCMeetingManager } from '@/lib/webrtc';
import { soundManager } from '@/lib/audio-effects';
import VideoTile from '@/components/meet/VideoTile';
import ControlBar from '@/components/meet/ControlBar';
import InCallChat from '@/components/meet/InCallChat';
import PeoplePanel, { ParticipantInfo } from '@/components/meet/PeoplePanel';
import MeetingInfoPanel from '@/components/meet/MeetingInfoPanel';
import WhiteboardModal from '@/components/meet/WhiteboardModal';
import ActivitiesModal from '@/components/meet/ActivitiesModal';
import HostControlsModal, { HostPermissions } from '@/components/meet/HostControlsModal';
import LayoutSelectorModal, { MeetLayoutMode } from '@/components/meet/LayoutSelectorModal';
import BackgroundsModal from '@/components/meet/BackgroundsModal';
import AttendanceModal from '@/components/meet/AttendanceModal';

interface FloatingReaction {
  id: string;
  emoji: string;
  left: number;
}

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = (params?.roomId as string) || 'demo-meet-room';

  // Lobby vs In-Call State
  const [hasJoined, setHasJoined] = useState(false);
  const [displayName, setDisplayName] = useState('Tanmay');

  // Media & Device State
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [captionsActive, setCaptionsActive] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [filterEffect, setFilterEffect] = useState('none');
  const [audioLevel, setAudioLevel] = useState(0);

  // Active side panel: none | info | people | chat | activities
  const [activeSidePanel, setActiveSidePanel] = useState<'none' | 'info' | 'people' | 'chat' | 'activities'>('none');
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [pinnedPeerId, setPinnedPeerId] = useState<string | null>(null);

  // Advanced Google Meet Flagship Modals State
  const [hostControlsOpen, setHostControlsOpen] = useState(false);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [backgroundsModalOpen, setBackgroundsModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  // Layout mode & tiles
  const [layoutMode, setLayoutMode] = useState<MeetLayoutMode>('auto');
  const [maxTiles, setMaxTiles] = useState(6);

  // Host Permissions
  const [hostPermissions, setHostPermissions] = useState<HostPermissions>({
    allowScreenShare: true,
    allowChat: true,
    allowMic: true,
    allowVideo: true,
    lockMeeting: false,
  });

  // Streams & WebRTC
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [isSpeakingMe, setIsSpeakingMe] = useState(false);

  // Refs
  const webrtcManagerRef = useRef<WebRTCMeetingManager | null>(null);
  const myPeerIdRef = useRef<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize unique peer ID on client
  useEffect(() => {
    myPeerIdRef.current = 'peer_' + Math.random().toString(36).substring(2, 9);
  }, []);

  // Initialize Pre-call Lobby Camera & Mic stream
  useEffect(() => {
    let active = true;

    async function setupLobbyMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (!active) return;
        setLocalStream(stream);

        // Setup Audio Analyser for live volume meter
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkAudio = () => {
              if (!active) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;
              setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
              setIsSpeakingMe(average > 15);
              requestAnimationFrame(checkAudio);
            };
            checkAudio();
          }
        } catch (e) {
          console.warn('Audio analyser error', e);
        }

      } catch (err) {
        console.warn('Lobby camera/mic access denied, creating dummy stream', err);
      }
    }

    setupLobbyMedia();

    return () => {
      active = false;
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Listen for meeting room participants in Firestore
  useEffect(() => {
    if (!roomId) return;
    const participantsRef = collection(db, 'meet_rooms', roomId, 'participants');

    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const list: ParticipantInfo[] = [];
      snapshot.forEach((d) => {
        list.push({ peerId: d.id, ...d.data() } as ParticipantInfo);
      });
      setParticipants(list);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Speech Recognition setup for Live Captions (CC)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interim += event.results[i][0].transcript;
        }
        setCaptionText(interim);
      };

      recognizer.onerror = () => {};
      speechRecognitionRef.current = recognizer;
    }
  }, []);

  // Toggle Live Captions
  const handleToggleCaptions = () => {
    if (!speechRecognitionRef.current) {
      alert('Live Speech Recognition is not supported on this browser.');
      return;
    }
    if (captionsActive) {
      speechRecognitionRef.current.stop();
      setCaptionsActive(false);
      setCaptionText('');
    } else {
      speechRecognitionRef.current.start();
      setCaptionsActive(true);
      setCaptionText('Listening for speech...');
    }
  };

  // Join the Meeting Room
  const handleJoinMeeting = async (presentImmediately: boolean = false) => {
    try {
      soundManager.playJoinSound();

      // Setup WebRTC manager
      const manager = new WebRTCMeetingManager(roomId, myPeerIdRef.current, displayName);
      manager.localStream = localStream;
      manager.onRemoteStreamUpdated = (peerId, stream) => {
        setRemoteStreams(prev => ({ ...prev, [peerId]: stream }));
      };
      manager.onRemoteStreamRemoved = (peerId) => {
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      };

      manager.startListeningForSignals();
      webrtcManagerRef.current = manager;

      // Register participant in Firestore
      const myDocRef = doc(db, 'meet_rooms', roomId, 'participants', myPeerIdRef.current);
      await setDoc(myDocRef, {
        name: displayName.trim() || 'Guest',
        micMuted: micMuted,
        videoOff: videoOff,
        handRaised: false,
        isHost: participants.length === 0,
        joinedAt: Date.now(),
      });

      // Connect to existing participants
      participants.forEach((p) => {
        if (p.peerId !== myPeerIdRef.current) {
          manager.connectToPeer(p.peerId);
        }
      });

      setHasJoined(true);

      if (presentImmediately) {
        setTimeout(() => handleToggleScreenShare(), 500);
      }
    } catch (err) {
      console.error('Error joining meeting:', err);
    }
  };

  // Leave Call
  const handleLeaveCall = async () => {
    soundManager.playLeaveSound();
    try {
      if (myPeerIdRef.current) {
        const myDocRef = doc(db, 'meet_rooms', roomId, 'participants', myPeerIdRef.current);
        await deleteDoc(myDocRef).catch(() => {});
      }
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
    } finally {
      router.push('/');
    }
  };

  // Toggle Microphone
  const handleToggleMic = () => {
    const nextMuted = !micMuted;
    setMicMuted(nextMuted);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }
    if (hasJoined && myPeerIdRef.current) {
      const myDocRef = doc(db, 'meet_rooms', roomId, 'participants', myPeerIdRef.current);
      setDoc(myDocRef, { micMuted: nextMuted }, { merge: true }).catch(() => {});
    }
  };

  // Toggle Video Camera
  const handleToggleVideo = () => {
    const nextVideoOff = !videoOff;
    setVideoOff(nextVideoOff);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !nextVideoOff;
      });
    }
    if (hasJoined && myPeerIdRef.current) {
      const myDocRef = doc(db, 'meet_rooms', roomId, 'participants', myPeerIdRef.current);
      setDoc(myDocRef, { videoOff: nextVideoOff }, { merge: true }).catch(() => {});
    }
  };

  // Toggle Hand Raise
  const handleToggleHand = () => {
    const nextHand = !handRaised;
    setHandRaised(nextHand);
    if (nextHand) {
      soundManager.playHandRaiseSound();
    }
    if (hasJoined && myPeerIdRef.current) {
      const myDocRef = doc(db, 'meet_rooms', roomId, 'participants', myPeerIdRef.current);
      setDoc(myDocRef, { handRaised: nextHand }, { merge: true }).catch(() => {});
    }
  };

  // Toggle Screen Sharing
  const handleToggleScreenShare = async () => {
    if (isSharingScreen) {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.stopScreenShare();
      }
      setScreenStream(null);
      setIsSharingScreen(false);
    } else {
      try {
        if (webrtcManagerRef.current) {
          const stream = await webrtcManagerRef.current.startScreenShare();
          setScreenStream(stream);
          setIsSharingScreen(true);

          stream.getVideoTracks()[0].onended = () => {
            setScreenStream(null);
            setIsSharingScreen(false);
          };
        }
      } catch (e) {
        console.warn('Screen share canceled or denied', e);
      }
    }
  };

  // Picture in Picture (PiP)
  const handleTogglePiP = async () => {
    try {
      const videos = document.querySelectorAll('video');
      const targetVideo = videos[0];
      if (targetVideo && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await targetVideo.requestPictureInPicture();
        }
      } else {
        alert('Picture-in-Picture is not supported in this browser.');
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  // Mute All Participants
  const handleMuteAll = () => {
    participants.forEach((p) => {
      if (p.peerId !== myPeerIdRef.current) {
        const docRef = doc(db, 'meet_rooms', roomId, 'participants', p.peerId);
        setDoc(docRef, { micMuted: true }, { merge: true }).catch(() => {});
      }
    });
    alert('All participants have been muted by the host.');
  };

  // Floating Reactions
  const handleSendReaction = (emoji: string) => {
    const reaction: FloatingReaction = {
      id: Math.random().toString(),
      emoji,
      left: Math.floor(Math.random() * 60) + 20,
    };
    setFloatingReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
  };

  // Meeting Screen Recording (MediaRecorder)
  const handleToggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const streamToRecord = screenStream || localStream;
        if (!streamToRecord) return;

        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(streamToRecord, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Google-Meet-Recording-${roomId}.webm`;
          a.click();
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        alert('Could not start recording: ' + err);
      }
    }
  };

  // Copy Meeting Join Link
  const handleCopyJoiningInfo = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/meet/${roomId}` : `https://meet.google.com/${roomId}`;
    navigator.clipboard.writeText(url);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2500);
  };

  // Spawn Simulated Colleague Peer
  const handleAddTestPeer = async () => {
    const peerId = 'peer_colleague_' + Math.random().toString(36).substring(2, 6);
    const names = [
      'Dr. Sharma (Senior Faculty)',
      'Priya Verma (Host)',
      'Rahul Mehta (IIT Bombay)',
      'Dr. Sunita Mehta (Biology)',
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const peerDocRef = doc(db, 'meet_rooms', roomId, 'participants', peerId);
    await setDoc(peerDocRef, {
      name: randomName,
      micMuted: false,
      videoOff: false,
      handRaised: false,
      isHost: false,
      joinedAt: Date.now(),
    });

    const chatRef = collection(db, 'meet_rooms', roomId, 'messages');
    await addDoc(chatRef, {
      senderName: randomName,
      senderPeerId: peerId,
      text: `Hello everyone! Joining the live session for ${roomId}. Can you see the presentation?`,
      createdAt: Date.now(),
    });
  };

  // All participants including "Me"
  const isMeHost = participants.length === 0 || participants.find(p => p.peerId === myPeerIdRef.current)?.isHost === true;

  const allParticipantsList: ParticipantInfo[] = [
    {
      peerId: myPeerIdRef.current,
      name: displayName,
      isHost: isMeHost,
      micMuted,
      videoOff,
      handRaised,
      isMe: true,
    },
    ...participants.filter(p => p.peerId !== myPeerIdRef.current)
  ];

  // Pinned or spotlight participant
  const spotlightParticipant = pinnedPeerId 
    ? allParticipantsList.find(p => p.peerId === pinnedPeerId) || allParticipantsList[0]
    : allParticipantsList[0];

  // =========================================================================
  // VIEW 1: PRE-CALL LOBBY / GREEN ROOM
  // =========================================================================
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
        
        {/* Top Minimal Bar */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-slate-900">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            <span className="text-sm font-semibold text-slate-300 group-hover:text-white">
              Google Meet Home
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Meeting ID: {roomId}
            </span>
          </div>
        </header>

        {/* Lobby Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          
          {/* Left: Camera Preview Window */}
          <div className="w-full max-w-xl space-y-4">
            
            <div className="relative aspect-video rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
              
              {/* Live Local Webcam Video */}
              <video
                ref={(ref) => {
                  if (ref && localStream) ref.srcObject = localStream;
                }}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-all ${
                  videoOff ? 'hidden' : 'block'
                }`}
                style={{ filter: filterEffect }}
              />

              {/* Avatar when Camera Off */}
              {videoOff && (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-4xl flex items-center justify-center shadow-2xl ring-4 ring-white/10">
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Camera is off
                  </span>
                </div>
              )}

              {/* Live Audio Level Meter Waveform */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <Volume2 className="w-3.5 h-3.5 text-slate-300" />
                <div className="flex items-center gap-0.5">
                  <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, audioLevel * 0.16)}px` }} />
                  <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, audioLevel * 0.24)}px` }} />
                  <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, audioLevel * 0.12)}px` }} />
                </div>
              </div>

              {/* Floating Camera & Mic Control Overlays */}
              <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-4">
                <button
                  onClick={handleToggleMic}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    micMuted
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg'
                      : 'bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20'
                  }`}
                  title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleToggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    videoOff
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg'
                      : 'bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20'
                  }`}
                  title={videoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </div>

            </div>

            {/* Virtual Background Filter Effects */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Visual Effects:
              </span>
              <button
                onClick={() => setBackgroundsModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold hover:bg-indigo-600/50"
              >
                Choose Background
              </button>
            </div>

          </div>

          {/* Right: Join Info & Display Name Controls */}
          <div className="w-full max-w-sm space-y-6 text-center lg:text-left">
            
            <div>
              <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                Ready to join?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {participants.length === 0
                  ? 'No one else is here'
                  : `${participants.length} person${participants.length > 1 ? 's' : ''} in this call`}
              </p>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-300">
                Your Name (आपका नाम):
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Joining Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleJoinMeeting(false)}
                className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                Join now (अभी जुड़ें)
              </button>

              <button
                onClick={() => handleJoinMeeting(true)}
                className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center justify-center gap-2 transition-colors"
              >
                <MonitorUp className="w-4 h-4 text-blue-400" />
                Present (स्क्रीन शेयर करके जुड़ें)
              </button>
            </div>

            {/* Meeting Link Share Chip */}
            <div className="pt-4 border-t border-slate-900">
              <button
                onClick={handleCopyJoiningInfo}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white text-xs flex items-center justify-between border border-slate-800 transition-colors"
              >
                <span className="truncate font-mono text-[11px]">meet.google.com/{roomId}</span>
                <span className="flex items-center gap-1 font-semibold text-indigo-400 shrink-0">
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </span>
              </button>
            </div>

          </div>

        </main>

        <BackgroundsModal
          isOpen={backgroundsModalOpen}
          onClose={() => setBackgroundsModalOpen(false)}
          currentFilter={filterEffect}
          onSelectFilter={(f) => setFilterEffect(f)}
        />

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: IN-CALL GOOGLE MEET INTERFACE
  // =========================================================================

  const visibleParticipants = allParticipantsList.slice(0, maxTiles);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* Toast Notification for Link Copy */}
      {showCopiedToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Joining info copied to clipboard</span>
        </div>
      )}

      {/* Floating Animated Emojis */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-20 text-3xl sm:text-4xl animate-float-up"
            style={{ left: `${r.left}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Main Calling Stage & Side Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Center Video Stage */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden relative">
          
          {/* Top Stage Bar: Meeting Code & Add Colleague Simulator */}
          <div className="h-8 flex items-center justify-between text-xs px-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 font-semibold">{roomId}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{allParticipantsList.length} in call</span>
              {layoutMode !== 'auto' && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-blue-400 capitalize">
                  Layout: {layoutMode}
                </span>
              )}
            </div>

            {/* Quick Test Peer Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddTestPeer}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                title="Add a colleague simulation into this call to test multi-person grid"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ टेस्ट प्रतिभागी जोड़ें (Test Peer)</span>
              </button>
            </div>
          </div>

          {/* SCREEN SHARING OR SPOTLIGHT MODE */}
          {(isSharingScreen && screenStream) || layoutMode === 'spotlight' ? (
            <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden">
              {/* Spotlight Center */}
              <div className="flex-1 rounded-2xl bg-black border border-slate-800 overflow-hidden relative flex items-center justify-center">
                {isSharingScreen && screenStream ? (
                  <>
                    <video
                      ref={(ref) => {
                        if (ref) ref.srcObject = screenStream;
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2">
                      <MonitorUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>You are presenting to everyone</span>
                    </div>
                  </>
                ) : (
                  <VideoTile
                    stream={spotlightParticipant.isMe ? localStream : (remoteStreams[spotlightParticipant.peerId] || null)}
                    name={spotlightParticipant.name}
                    isMe={spotlightParticipant.isMe}
                    micMuted={spotlightParticipant.micMuted}
                    videoOff={spotlightParticipant.videoOff}
                    handRaised={spotlightParticipant.handRaised}
                    isSpeaking={spotlightParticipant.isMe ? isSpeakingMe : false}
                    isPinned={true}
                    onTogglePin={() => setPinnedPeerId(null)}
                  />
                )}
              </div>

              {/* Sidebar Video Tiles */}
              <div className="w-full lg:w-64 h-32 lg:h-full overflow-x-auto lg:overflow-y-auto flex lg:flex-col gap-3 shrink-0">
                {allParticipantsList.map((p) => {
                  const stream = p.isMe ? localStream : (remoteStreams[p.peerId] || null);
                  return (
                    <div key={p.peerId} className="w-48 lg:w-full h-full lg:h-40 shrink-0">
                      <VideoTile
                        stream={stream}
                        name={p.name}
                        isMe={p.isMe}
                        micMuted={p.micMuted}
                        videoOff={p.videoOff}
                        handRaised={p.handRaised}
                        isSpeaking={p.isMe ? isSpeakingMe : false}
                        onTogglePin={() => setPinnedPeerId(p.peerId)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : layoutMode === 'sidebar' && allParticipantsList.length > 1 ? (
            /* SIDEBAR LAYOUT */
            <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden">
              <div className="flex-1 rounded-2xl overflow-hidden">
                <VideoTile
                  stream={allParticipantsList[0].isMe ? localStream : (remoteStreams[allParticipantsList[0].peerId] || null)}
                  name={allParticipantsList[0].name}
                  isMe={allParticipantsList[0].isMe}
                  micMuted={allParticipantsList[0].micMuted}
                  videoOff={allParticipantsList[0].videoOff}
                  handRaised={allParticipantsList[0].handRaised}
                  isSpeaking={allParticipantsList[0].isMe ? isSpeakingMe : false}
                />
              </div>
              <div className="w-full lg:w-64 h-32 lg:h-full overflow-x-auto lg:overflow-y-auto flex lg:flex-col gap-3 shrink-0">
                {allParticipantsList.slice(1).map((p) => {
                  const stream = p.isMe ? localStream : (remoteStreams[p.peerId] || null);
                  return (
                    <div key={p.peerId} className="w-48 lg:w-full h-full lg:h-40 shrink-0">
                      <VideoTile
                        stream={stream}
                        name={p.name}
                        isMe={p.isMe}
                        micMuted={p.micMuted}
                        videoOff={p.videoOff}
                        handRaised={p.handRaised}
                        isSpeaking={p.isMe ? isSpeakingMe : false}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TILED / AUTO GRID */
            <div className="flex-1 w-full h-full overflow-hidden flex items-center justify-center">
              <div 
                className={`w-full h-full max-h-[82vh] grid gap-3 sm:gap-4 transition-all duration-300 ${
                  visibleParticipants.length === 1
                    ? 'grid-cols-1 max-w-4xl'
                    : visibleParticipants.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl'
                    : visibleParticipants.length <= 4
                    ? 'grid-cols-2 max-w-5xl'
                    : 'grid-cols-2 lg:grid-cols-3 max-w-6xl'
                }`}
              >
                {visibleParticipants.map((p) => {
                  const stream = p.isMe ? localStream : (remoteStreams[p.peerId] || null);
                  return (
                    <VideoTile
                      key={p.peerId}
                      stream={stream}
                      name={p.name}
                      isMe={p.isMe}
                      micMuted={p.micMuted}
                      videoOff={p.videoOff}
                      handRaised={p.handRaised}
                      isSpeaking={p.isMe ? isSpeakingMe : false}
                      filterEffect={p.isMe ? filterEffect : 'none'}
                      onTogglePin={() => setPinnedPeerId(p.peerId)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Captions (CC) Overlay Banner */}
          {captionsActive && (
            <div className="absolute bottom-4 inset-x-6 z-30 pointer-events-none flex justify-center">
              <div className="px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm font-medium max-w-2xl text-center shadow-2xl">
                <span className="text-blue-400 font-bold mr-2">{displayName}:</span>
                <span>{captionText || 'Listening for speech...'}</span>
              </div>
            </div>
          )}

        </div>

        {/* Side Panels: Chat | People | Info | Activities */}
        <InCallChat
          roomId={roomId}
          myPeerId={myPeerIdRef.current}
          myName={displayName}
          isOpen={activeSidePanel === 'chat'}
          onClose={() => setActiveSidePanel('none')}
        />

        <PeoplePanel
          participants={allParticipantsList}
          myPeerId={myPeerIdRef.current}
          isOpen={activeSidePanel === 'people'}
          onClose={() => setActiveSidePanel('none')}
          onCopyLink={handleCopyJoiningInfo}
          onMuteAll={handleMuteAll}
        />

        <MeetingInfoPanel
          roomId={roomId}
          isOpen={activeSidePanel === 'info'}
          onClose={() => setActiveSidePanel('none')}
          onCopyLink={handleCopyJoiningInfo}
          copied={showCopiedToast}
        />

        <ActivitiesModal
          roomId={roomId}
          myPeerId={myPeerIdRef.current}
          myName={displayName}
          isHost={isMeHost}
          isOpen={activeSidePanel === 'activities'}
          onClose={() => setActiveSidePanel('none')}
        />

      </div>

      {/* Bottom Floating Control Dock */}
      <ControlBar
        roomId={roomId}
        isHost={isMeHost}
        micMuted={micMuted}
        videoOff={videoOff}
        handRaised={handRaised}
        isSharingScreen={isSharingScreen}
        captionsActive={captionsActive}
        isRecording={isRecording}
        participantCount={allParticipantsList.length}
        activeSidePanel={activeSidePanel}
        onToggleMic={handleToggleMic}
        onToggleVideo={handleToggleVideo}
        onToggleHand={handleToggleHand}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleCaptions={handleToggleCaptions}
        onToggleRecording={handleToggleRecording}
        onSendReaction={handleSendReaction}
        onOpenWhiteboard={() => setWhiteboardOpen(true)}
        onOpenBackgrounds={() => setBackgroundsModalOpen(true)}
        onOpenLayoutModal={() => setLayoutModalOpen(true)}
        onOpenHostControls={() => setHostControlsOpen(true)}
        onOpenAttendance={() => setAttendanceModalOpen(true)}
        onTogglePiP={handleTogglePiP}
        onTogglePanel={(p) => setActiveSidePanel(prev => prev === p ? 'none' : p)}
        onLeaveCall={handleLeaveCall}
        onOpenSettings={() => setActiveSidePanel('info')}
      />

      {/* Realtime Collaborative Whiteboard (Jamboard) */}
      <WhiteboardModal
        roomId={roomId}
        isOpen={whiteboardOpen}
        onClose={() => setWhiteboardOpen(false)}
      />

      {/* Host Controls Modal */}
      <HostControlsModal
        isOpen={hostControlsOpen}
        onClose={() => setHostControlsOpen(false)}
        permissions={hostPermissions}
        onChangePermissions={(p) => setHostPermissions(p)}
        onMuteAll={handleMuteAll}
      />

      {/* Change Layout Modal */}
      <LayoutSelectorModal
        isOpen={layoutModalOpen}
        onClose={() => setLayoutModalOpen(false)}
        layoutMode={layoutMode}
        maxTiles={maxTiles}
        onChangeLayout={(mode) => setLayoutMode(mode)}
        onChangeMaxTiles={(tiles) => setMaxTiles(tiles)}
      />

      {/* Backgrounds & Visual Effects Modal */}
      <BackgroundsModal
        isOpen={backgroundsModalOpen}
        onClose={() => setBackgroundsModalOpen(false)}
        currentFilter={filterEffect}
        onSelectFilter={(f) => setFilterEffect(f)}
      />

      {/* Attendance Report Modal */}
      <AttendanceModal
        roomId={roomId}
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        participants={allParticipantsList}
      />

    </div>
  );
}
