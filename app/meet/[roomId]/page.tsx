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
  ArrowLeft,
  Settings,
  HelpCircle,
  Subtitles,
  Volume2,
  Users,
  ShieldCheck, 
  Plus,
  DoorClosed,
  Star,
  Clock,
  Bot,
  AlertTriangle,
  UserCheck,
  UserX,
  Lock,
  Calendar,
  XCircle
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
import PeoplePanel, { ParticipantInfo, WaitingParticipant } from '@/components/meet/PeoplePanel';
import MeetingInfoPanel from '@/components/meet/MeetingInfoPanel';
import WhiteboardModal from '@/components/meet/WhiteboardModal';
import ActivitiesModal from '@/components/meet/ActivitiesModal';
import HostControlsModal, { HostPermissions } from '@/components/meet/HostControlsModal';
import LayoutSelectorModal, { MeetLayoutMode } from '@/components/meet/LayoutSelectorModal';
import BackgroundsModal from '@/components/meet/BackgroundsModal';
import AttendanceModal from '@/components/meet/AttendanceModal';
import AICompanionModal, { TranscriptItem } from '@/components/meet/AICompanionModal';
import SecurityShieldModal, { SecuritySettings } from '@/components/meet/SecurityShieldModal';
import MeetingAgendaTimer from '@/components/meet/MeetingAgendaTimer';
import ScheduleMeetingModal from '@/components/meet/ScheduleMeetingModal';
import DeviceSettingsModal from '@/components/meet/DeviceSettingsModal';
import ScreenAnnotationBar from '@/components/meet/ScreenAnnotationBar';
import { createSimulatedPeerStream } from '@/lib/mock-stream';

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
  const [isWaitingInLobby, setIsWaitingInLobby] = useState(false);
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

  // Advanced Google Meet & Zoom Modals
  const [hostControlsOpen, setHostControlsOpen] = useState(false);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [backgroundsModalOpen, setBackgroundsModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [aiCompanionOpen, setAiCompanionOpen] = useState(false);
  const [securityShieldOpen, setSecurityShieldOpen] = useState(false);
  const [agendaTimerOpen, setAgendaTimerOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [selectedMicId, setSelectedMicId] = useState<string>('default');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('default');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('default');
  const [claimedHost, setClaimedHost] = useState(false);

  // Spotlight for Everyone (Zoom & Google Meet Flagship)
  const [spotlightedPeerId, setSpotlightedPeerId] = useState<string | null>(null);

  // Non-verbal Feedback (Zoom Flagship)
  const [myFeedback, setMyFeedback] = useState<string | null>(null);
  const [feedbackCounts, setFeedbackCounts] = useState({
    yes: 0,
    no: 0,
    slower: 0,
    faster: 0,
    coffee: 0,
  });

  // Waiting Room & Knocking List (Zoom Waiting Room & Google Meet Knock)
  const [waitingList, setWaitingList] = useState<WaitingParticipant[]>([]);
  const [topKnockNotice, setTopKnockNotice] = useState<WaitingParticipant | null>(null);
  const [myKnockStatus, setMyKnockStatus] = useState<'idle' | 'pending' | 'admitted' | 'denied'>('idle');
  const [deniedCountdown, setDeniedCountdown] = useState(3);

  // AI Meeting Transcript Log
  const [transcript, setTranscript] = useState<TranscriptItem[]>([
    { id: 'init-1', speaker: 'Host', text: 'Welcome to this live video conference session.', time: '10:00 AM' }
  ]);

  // Visual & Studio Effects Settings
  const [lowLightBoost, setLowLightBoost] = useState(false);
  const [touchUpLevel, setTouchUpLevel] = useState(40);
  const [noiseSuppression, setNoiseSuppression] = useState<'auto' | 'high' | 'original'>('auto');

  // Layout mode & tiles
  const [layoutMode, setLayoutMode] = useState<MeetLayoutMode>('auto');
  const [maxTiles, setMaxTiles] = useState(6);

  // Host Permissions & Security Settings (Zoom & Google Meet)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    lockMeeting: false,
    waitingRoom: true, // Enabled for realistic lobby demonstration
    hideProfilePictures: false,
    muteOnEntry: false,
    allowScreenShare: true,
    allowChat: true,
    allowRename: true,
    allowUnmute: true,
    allowStartVideo: true,
    allowWhiteboard: true,
    allowReactions: true,
  });

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

  const isHostBySession = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('host') === 'true' || 
    sessionStorage.getItem('isMeetHost_' + roomId) === 'true'
  );
  const myParticipantDoc = participants.find(p => p.peerId === myPeerIdRef.current);
  const isMeHost = claimedHost || isHostBySession || (myParticipantDoc ? myParticipantDoc.isHost : (participants.length === 0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize unique peer ID on client
  useEffect(() => {
    myPeerIdRef.current = 'peer_' + Math.random().toString(36).substring(2, 9);
  }, []);

  // Initialize Pre-call Lobby Camera & Mic stream
  // Setup Audio Analyser helper
  const attachAudioAnalyser = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && stream.getAudioTracks().length > 0) {
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
        }
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudio = () => {
          if (!audioContextRef.current) return;
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
      console.warn('Audio analyser setup notice', e);
    }
  };

  // Request / Switch Media Permissions and Streams
  const requestMediaPermissions = async (videoDeviceId?: string, audioDeviceId?: string) => {
    try {
      const videoConstraints: MediaTrackConstraints = videoDeviceId && videoDeviceId !== 'default'
        ? { deviceId: { exact: videoDeviceId } }
        : { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };

      const audioConstraints: MediaTrackConstraints = audioDeviceId && audioDeviceId !== 'default'
        ? { deviceId: { exact: audioDeviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        : { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      });

      setLocalStream(stream);
      setPermissionState('granted');
      attachAudioAnalyser(stream);

      // Replace tracks in active WebRTC peer connections
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.localStream = stream;
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        webrtcManagerRef.current.peerConnections.forEach((pc) => {
          pc.getSenders().forEach((sender) => {
            if (sender.track?.kind === 'video' && videoTrack) sender.replaceTrack(videoTrack);
            if (sender.track?.kind === 'audio' && audioTrack) sender.replaceTrack(audioTrack);
          });
        });
      }
      return stream;
    } catch (err: any) {
      console.warn('getUserMedia notice:', err);
      setPermissionState('denied');
      return null;
    }
  };

  // Handle switching audio input (microphone)
  const handleSelectMic = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    await requestMediaPermissions(selectedCameraId, deviceId);
  };

  // Handle switching video input (camera)
  const handleSelectCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    await requestMediaPermissions(deviceId, selectedMicId);
  };

  // Handle switching audio output (speakers)
  const handleSelectSpeaker = async (deviceId: string) => {
    setSelectedSpeakerId(deviceId);
    try {
      const audioElements = document.querySelectorAll('audio, video');
      audioElements.forEach((el: any) => {
        if (typeof el.setSinkId === 'function') {
          el.setSinkId(deviceId).catch(console.warn);
        }
      });
    } catch (err) {
      console.warn('setSinkId error:', err);
    }
  };

  // Initialize Pre-call Lobby Camera & Mic stream on mount
  useEffect(() => {
    requestMediaPermissions();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Listen for meeting room participants in Firestore
  useEffect(() => {
    if (!roomId) return;
    const participantsRef = collection(db, 'meet_rooms', roomId, 'participants');

    const unsubscribe = onSnapshot(
      participantsRef,
      (snapshot) => {
        const list: ParticipantInfo[] = [];
        snapshot.forEach((d) => {
          list.push({ peerId: d.id, ...d.data() } as ParticipantInfo);
        });
        setParticipants(list);
      },
      (error) => {
        console.warn('Meeting room participants listener note:', error);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  // 1. Participant: Listen for my own knocking status in Firestore
  useEffect(() => {
    if (!roomId || !myPeerIdRef.current || hasJoined) return;

    const knockDocRef = doc(db, 'meet_rooms', roomId, 'knocks', myPeerIdRef.current);
    const unsubscribe = onSnapshot(
      knockDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'admitted') {
            setMyKnockStatus('admitted');
            setIsWaitingInLobby(false);
            soundManager.playJoinSound();
            handleJoinMeeting(false);
          } else if (data.status === 'denied') {
            setMyKnockStatus('denied');
            soundManager.playLeaveSound();
          } else if (data.status === 'pending') {
            setMyKnockStatus('pending');
            setIsWaitingInLobby(true);
          }
        }
      },
      (err) => {
        console.warn('My knock listener notice:', err);
      }
    );

    return () => unsubscribe();
  }, [roomId, hasJoined]);

  // Handle countdown and auto-redirect when guest entry is denied
  useEffect(() => {
    if (myKnockStatus !== 'denied') return;

    setDeniedCountdown(3);
    const timer = setInterval(() => {
      setDeniedCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [myKnockStatus, router]);

  // 2. Host: Listen for incoming guest knocks in real-time
  useEffect(() => {
    if (!roomId || !isMeHost) return;

    const knocksRef = collection(db, 'meet_rooms', roomId, 'knocks');
    const unsubscribe = onSnapshot(
      knocksRef,
      (snapshot) => {
        const pendingKnocks: WaitingParticipant[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.status === 'pending') {
            pendingKnocks.push({
              id: d.id,
              name: data.name || 'Guest',
              requestedAt: data.requestedAt || Date.now(),
            });
          }
        });
        setWaitingList(pendingKnocks);
        if (pendingKnocks.length > 0) {
          setTopKnockNotice(pendingKnocks[pendingKnocks.length - 1]);
        } else {
          setTopKnockNotice(null);
        }
      },
      (err) => {
        console.warn('Host knocks listener notice:', err);
      }
    );

    return () => unsubscribe();
  }, [roomId, isMeHost]);

  // Speech Recognition setup for Live Captions (CC) and AI Transcript
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
          const itemText = event.results[i][0].transcript;
          interim += itemText;

          if (event.results[i].isFinal) {
            // Append final sentence to transcript for AI Meeting Companion
            setTranscript(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                speaker: displayName,
                text: itemText.trim(),
                time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
              }
            ]);
          }
        }
        setCaptionText(interim);
      };

      recognizer.onerror = () => {};
      speechRecognitionRef.current = recognizer;
    }
  }, [displayName]);

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
      // If room is locked
      if (securitySettings.lockMeeting && participants.length > 0) {
        alert('This meeting is locked by the host. No new participants can join.');
        return;
      }

      // Check if Waiting Room is enabled and I am not the first user (host)
      if (securitySettings.waitingRoom && participants.length > 0 && !hasJoined && !isWaitingInLobby) {
        // Put in waiting lobby
        setIsWaitingInLobby(true);
        soundManager.playDoorbellSound();
        return;
      }

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
      const isHostInitial = typeof window !== 'undefined' && (
        new URLSearchParams(window.location.search).get('host') === 'true' || 
        sessionStorage.getItem('isMeetHost_' + roomId) === 'true' || 
        claimedHost || 
        participants.length === 0
      );
      const myDocRef = doc(db, 'meet_rooms', roomId, 'participants', myPeerIdRef.current);
      await setDoc(myDocRef, {
        name: displayName.trim() || 'Guest',
        micMuted: securitySettings.muteOnEntry ? true : micMuted,
        videoOff: videoOff,
        handRaised: false,
        isHost: isHostInitial,
        joinedAt: Date.now(),
      });

      // Connect to existing participants
      participants.forEach((p) => {
        if (p.peerId !== myPeerIdRef.current) {
          manager.connectToPeer(p.peerId);
        }
      });

      setHasJoined(true);
      setIsWaitingInLobby(false);

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
    if (!securitySettings.allowUnmute && hasJoined && !isMeHost) {
      alert('The host has disabled participant unmuting.');
      return;
    }

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
    if (!securitySettings.allowStartVideo && hasJoined && !isMeHost) {
      alert('The host has disabled participant video cameras.');
      return;
    }

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
    if (!securitySettings.allowScreenShare && !isMeHost) {
      alert('Screen sharing is currently disabled by the host.');
      return;
    }

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

  // Non-verbal Feedback (Zoom Flagship Feature: Yes, No, Slower, Faster, Away)
  const handleSendFeedback = (type: 'yes' | 'no' | 'slower' | 'faster' | 'coffee') => {
    const nextVal = myFeedback === type ? null : type;
    setMyFeedback(nextVal);

    setFeedbackCounts(prev => ({
      ...prev,
      [type]: nextVal ? prev[type] + 1 : Math.max(0, prev[type] - 1)
    }));

    if (hasJoined && myPeerIdRef.current) {
      const myDocRef = doc(db, 'meet_rooms', roomId, 'participants', myPeerIdRef.current);
      setDoc(myDocRef, { feedback: nextVal }, { merge: true }).catch(() => {});
    }
  };

  // Clear all non-verbal feedback (Host action)
  const handleClearFeedback = () => {
    setFeedbackCounts({ yes: 0, no: 0, slower: 0, faster: 0, coffee: 0 });
    setMyFeedback(null);
    participants.forEach(p => {
      const dRef = doc(db, 'meet_rooms', roomId, 'participants', p.peerId);
      setDoc(dRef, { feedback: null }, { merge: true }).catch(() => {});
    });
  };

  // Spotlight for Everyone (Zoom & Google Meet Flagship)
  const handleToggleSpotlight = (peerId: string) => {
    if (spotlightedPeerId === peerId) {
      setSpotlightedPeerId(null);
    } else {
      setSpotlightedPeerId(peerId);
      soundManager.playHandRaiseSound();
    }
  };

  // Real-time Firestore Waiting Room Management (Host Actions)
  const handleAdmitGuest = async (id: string) => {
    soundManager.playJoinSound();
    try {
      const knockDocRef = doc(db, 'meet_rooms', roomId, 'knocks', id);
      await setDoc(knockDocRef, { status: 'admitted', updatedAt: Date.now() }, { merge: true });
    } catch (e) {
      console.warn('Admit guest Firestore notice:', e);
    }

    setWaitingList(prev => prev.filter(g => g.id !== id));
    if (topKnockNotice?.id === id) {
      setTopKnockNotice(null);
    }
  };

  const handleDenyGuest = async (id: string) => {
    soundManager.playLeaveSound();
    try {
      const knockDocRef = doc(db, 'meet_rooms', roomId, 'knocks', id);
      await setDoc(knockDocRef, { status: 'denied', updatedAt: Date.now() }, { merge: true });
    } catch (e) {
      console.warn('Deny guest Firestore notice:', e);
    }

    setWaitingList(prev => prev.filter(g => g.id !== id));
    if (topKnockNotice?.id === id) {
      setTopKnockNotice(null);
    }
  };

  const handleAdmitAll = async () => {
    soundManager.playJoinSound();
    for (const w of waitingList) {
      try {
        const knockDocRef = doc(db, 'meet_rooms', roomId, 'knocks', w.id);
        await setDoc(knockDocRef, { status: 'admitted', updatedAt: Date.now() }, { merge: true });
      } catch (e) {
        console.warn('Admit all Firestore notice:', e);
      }
    }
    setWaitingList([]);
    setTopKnockNotice(null);
  };

  // Participant Request to Join (Knock in Waiting Room)
  const handleRequestToJoin = async (presentImmediately: boolean = false) => {
    if (!displayName.trim()) {
      alert('Please enter your name (कृपया अपना नाम दर्ज करें)');
      return;
    }

    if (isMeHost) {
      // Host enters immediately
      handleJoinMeeting(presentImmediately);
      return;
    }

    // Put participant in Waiting Room Lobby
    setIsWaitingInLobby(true);
    setMyKnockStatus('pending');
    soundManager.playDoorbellSound();

    try {
      const knockDocRef = doc(db, 'meet_rooms', roomId, 'knocks', myPeerIdRef.current);
      await setDoc(knockDocRef, {
        peerId: myPeerIdRef.current,
        name: displayName.trim(),
        status: 'pending',
        requestedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Knock request Firestore notice:', e);
    }
  };

  // Cancel Knock & Return to Green Room
  const handleCancelKnock = async () => {
    setIsWaitingInLobby(false);
    setMyKnockStatus('idle');
    try {
      const knockDocRef = doc(db, 'meet_rooms', roomId, 'knocks', myPeerIdRef.current);
      await deleteDoc(knockDocRef);
    } catch (e) {
      console.warn('Cancel knock notice:', e);
    }
  };

  // Simulate a Knocking Guest in Waiting Room (for instant testing by host)
  const handleSimulateKnock = () => {
    const demoNames = ['Aarav Patel', 'Sneha Kulkarni', 'Vikram Malhotra', 'Pooja Iyer', 'Rohan Mehta'];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const newGuest: WaitingParticipant = {
      id: 'waiter_' + Math.random().toString(36).substring(2, 7),
      name: randomName,
      requestedAt: Date.now(),
    };

    soundManager.playDoorbellSound();
    setWaitingList(prev => [...prev, newGuest]);
    setTopKnockNotice(newGuest);

    // Auto dismiss toast after 8 seconds, but keep in PeoplePanel
    setTimeout(() => {
      setTopKnockNotice(prev => prev?.id === newGuest.id ? null : prev);
    }, 8000);
  };

  // Emergency Freeze: Suspend Participant Activities (Zoom Security Shield)
  const handleSuspendParticipantActivities = () => {
    setSecuritySettings(prev => ({
      ...prev,
      lockMeeting: true,
      allowScreenShare: false,
      allowChat: false,
      allowUnmute: false,
      allowStartVideo: false,
      allowWhiteboard: false,
    }));
    handleMuteAll();
    setIsSharingScreen(false);
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    }
    alert('🚨 Emergency Lockdown Active: All mics muted, cameras paused, screen share stopped, and meeting locked.');
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
          a.download = `Live-Meeting-Recording-${roomId}.webm`;
          a.click();
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.warn('Recording error:', err);
      }
    }
  };

  // Copy Meeting Join Link
  const handleCopyJoiningInfo = () => {
    const url = `${window.location.origin}/meet/${roomId}`;
    navigator.clipboard.writeText(url);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2500);
  };

  // Add Simulated Test Peer
  const handleAddTestPeer = () => {
    const names = ['Priya Sharma', 'Rahul Verma', 'Ananya Gupta', 'Amit Patel', 'Sneha Rao'];
    const chosen = names[Math.floor(Math.random() * names.length)];
    handleAddTestPeerNamed(chosen);
  };

  const handleAddTestPeerNamed = (name: string) => {
    const peerId = 'sim_' + Math.random().toString(36).substring(2, 7);
    const mockStream = createSimulatedPeerStream(name);

    setRemoteStreams(prev => ({ ...prev, [peerId]: mockStream }));
    setParticipants(prev => [
      ...prev,
      {
        peerId,
        name,
        isHost: false,
        micMuted: false,
        videoOff: false,
        handRaised: false,
      }
    ]);
    soundManager.playJoinSound();
  };

  // Remove participant from meeting (Host action)
  const handleRemoveParticipant = (peerId: string) => {
    setParticipants(prev => prev.filter(p => p.peerId !== peerId));
    setRemoteStreams(prev => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    soundManager.playLeaveSound();
  };

  const handleClaimHost = () => {
    const pin = prompt('Enter Host / Admin Security PIN (Default: 1234):');
    if (pin === '1234' || pin === 'admin') {
      setClaimedHost(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('isMeetHost_' + roomId, 'true');
      }
      if (myPeerIdRef.current) {
        const myDocRef = doc(db, 'meet_rooms', roomId, 'participants', myPeerIdRef.current);
        setDoc(myDocRef, { isHost: true }, { merge: true }).catch(() => {});
      }
      alert('👑 Verified as Meeting Host & Admin. All security controls unlocked.');
    } else if (pin !== null) {
      alert('Incorrect PIN. Admin privileges denied.');
    }
  };

  // Compute full participants list
  const allParticipantsList: ParticipantInfo[] = [
    {
      peerId: myPeerIdRef.current,
      name: displayName,
      isHost: isMeHost,
      micMuted,
      videoOff,
      handRaised,
      isMe: true,
      feedback: myFeedback,
    },
    ...participants.filter(p => p.peerId !== myPeerIdRef.current)
  ];

  // Pinned or spotlight participant
  const targetSpotlightId = spotlightedPeerId || pinnedPeerId;
  const spotlightParticipant = targetSpotlightId 
    ? allParticipantsList.find(p => p.peerId === targetSpotlightId) || allParticipantsList[0]
    : allParticipantsList[0];

  // =========================================================================
  // VIEW 1: WAITING ROOM LOBBY (Zoom Waiting Room & Google Meet Lobby)
  // =========================================================================
  if (isWaitingInLobby || myKnockStatus === 'denied') {
    if (myKnockStatus === 'denied') {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <XCircle className="w-8 h-8 text-rose-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                Request Denied by Host
              </h2>
              <p className="text-xs text-rose-300 font-medium">
                एडमिन ने मीटिंग में शामिल होने का अनुरोध अस्वीकार कर दिया है।
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Redirecting to home page in <strong className="text-white font-mono">{deniedCountdown}</strong> seconds...
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-rose-600/25"
              >
                Return to Home Page Now (होम पेज पर जाएं)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 animate-pulse">
            <DoorClosed className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              Waiting for Host Approval...
            </h2>
            <p className="text-xs text-indigo-300 font-medium">
              कृपया प्रतीक्षा करें, एडमिन को आपके जुड़ने की सूचना भेज दी गई है।
            </p>
            <p className="text-[11px] text-slate-400">
              Meeting ID: <span className="font-mono text-indigo-400 font-semibold">{roomId}</span>
            </p>
          </div>

          {/* Camera preview window while waiting */}
          <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-slate-800">
            <video
              ref={(ref) => {
                if (ref && localStream) ref.srcObject = localStream;
              }}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${videoOff ? 'hidden' : 'block'}`}
            />
            {videoOff && (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Camera is off
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{displayName} (Waiting in Lobby...)</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {isMeHost && (
              <button
                onClick={() => handleJoinMeeting(false)}
                className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/25"
              >
                Enter Call Directly (Host Override)
              </button>
            )}

            <button
              onClick={handleCancelKnock}
              className="w-full py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Cancel Request &amp; Return to Green Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PRE-CALL GREEN ROOM
  // =========================================================================
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
        
        {/* Top Minimal Bar */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-slate-900">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            <span className="text-sm font-semibold text-slate-300 group-hover:text-white">
              Google Meet & Zoom
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Meeting ID: {roomId}
            </span>
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-800"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Schedule</span>
            </button>
          </div>
        </header>

        {/* Lobby Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          
          {/* Left: Camera Preview Window & Permission Controls */}
          <div className="w-full max-w-xl space-y-4">
            
            {/* Interactive Permission Request Card if not yet allowed */}
            {permissionState !== 'granted' && (
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-100 shadow-xl animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white text-sm">Camera & Mic Access (कैमरा व माइक एक्सेस)</span>
                    <span className="text-slate-300 text-[11px]">
                      Allow your camera and microphone so other attendees can see and hear you.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => requestMediaPermissions()}
                  className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Allow Access</span>
                </button>
              </div>
            )}

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
                style={{ 
                  filter: `${filterEffect} ${lowLightBoost ? 'brightness(1.2) contrast(1.08)' : ''}`,
                }}
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

            {/* Virtual Background & Device Settings Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setDeviceSettingsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-blue-400" />
                <span>Audio & Video Settings (उपकरण)</span>
              </button>

              <button
                type="button"
                onClick={() => setBackgroundsModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Visual Effects</span>
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
                onClick={() => handleRequestToJoin(false)}
                className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                {isMeHost ? 'Start Meeting (मीटिंग शुरू करें)' : 'Ask to join (जुड़ने के लिए अनुरोध करें)'}
              </button>

              <button
                onClick={() => handleRequestToJoin(true)}
                className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center justify-center gap-2 transition-colors"
              >
                <MonitorUp className="w-4 h-4 text-blue-400" />
                {isMeHost ? 'Present & Start (स्क्रीन शेयर करके शुरू करें)' : 'Present to Call (स्क्रीन शेयर के साथ जुड़ें)'}
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
          lowLightBoost={lowLightBoost}
          onToggleLowLight={() => setLowLightBoost(!lowLightBoost)}
          touchUpLevel={touchUpLevel}
          onChangeTouchUp={(lvl) => setTouchUpLevel(lvl)}
          noiseSuppression={noiseSuppression}
          onChangeNoiseSuppression={(mode) => setNoiseSuppression(mode)}
        />

        <ScheduleMeetingModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          defaultRoomCode={roomId}
        />

      </div>
    );
  }

  // =========================================================================
  // VIEW 3: IN-CALL GOOGLE MEET & ZOOM INTERFACE
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

      {/* Floating Knock Alert Banner for Host (Zoom Waiting Room & Meet Knock) */}
      {isMeHost && topKnockNotice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-white text-xs font-semibold flex items-center gap-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-4 h-4 text-amber-400 animate-bounce" />
            <div>
              <span className="font-bold text-amber-300">{topKnockNotice.name}</span>
              <span className="text-slate-300 ml-1">is in the waiting room</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdmitGuest(topKnockNotice.id)}
              className="py-1 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Admit
            </button>
            <button
              onClick={() => handleDenyGuest(topKnockNotice.id)}
              className="py-1 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Deny
            </button>
          </div>
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
          
          {/* Top Stage Bar: Meeting Code, Spotlight status & Simulators */}
          <div className="h-8 flex items-center justify-between text-xs px-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 font-semibold">{roomId}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{allParticipantsList.length} in call</span>
              
              {spotlightedPeerId && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Spotlight Active</span>
                </span>
              )}

              {waitingList.length > 0 && isMeHost && (
                <button
                  onClick={() => setActiveSidePanel('people')}
                  className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/40 flex items-center gap-1 animate-pulse"
                >
                  <DoorClosed className="w-3 h-3" />
                  <span>{waitingList.length} Waiting</span>
                </button>
              )}
            </div>

            {/* Quick Test Peer & Knock Simulators */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddTestPeer}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                title="Add a colleague simulation into this call to test multi-person grid"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ Test Peer</span>
              </button>

              {isMeHost && (
                <button
                  onClick={handleSimulateKnock}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                  title="Simulate someone knocking in the waiting room"
                >
                  <DoorClosed className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Knock</span>
                </button>
              )}
            </div>
          </div>

          {/* SCREEN SHARING OR SPOTLIGHT MODE */}
          {(isSharingScreen && screenStream) || targetSpotlightId ? (
            <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden">
              {/* Spotlight Center */}
              <div className="flex-1 rounded-2xl bg-black border border-slate-800 overflow-hidden relative flex items-center justify-center">
                {isSharingScreen && screenStream ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={(ref) => {
                        if (ref) ref.srcObject = screenStream;
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 z-20">
                      <MonitorUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>You are presenting to everyone</span>
                    </div>

                    {/* Live Screen Annotation & Laser Pointer Overlay */}
                    <ScreenAnnotationBar isSharing={true} />
                  </div>
                ) : (
                  <VideoTile
                    stream={spotlightParticipant.isMe ? localStream : (remoteStreams[spotlightParticipant.peerId] || null)}
                    name={spotlightParticipant.name}
                    isMe={spotlightParticipant.isMe}
                    micMuted={spotlightParticipant.micMuted}
                    videoOff={spotlightParticipant.videoOff}
                    handRaised={spotlightParticipant.handRaised}
                    isSpeaking={spotlightParticipant.isMe ? isSpeakingMe : false}
                    isPinned={pinnedPeerId === spotlightParticipant.peerId}
                    isSpotlighted={spotlightedPeerId === spotlightParticipant.peerId}
                    feedbackBadge={spotlightParticipant.feedback}
                    canSpotlight={isMeHost}
                    onTogglePin={() => setPinnedPeerId(pinnedPeerId === spotlightParticipant.peerId ? null : spotlightParticipant.peerId)}
                    onToggleSpotlight={() => handleToggleSpotlight(spotlightParticipant.peerId)}
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
                        isPinned={pinnedPeerId === p.peerId}
                        isSpotlighted={spotlightedPeerId === p.peerId}
                        feedbackBadge={p.feedback}
                        canSpotlight={isMeHost}
                        onTogglePin={() => setPinnedPeerId(p.peerId)}
                        onToggleSpotlight={() => handleToggleSpotlight(p.peerId)}
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
                  canSpotlight={isMeHost}
                  onToggleSpotlight={() => handleToggleSpotlight(allParticipantsList[0].peerId)}
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
                        canSpotlight={isMeHost}
                        onToggleSpotlight={() => handleToggleSpotlight(p.peerId)}
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
                      filterEffect={p.isMe ? `${filterEffect} ${lowLightBoost ? 'brightness(1.2)' : ''}` : 'none'}
                      isPinned={pinnedPeerId === p.peerId}
                      isSpotlighted={spotlightedPeerId === p.peerId}
                      feedbackBadge={p.feedback}
                      canSpotlight={isMeHost}
                      onTogglePin={() => setPinnedPeerId(p.peerId)}
                      onToggleSpotlight={() => handleToggleSpotlight(p.peerId)}
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
          participants={allParticipantsList.map(p => ({ peerId: p.peerId, name: p.name }))}
          isHost={isMeHost}
          allowChat={securitySettings.allowChat}
        />

        <PeoplePanel
          participants={allParticipantsList}
          waitingList={waitingList}
          myPeerId={myPeerIdRef.current}
          isHost={isMeHost}
          spotlightedPeerId={spotlightedPeerId}
          isOpen={activeSidePanel === 'people'}
          onClose={() => setActiveSidePanel('none')}
          onCopyLink={handleCopyJoiningInfo}
          onMuteAll={handleMuteAll}
          onAdmit={handleAdmitGuest}
          onDeny={handleDenyGuest}
          onAdmitAll={handleAdmitAll}
          onSimulateKnock={handleSimulateKnock}
          onToggleSpotlight={handleToggleSpotlight}
          onRemoveParticipant={handleRemoveParticipant}
        />

        <MeetingInfoPanel
          roomId={roomId}
          isOpen={activeSidePanel === 'info'}
          onClose={() => setActiveSidePanel('none')}
          onCopyLink={handleCopyJoiningInfo}
          copied={showCopiedToast}
          isHost={isMeHost}
          onClaimHost={handleClaimHost}
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
        onSendFeedback={handleSendFeedback}
        onOpenWhiteboard={() => setWhiteboardOpen(true)}
        onOpenBackgrounds={() => setBackgroundsModalOpen(true)}
        onOpenLayoutModal={() => setLayoutModalOpen(true)}
        onOpenHostControls={() => setHostControlsOpen(true)}
        onOpenSecurityShield={() => setSecurityShieldOpen(true)}
        onOpenAICompanion={() => setAiCompanionOpen(true)}
        onOpenAgendaTimer={() => setAgendaTimerOpen(true)}
        onOpenAttendance={() => setAttendanceModalOpen(true)}
        onTogglePiP={handleTogglePiP}
        onTogglePanel={(p) => setActiveSidePanel(prev => prev === p ? 'none' : p)}
        onLeaveCall={handleLeaveCall}
        onOpenSettings={() => setDeviceSettingsOpen(true)}
      />

      {/* Audio & Video Device Settings Modal */}
      <DeviceSettingsModal
        isOpen={deviceSettingsOpen}
        onClose={() => setDeviceSettingsOpen(false)}
        localStream={localStream}
        selectedMicId={selectedMicId}
        selectedCameraId={selectedCameraId}
        selectedSpeakerId={selectedSpeakerId}
        onChangeMic={handleSelectMic}
        onChangeCamera={handleSelectCamera}
        onChangeSpeaker={handleSelectSpeaker}
        onRequestPermissions={() => requestMediaPermissions()}
        permissionState={permissionState}
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

      {/* Zoom Security Shield Modal */}
      <SecurityShieldModal
        isOpen={securityShieldOpen}
        onClose={() => setSecurityShieldOpen(false)}
        isHost={isMeHost}
        settings={securitySettings}
        onChangeSettings={(s) => setSecuritySettings(s)}
        onSuspendAllActivities={handleSuspendParticipantActivities}
        onMuteAll={handleMuteAll}
      />

      {/* AI Companion & Smart Meeting Minutes (Gemini & Duet AI) */}
      <AICompanionModal
        isOpen={aiCompanionOpen}
        onClose={() => setAiCompanionOpen(false)}
        roomId={roomId}
        transcript={transcript}
      />

      {/* Meeting Countdown Timer & Topic Agenda Checklist */}
      <MeetingAgendaTimer
        isHost={isMeHost}
        isOpen={agendaTimerOpen}
        onClose={() => setAgendaTimerOpen(false)}
      />

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultRoomCode={roomId}
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
        lowLightBoost={lowLightBoost}
        onToggleLowLight={() => setLowLightBoost(!lowLightBoost)}
        touchUpLevel={touchUpLevel}
        onChangeTouchUp={(lvl) => setTouchUpLevel(lvl)}
        noiseSuppression={noiseSuppression}
        onChangeNoiseSuppression={(mode) => setNoiseSuppression(mode)}
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
