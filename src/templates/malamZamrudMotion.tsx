import React, { useEffect, useRef, useState } from 'react';

const CSS = `
:root{--zz-ease:cubic-bezier(.22,1,.36,1)}

/* ---------- Reveal (sekali, saat masuk layar) ---------- */
.zz-reveal{--d:0ms;transition:opacity 1s var(--zz-ease) var(--d),transform 1s var(--zz-ease) var(--d),filter 1s var(--zz-ease) var(--d),clip-path 1.2s var(--zz-ease) var(--d)}
.zz-v-blur{opacity:0;filter:blur(6px);transform:translateY(10px)}
.zz-v-zoom{opacity:0;transform:scale(.88)}
.zz-v-iris{clip-path:circle(0% at 50% 50%)}
.zz-v-rays,.zz-v-none{opacity:1}
.zz-reveal.zz-in{opacity:1;filter:none;transform:none}
.zz-v-iris.zz-in{clip-path:circle(75% at 50% 50%)}

/* ---------- Sunburst: sinar mekar dari titik pusat ---------- */
.zz-sunburst line,.zz-sunburst path{transform-origin:60px 60px;opacity:0}
.zz-in .zz-sunburst line{animation:zz-ray 1.1s var(--zz-ease) both}
.zz-in .zz-sunburst path{animation:zz-ray 1.1s var(--zz-ease) .45s both}
.zz-in .zz-sunburst line:nth-of-type(1){animation-delay:.05s}
.zz-in .zz-sunburst line:nth-of-type(2),.zz-in .zz-sunburst line:nth-of-type(3){animation-delay:.14s}
.zz-in .zz-sunburst line:nth-of-type(4),.zz-in .zz-sunburst line:nth-of-type(5){animation-delay:.23s}
.zz-in .zz-sunburst line:nth-of-type(6),.zz-in .zz-sunburst line:nth-of-type(7){animation-delay:.32s}
.zz-in .zz-sunburst line:nth-of-type(n+8){animation-delay:.42s}
@keyframes zz-ray{from{opacity:0;transform:scale(.55)}to{opacity:1;transform:scale(1)}}

/* ---------- Segel & kilau emas ---------- */
.zz-seal{animation:zz-seal 2.8s ease-in-out infinite}
@keyframes zz-seal{0%,100%{box-shadow:0 0 18px rgba(198,163,86,.35)}50%{box-shadow:0 0 44px rgba(198,163,86,.75)}}
.zz-shimmer{position:relative;overflow:hidden}
.zz-shimmer::after{content:'';position:absolute;inset:0;pointer-events:none;transform:translateX(-130%);
  background:linear-gradient(105deg,transparent 38%,rgba(255,244,214,.5) 50%,transparent 62%);animation:zz-sweep 5.5s ease-in-out infinite}
@keyframes zz-sweep{0%,70%{transform:translateX(-130%)}100%{transform:translateX(130%)}}

/* ---------- Debu emas di sampul ---------- */
.zz-dust{position:absolute;bottom:-10px;border-radius:9999px;background:#C6A356;opacity:0;
  animation:zz-drift var(--t) linear var(--dl) infinite}
@keyframes zz-drift{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:.7}85%{opacity:.5}100%{transform:translate3d(var(--x),-95vh,0);opacity:0}}

/* ---------- Countdown ---------- */
.zz-tick{display:inline-block;animation:zz-tick .5s var(--zz-ease)}
@keyframes zz-tick{from{opacity:0;transform:translateY(-45%)}to{opacity:1;transform:none}}

/* ---------- Hero ---------- */
.zz-kenburns{animation:zz-kb 26s ease-in-out infinite alternate}
@keyframes zz-kb{from{transform:scale(1)}to{transform:scale(1.08) translate3d(-1%,-1%,0)}}

/* ---------- Timeline ---------- */
.zz-line{position:absolute;left:0;top:0;bottom:0;width:1px;background:rgba(140,74,54,.45);transform:scaleY(0);transform-origin:top;transition:transform 2.2s var(--zz-ease)}
.zz-in .zz-line{transform:scaleY(1)}
.zz-dot{transform:scale(0);transition:transform .6s var(--zz-ease) .4s}
.zz-in .zz-dot{transform:scale(1)}

/* ---------- Galeri & konfirmasi ---------- */
.zz-fade{animation:zz-fade .8s ease both}
@keyframes zz-fade{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}
.zz-pop{display:inline-block;animation:zz-pop .45s var(--zz-ease)}
@keyframes zz-pop{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:none}}

/* ---------- Bar progres scroll ---------- */
.zz-progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:75;transform-origin:left;pointer-events:none;
  background:linear-gradient(90deg,#8F702F,#E2C785,#C6A356);transition:transform .12s linear}

@media (prefers-reduced-motion:reduce){
  .zz-reveal,.zz-reveal *{transition:none!important;animation:none!important}
  .zz-v-blur,.zz-v-zoom{opacity:1!important;filter:none!important;transform:none!important}
  .zz-v-iris{clip-path:none!important}
  .zz-sunburst line,.zz-sunburst path,.zz-dot{opacity:1!important;transform:none!important}
  .zz-line{transform:none!important}
  .zz-shimmer::after,.zz-dust{display:none}
  .zz-seal,.zz-kenburns,.zz-tick,.zz-fade,.zz-pop{animation:none!important}
}
`;

export const MotionStyles: React.FC = () => <style>{CSS}</style>;

type Variant = 'blur' | 'zoom' | 'iris' | 'rays' | 'none';

interface RevealProps {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: 'div' | 'p' | 'span';
}

/** Menambahkan kelas `zz-in` sekali saja ketika elemen masuk layar. */
export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'blur',
  delay = 0,
  className = '',
  as: Tag = 'div',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`zz-reveal zz-v-${variant} ${seen ? 'zz-in' : ''} ${className}`}
      style={{ ['--d' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};

/** Angka countdown yang bergeser singkat setiap nilainya berubah. */
export const TickDigit: React.FC<{ value: number | string }> = ({ value }) => (
  <span key={String(value)} className="zz-tick">
    {value}
  </span>
);

/** Partikel emas halus untuk sampul amplop (posisi deterministik, murni CSS). */
export const GoldDust: React.FC<{ count?: number }> = ({ count = 14 }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => {
      const size = 2 + (i % 3);
      return (
        <span
          key={i}
          className="zz-dust"
          style={{
            left: `${(i * 37 + 7) % 100}%`,
            width: size,
            height: size,
            ['--x' as string]: `${((i % 5) - 2) * 14}px`,
            ['--t' as string]: `${11 + ((i * 7) % 9)}s`,
            ['--dl' as string]: `-${(i * 1.7).toFixed(1)}s`,
          }}
        />
      );
    })}
  </div>
);

/** Garis emas tipis di atas layar; progress bernilai 0–1 (pakai state scrollProgress yang sudah ada). */
export const ScrollProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="zz-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
);

