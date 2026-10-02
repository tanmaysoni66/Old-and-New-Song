'use client';

// Generates an animated video stream with realistic speaker motion for test peers
export function createSimulatedPeerStream(name: string, subjectTitle: string = 'Participant'): MediaStream {
  if (typeof window === 'undefined') return new MediaStream();

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new MediaStream();

  let angle = 0;
  let mouthOpen = 0;

  const renderFrame = () => {
    angle += 0.04;
    mouthOpen = Math.sin(angle * 3) * 6;

    // Background gradient (Simulating modern home office or studio)
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ambient room light blur circle
    ctx.beginPath();
    ctx.arc(160, 100, 140, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.fill();

    // Bookshelf / Studio lines in background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(240, 120);
    ctx.moveTo(40, 180);
    ctx.lineTo(240, 180);
    ctx.stroke();

    // Subject/Academy Badge on wall
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.fillRect(480, 40, 120, 30);
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('APEX LIVE CLASS', 495, 60);

    // Simulated Person Body (Torso)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(320, 340, 130, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head / Face
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(320, 200, 55, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(320, 185, 58, Math.PI, Math.PI * 2);
    ctx.fill();

    // Glasses frame
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(290, 190, 24, 18);
    ctx.strokeRect(326, 190, 24, 18);
    ctx.beginPath();
    ctx.moveTo(314, 199);
    ctx.lineTo(326, 199);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(302, 199, 3, 0, Math.PI * 2);
    ctx.arc(338, 199, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (Simulating talking animation when speaking)
    ctx.strokeStyle = '#e11d48';
    ctx.fillStyle = '#be123c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(320, 232, 10, Math.max(2, 4 + mouthOpen), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();

    // Microphone headset boom
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(270, 195, 30, Math.PI * 0.5, Math.PI * 1.2);
    ctx.lineTo(298, 232);
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(302, 232, 5, 0, Math.PI * 2);
    ctx.fill();

    // Lower third overlay with name and subject
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(20, 310, 260, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(name, 32, 326);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText(subjectTitle, 32, 339);

    requestAnimationFrame(renderFrame);
  };

  renderFrame();

  return (canvas as any).captureStream ? (canvas as any).captureStream(30) : new MediaStream();
}
