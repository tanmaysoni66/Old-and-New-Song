'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  query, 
  where, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

export interface SignalData {
  from: string;
  to: string;
  type: 'offer' | 'answer' | 'candidate';
  payload: string; // JSON stringified RTCSessionDescription or RTCIceCandidate
  createdAt: number;
}

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class WebRTCMeetingManager {
  roomId: string;
  myPeerId: string;
  myName: string;
  localStream: MediaStream | null = null;
  displayStream: MediaStream | null = null;
  peerConnections: Map<string, RTCPeerConnection> = new Map();
  remoteStreams: Map<string, MediaStream> = new Map();
  onRemoteStreamUpdated?: (peerId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved?: (peerId: string) => void;
  private unsubscribeSignals?: () => void;

  constructor(roomId: string, myPeerId: string, myName: string) {
    this.roomId = roomId;
    this.myPeerId = myPeerId;
    this.myName = myName;
  }

  // Initialize local webcam and mic
  async initLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } } : false,
        audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false,
      });
      this.localStream = stream;
      return stream;
    } catch (err) {
      console.warn('getUserMedia error, falling back to audio-only or canvas stream', err);
      // Fallback: create empty or fake stream if permission denied or no hardware
      const fallbackStream = new MediaStream();
      this.localStream = fallbackStream;
      return fallbackStream;
    }
  }

  // Start Screen Sharing
  async startScreenShare(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' } as any,
      audio: false,
    });
    this.displayStream = stream;

    // Replace video track in all active peer connections
    const screenTrack = stream.getVideoTracks()[0];
    this.peerConnections.forEach((pc) => {
      const senders = pc.getSenders();
      const videoSender = senders.find(s => s.track && s.track.kind === 'video');
      if (videoSender) {
        videoSender.replaceTrack(screenTrack);
      }
    });

    screenTrack.onended = () => {
      this.stopScreenShare();
    };

    return stream;
  }

  // Stop Screen Share and restore camera
  stopScreenShare() {
    if (this.displayStream) {
      this.displayStream.getTracks().forEach(t => t.stop());
      this.displayStream = null;
    }

    if (this.localStream) {
      const cameraTrack = this.localStream.getVideoTracks()[0];
      this.peerConnections.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender && cameraTrack) {
          videoSender.replaceTrack(cameraTrack);
        }
      });
    }
  }

  // Listen for WebRTC signals (Offers, Answers, ICE Candidates)
  startListeningForSignals() {
    const signalsRef = collection(db, 'meet_rooms', this.roomId, 'signals');
    const q = query(signalsRef, where('to', '==', this.myPeerId));

    this.unsubscribeSignals = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const signal = change.doc.data() as SignalData;
            await this.handleIncomingSignal(signal);
            // Delete signal after consumption to keep database clean
            deleteDoc(change.doc.ref).catch(() => {});
          }
        });
      },
      (err) => {
        console.warn('WebRTC signals listener notice:', err);
      }
    );
  }

  private async handleIncomingSignal(signal: SignalData) {
    const senderId = signal.from;

    if (signal.type === 'offer') {
      const pc = this.getOrCreatePeerConnection(senderId);
      const offer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer back to sender
      await this.sendSignal({
        from: this.myPeerId,
        to: senderId,
        type: 'answer',
        payload: JSON.stringify(answer),
        createdAt: Date.now(),
      });
    } else if (signal.type === 'answer') {
      const pc = this.peerConnections.get(senderId);
      if (pc && pc.signalingState !== 'stable') {
        const answer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } else if (signal.type === 'candidate') {
      const pc = this.peerConnections.get(senderId);
      if (pc && pc.remoteDescription) {
        const candidate = JSON.parse(signal.payload) as RTCIceCandidateInit;
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn);
      }
    }
  }

  // Initiate peer connection to another participant (Caller)
  async connectToPeer(targetPeerId: string) {
    if (this.peerConnections.has(targetPeerId)) return;
    const pc = this.getOrCreatePeerConnection(targetPeerId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await this.sendSignal({
      from: this.myPeerId,
      to: targetPeerId,
      type: 'offer',
      payload: JSON.stringify(offer),
      createdAt: Date.now(),
    });
  }

  private getOrCreatePeerConnection(peerId: string): RTCPeerConnection {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnections.set(peerId, pc);

    // Add local tracks to peer connection
    const currentStream = this.displayStream || this.localStream;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        pc.addTrack(track, currentStream);
      });
    }

    // ICE Candidate event
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          from: this.myPeerId,
          to: peerId,
          type: 'candidate',
          payload: JSON.stringify(event.candidate.toJSON()),
          createdAt: Date.now(),
        }).catch(console.warn);
      }
    };

    // Remote Track event
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        this.remoteStreams.set(peerId, remoteStream);
        if (this.onRemoteStreamUpdated) {
          this.onRemoteStreamUpdated(peerId, remoteStream);
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.closePeer(peerId);
      }
    };

    return pc;
  }

  private async sendSignal(signal: SignalData) {
    const signalsRef = collection(db, 'meet_rooms', this.roomId, 'signals');
    await addDoc(signalsRef, signal);
  }

  closePeer(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
    this.remoteStreams.delete(peerId);
    if (this.onRemoteStreamRemoved) {
      this.onRemoteStreamRemoved(peerId);
    }
  }

  // Cleanup all streams and connections
  destroy() {
    if (this.unsubscribeSignals) {
      this.unsubscribeSignals();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
    }
    if (this.displayStream) {
      this.displayStream.getTracks().forEach(t => t.stop());
    }
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.remoteStreams.clear();
  }
}
