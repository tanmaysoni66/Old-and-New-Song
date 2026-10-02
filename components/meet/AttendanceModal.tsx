'use client';

import React from 'react';
import { X, Users, Download, CheckCircle2, Clock } from 'lucide-react';
import { ParticipantInfo } from './PeoplePanel';

interface AttendanceModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  participants: ParticipantInfo[];
}

export default function AttendanceModal({
  roomId,
  isOpen,
  onClose,
  participants,
}: AttendanceModalProps) {
  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const now = new Date().toLocaleString();
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Meeting ID,Student/Participant Name,Role,Attendance Status,Recorded Time\n';

    participants.forEach((p) => {
      const role = p.isHost ? 'Host / Teacher' : 'Student / Attendee';
      csvContent += `"${roomId}","${p.name}","${role}","Present","${now}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance-${roomId}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Attendance Report (उपस्थिति)</h3>
              <p className="text-[11px] text-slate-400">Live roster of all students and members in {roomId}.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Total Present</span>
            <span className="text-xl font-bold text-emerald-400">{participants.length} Attendees</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Meeting Status</span>
            <span className="text-xl font-bold text-blue-400">Live Session</span>
          </div>
        </div>

        {/* Attendees List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
          {participants.map((p) => (
            <div
              key={p.peerId}
              className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">{p.name}</span>
                  <span className="text-[10px] text-slate-400">{p.isHost ? 'Meeting Host' : 'Participant'}</span>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">Present</span>
            </div>
          ))}
        </div>

        {/* Footer with CSV Download */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Auto-generated attendance sheet</span>
          
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>

      </div>
    </div>
  );
}
