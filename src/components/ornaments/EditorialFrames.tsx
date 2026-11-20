import React from 'react';

interface FrameProps {
  children?: React.ReactNode;
  className?: string;
  borderColor?: string;
}

/**
 * 1. Arched Editorial Frame (Bingkai Lengkung Editorial Klasik)
 * Sangat cocok membingkai monogram inisial, teks nama mempelai, atau kutipan suci
 */
export const ArchedEditorialFrame: React.FC<FrameProps> = ({
  children,
  className = '',
  borderColor = 'rgba(197, 168, 128, 0.45)', // Champagne gold default
}) => {
  return (
    <div
      className={`relative p-6 sm:p-8 rounded-t-[100px] border border-solid overflow-hidden backdrop-blur-2xs transition-all ${className}`}
      style={{ borderColor }}
    >
      {/* Inner Inset Border */}
      <div
        className="absolute inset-2 sm:inset-3 rounded-t-[88px] border border-dashed pointer-events-none opacity-40"
        style={{ borderColor }}
      />
      {/* Top Keystone Arch Accent */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-current opacity-40 rounded-full" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * 2. Scalloped Royal Medallion (Medallion Monogram Kerajaan Geometris)
 */
export const ScallopedMedallion: React.FC<{
  monogram: string;
  size?: number;
  className?: string;
  color?: string;
}> = ({ monogram, size = 110, className = '', color = '#C5A880' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Octagram / Scalloped Star Shape */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 animate-spin-very-slow"
      >
        <rect
          x="15"
          y="15"
          width="70"
          height="70"
          rx="6"
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="3 3"
          fill="none"
        />
        <rect
          x="15"
          y="15"
          width="70"
          height="70"
          rx="6"
          transform="rotate(45 50 50)"
          stroke={color}
          strokeWidth="1.2"
          fill="none"
          opacity="0.8"
        />
        <circle cx="50" cy="50" r="32" stroke={color} strokeWidth="1" strokeOpacity="0.4" fill="none" />
      </svg>

      {/* Center Monogram Initials */}
      <span
        className="font-serif text-2xl tracking-widest font-normal text-center relative z-10"
        style={{ color }}
      >
        {monogram}
      </span>
    </div>
  );
};

/**
 * 3. Vintage Wax Seal Stamp (Stempel Segel Lilin Vektor dengan Monogram)
 */
export const VintageWaxSeal: React.FC<{
  monogram: string;
  dateText?: string;
  size?: number;
  variant?: 'gold' | 'burgundy' | 'emerald' | 'noir';
  className?: string;
  onClick?: () => void;
}> = ({
  monogram,
  dateText,
  size = 90,
  variant = 'gold',
  className = '',
  onClick,
}) => {
  const variantStyles = {
    gold: {
      bg: 'radial-gradient(circle at 35% 35%, #D4AF37 0%, #AA7C11 60%, #684C07 100%)',
      border: 'rgba(255, 230, 160, 0.4)',
      text: '#FFF8E7',
      shadow: '0 8px 24px -4px rgba(170, 124, 17, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
    },
    burgundy: {
      bg: 'radial-gradient(circle at 35% 35%, #8B1E2E 0%, #5E0F1C 60%, #3B060F 100%)',
      border: 'rgba(255, 170, 180, 0.35)',
      text: '#FFEDF0',
      shadow: '0 8px 24px -4px rgba(94, 15, 28, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
    },
    emerald: {
      bg: 'radial-gradient(circle at 35% 35%, #1C5A42 0%, #0F3828 60%, #072217 100%)',
      border: 'rgba(180, 240, 210, 0.35)',
      text: '#EDFFF7',
      shadow: '0 8px 24px -4px rgba(15, 56, 40, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
    },
    noir: {
      bg: 'radial-gradient(circle at 35% 35%, #2A2A2A 0%, #151515 60%, #0A0A0A 100%)',
      border: 'rgba(255, 255, 255, 0.25)',
      text: '#F5F5F5',
      shadow: '0 8px 24px -4px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
    },
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center rounded-full transition-transform active:scale-95 hover:scale-105 cursor-pointer ${className}`}
      style={{
        width: size,
        height: size,
        background: variantStyles.bg,
        boxShadow: variantStyles.shadow,
        border: `2px solid ${variantStyles.border}`,
      }}
      title="Buka Segel Undangan"
    >
      {/* Outer Wavy Wax Edge */}
      <div className="absolute inset-1.5 rounded-full border border-dashed border-white/20 pointer-events-none" />

      {/* Embossed Inner Monogram */}
      <span
        className="font-serif font-bold text-xl sm:text-2xl tracking-widest drop-shadow-md select-none"
        style={{ color: variantStyles.text }}
      >
        {monogram}
      </span>

      {dateText && (
        <span
          className="text-[8px] font-mono tracking-widest uppercase opacity-75 mt-0.5 select-none"
          style={{ color: variantStyles.text }}
        >
          {dateText}
        </span>
      )}
    </button>
  );
};
