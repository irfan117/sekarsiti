import React from 'react';

interface OrnamentProps {
  className?: string;
  color?: string;
  size?: number;
}

/**
 * 1. Olive Branch Sprig (Ranting Zaitun Klasik)
 * Simbol kesucian, ketenangan, dan ikatan abadi.
 */
export const OliveBranchSprig: React.FC<OrnamentProps> = ({
  className = '',
  color = 'currentColor',
  size = 48,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Main Stem */}
    <path
      d="M20 85C35 75 52 58 78 20"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Leaves */}
    <path
      d="M32 72C25 65 24 55 31 52C38 49 42 59 32 72Z"
      fill={color}
      fillOpacity="0.22"
      stroke={color}
      strokeWidth="1.2"
    />
    <path
      d="M45 61C52 56 60 59 61 66C62 73 53 73 45 61Z"
      fill={color}
      fillOpacity="0.22"
      stroke={color}
      strokeWidth="1.2"
    />
    <path
      d="M48 48C41 40 43 32 49 31C56 30 58 40 48 48Z"
      fill={color}
      fillOpacity="0.22"
      stroke={color}
      strokeWidth="1.2"
    />
    <path
      d="M63 38C70 33 78 37 78 44C78 51 69 49 63 38Z"
      fill={color}
      fillOpacity="0.22"
      stroke={color}
      strokeWidth="1.2"
    />
    <path
      d="M66 28C63 20 67 14 74 15C80 16 79 25 66 28Z"
      fill={color}
      fillOpacity="0.22"
      stroke={color}
      strokeWidth="1.2"
    />
    {/* Tip Leaf */}
    <path
      d="M78 20C83 14 89 15 90 20C90 25 84 25 78 20Z"
      fill={color}
      fillOpacity="0.28"
      stroke={color}
      strokeWidth="1.2"
    />
  </svg>
);

/**
 * 2. Floral Laurel Wreath Crest (Karangan Bunga Melingkar untuk Monogram)
 */
export const FloralLaurelCrest: React.FC<OrnamentProps & { innerText?: string }> = ({
  className = '',
  color = 'currentColor',
  size = 140,
  innerText,
}) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Arc */}
      <path
        d="M80 142C48 142 24 116 24 80C24 46 46 22 76 18"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      {/* Right Arc */}
      <path
        d="M80 142C112 142 136 116 136 80C136 46 114 22 84 18"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />

      {/* Left Laurel Leaves */}
      <path d="M30 115C22 112 20 102 26 99C32 96 35 106 30 115Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <path d="M22 85C15 80 16 70 23 68C30 66 31 77 22 85Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <path d="M26 55C22 47 27 39 34 40C40 41 38 51 26 55Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <path d="M43 32C42 24 49 18 56 21C62 24 57 32 43 32Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <path d="M66 20C68 12 76 10 80 15C84 20 76 26 66 20Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />

      {/* Right Laurel Leaves */}
      <path d="M130 115C138 112 140 102 134 99C128 96 125 106 130 115Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <path d="M138 85C145 80 144 70 137 68C130 66 129 77 138 85Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <path d="M134 55C138 47 133 39 126 40C120 41 122 51 134 55Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <path d="M117 32C118 24 111 18 104 21C98 24 103 32 117 32Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      <path d="M94 20C92 12 84 10 80 15C76 20 84 26 94 20Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />

      {/* Bottom Ribbon Knot */}
      <circle cx="80" cy="142" r="3.5" fill={color} />
      <path d="M76 142C68 146 62 152 60 156M84 142C92 146 98 152 100 156" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
    {innerText && (
      <span className="absolute font-serif text-2xl tracking-widest uppercase select-none pointer-events-none" style={{ color }}>
        {innerText}
      </span>
    )}
  </div>
);

/**
 * 3. Botanical Corner Flourish (Sudut Hiasan Ukiran Klasik)
 */
export const BotanicalCornerFlourish: React.FC<
  OrnamentProps & { position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }
> = ({ className = '', color = 'currentColor', size = 56, position = 'top-left' }) => {
  const getRotationClass = () => {
    switch (position) {
      case 'top-right':
        return 'scale-x-[-1]';
      case 'bottom-left':
        return 'scale-y-[-1]';
      case 'bottom-right':
        return 'scale-[-1]';
      default:
        return '';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${getRotationClass()} ${className}`}
    >
      {/* Corner Lines */}
      <path d="M4 76V12C4 7.58172 7.58172 4 12 4H76" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 76V18C12 14.6863 14.6863 12 18 12H76" stroke={color} strokeWidth="0.8" strokeDasharray="2 3" />

      {/* Leaf Florets */}
      <path
        d="M16 16C28 14 36 22 36 34C24 34 16 26 16 16Z"
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeWidth="1.2"
      />
      <path
        d="M16 16C14 28 22 36 34 36C34 24 26 16 16 16Z"
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeWidth="1.2"
      />
      <circle cx="28" cy="28" r="2.5" fill={color} />
      <path d="M4 12C8 10 10 8 12 4" stroke={color} strokeWidth="1" />
    </svg>
  );
};

/**
 * 4. Classical Vine Divider (Pembatas Bab Tanaman Menjalar)
 */
export const BotanicalVineDivider: React.FC<OrnamentProps & { width?: number | string }> = ({
  className = '',
  color = 'currentColor',
  size = 28,
  width = '100%',
}) => (
  <div className={`flex items-center justify-center gap-3 w-full my-4 ${className}`}>
    <div className="h-px bg-current opacity-25 flex-1" style={{ color }} />
    <svg
      width={120}
      height={size}
      viewBox="0 0 120 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Center Diamond Flower */}
      <path d="M60 4L66 14L60 24L54 14Z" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.2" />
      <circle cx="60" cy="14" r="2" fill={color} />

      {/* Left Swirls */}
      <path
        d="M54 14C44 14 38 8 28 8C20 8 16 14 8 14M28 8C32 4 38 6 38 10"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M40 14C38 18 32 19 30 16" stroke={color} strokeWidth="1" strokeLinecap="round" />

      {/* Right Swirls */}
      <path
        d="M66 14C76 14 82 8 92 8C100 8 104 14 112 14M92 8C88 4 82 6 82 10"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M80 14C82 18 88 19 90 16" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
    <div className="h-px bg-current opacity-25 flex-1" style={{ color }} />
  </div>
);

/**
 * 5. Gingko Leaf Emblem (Daun Ginkgo Kembar - Simbol Kesetiaan Abadi)
 */
export const GingkoLeafDuo: React.FC<OrnamentProps> = ({
  className = '',
  color = 'currentColor',
  size = 48,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Left Leaf */}
    <path
      d="M50 82C48 64 36 50 18 42C14 56 22 72 38 78C44 80 48 81 50 82Z"
      fill={color}
      fillOpacity="0.25"
      stroke={color}
      strokeWidth="1.2"
    />
    <path
      d="M18 42C24 34 38 32 46 44C44 54 36 62 18 42Z"
      fill={color}
      fillOpacity="0.18"
      stroke={color}
      strokeWidth="1.2"
    />

    {/* Right Leaf */}
    <path
      d="M50 82C52 64 64 50 82 42C86 56 78 72 62 78C56 80 52 81 50 82Z"
      fill={color}
      fillOpacity="0.3"
      stroke={color}
      strokeWidth="1.2"
    />
    <path
      d="M82 42C76 34 62 32 54 44C56 54 64 62 82 42Z"
      fill={color}
      fillOpacity="0.22"
      stroke={color}
      strokeWidth="1.2"
    />

    {/* Stem */}
    <path d="M50 82V94" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
