import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface KineticTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

/**
 * 1. KineticTextReveal (GSAP Split Text Staggered Reveal)
 * Memunculkan huruf / kata demi kata dengan transisi halus ala typography award.
 */
export const KineticTextReveal: React.FC<KineticTextRevealProps> = ({
  text,
  className = '',
  delay = 0.2,
  as: Component = 'h1',
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll('.kinetic-char');
    gsap.fromTo(
      chars,
      {
        opacity: 0,
        y: 28,
        rotateX: -45,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.035,
        delay,
        ease: 'power3.out',
      }
    );
  }, [text, delay]);

  const words = text.split(' ');

  return (
    <Component
      ref={containerRef as any}
      className={`inline-block overflow-hidden ${className}`}
      style={{ perspective: 800 }}
    >
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.28em]">
          {word.split('').map((char, cIdx) => (
            <span key={cIdx} className="kinetic-char inline-block will-change-transform">
              {char}
            </span>
          ))}
        </span>
      ))}
    </Component>
  );
};

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

/**
 * 2. MagneticElement (Efek Tarikan Magnetik Kursor GSAP)
 * Elemen tombol atau ornamen tertarik halus ke arah kursor.
 */
export const MagneticElement: React.FC<MagneticProps> = ({
  children,
  className = '',
  strength = 0.35,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = (e.clientX - centerX) * strength;
      const distY = (e.clientY - centerY) * strength;

      gsap.to(el, {
        x: distX,
        y: distY,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
};
