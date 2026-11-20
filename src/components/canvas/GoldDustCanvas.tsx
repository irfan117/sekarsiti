import React, { useEffect, useRef } from 'react';

interface GoldDustCanvasProps {
  className?: string;
  particleCount?: number;
  color?: string; // e.g. '#D4AF37' (Champagne Gold)
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulseSpeed: number;
  angle: number;
  spinSpeed: number;
}

/**
 * GoldDustCanvas (Partikel Kilau Emas Mengambang 60FPS)
 * Efek taburan serpihan emas 24K yang mengambang lembut di udara.
 * Sangat hemat baterai, otomatis jeda saat tab tidak aktif.
 */
export const GoldDustCanvas: React.FC<GoldDustCanvasProps> = ({
  className = '',
  particleCount = 45,
  color = '#D4AF37',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Inisialisasi partikel serpihan emas
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 0.8,
      speedY: -(Math.random() * 0.45 + 0.15), // Melayang pelan ke atas
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.02,
    }));

    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          p.y += p.speedY;
          p.x += p.speedX;
          p.angle += p.spinSpeed;
          p.opacity = 0.35 + Math.sin(p.angle) * 0.35;

          // Wrap around layar
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          // Render partikel serpihan berlian emas
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.globalAlpha = Math.max(0.1, p.opacity);

          // Gradien kilau emas lembut
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
          gradient.addColorStop(0, '#FFF5D6');
          gradient.addColorStop(0.4, color);
          gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Titik pusat kemilau tajam
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [particleCount, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-10 w-full h-full ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
