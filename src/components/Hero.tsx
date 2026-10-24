import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

const HERO_IMAGES = [
  {
    src: '/images/template_ruang_rasa_1790831267799.jpg',
    label: 'Seri 01 · Ruang Rasa',
  },
  {
    src: '/images/editorial_couple_portrait_1790838636662.jpg',
    label: 'Seri 02 · Malam Zamrud',
  },
  {
    src: '/images/template_setangkai_1790831293717.jpg',
    label: 'Seri 03 · Setangkai',
  },
  {
    src: '/images/atlas_cinta_hero_cover_1791177934302.jpg',
    label: 'Seri 07 · Atlas Cinta',
  },
];

const SAMPLE_GUESTS = [
  'Bapak Hendra Wijaya & Ibu',
  'dr. Clara Anindita, Sp.KK',
  'Sahabatku, Nadia & Reza',
  'Keluarga Besar Bpk. Suryanto',
];

interface HeroProps {
  onExploreCollection: () => void;
  onExploreHowItWorks: () => void;
  onExploreFeatures?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreCollection,
  onExploreHowItWorks,
  onExploreFeatures,
}) => {
  const [activeImg, setActiveImg] = useState(0);
  const [visible, setVisible] = useState(false);
  const [guestIdx, setGuestIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    timerRef.current = setInterval(() => {
      setActiveImg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4400);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const cycleSampleGuest = () => {
    setGuestIdx((prev) => (prev + 1) % SAMPLE_GUESTS.length);
  };

  return (
    <section className="relative bg-[#FAF9F6] pt-12 pb-20 sm:pt-18 sm:pb-32 overflow-hidden">

      {/* Hairline accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#E8E5DF]" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">

          {/* — LEFT EDITORIAL COLUMN — */}
          <div
            className={`lg:col-span-6 space-y-7 text-left transition-all duration-700 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Eyebrow kicker */}
            <div className="inline-flex items-center gap-2.5">
              <span className="block w-6 h-[1px] bg-[#C6A679]" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
                Atelier Undangan Pernikahan · Edisi Terkurasi
              </p>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif font-normal text-[#181816] leading-[1.09] tracking-[-0.02em] text-[2.45rem] sm:text-[3.15rem] lg:text-[3.6rem] text-balance">
              Untuk awal kisah<br className="hidden sm:block" />
              yang diceritakan<br className="hidden sm:block" />
              <span className="italic text-[#8C734B]">dengan anggun.</span>
            </h1>

            {/* Sub-headline */}
            <p className="font-sans text-base sm:text-[17px] text-[#716E68] leading-relaxed max-w-[480px] font-light">
              Sekarsiti merancang undangan pernikahan bergaya editorial majalah bagi pasangan yang menghargai ketenangan estetika. Dilengkapi <strong className="font-medium text-[#181816]">Ruang Mempelai</strong> untuk mengelola undangan dengan leluasa, serta layanan tambahan <strong className="font-medium text-[#181816]">Kapsul Kenangan</strong> untuk menyimpan momen bahagia selamanya.
            </p>

            {/* Action Buttons */}
            <div
              className={`pt-2 flex flex-wrap items-center gap-4 transition-all duration-700 delay-200 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              {/* Primary CTA */}
              <button
                onClick={onExploreCollection}
                className="group inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-sans font-semibold text-[#FAF9F6] bg-[#181816] hover:bg-[#C6A679] hover:text-[#181816] rounded-full transition-all duration-300 active:scale-[0.97] cursor-pointer shadow-sm"
              >
                <span>Jelajahi Koleksi</span>
                <span className="group-hover:translate-y-0.5 transition-transform duration-300">↓</span>
              </button>

              {/* Secondary CTA */}
              <button
                onClick={onExploreFeatures || onExploreHowItWorks}
                className="group inline-flex items-center gap-2 px-5 py-3.5 text-[13px] font-sans font-medium text-[#181816] hover:text-[#C6A679] border border-[#E8E5DF] hover:border-[#C6A679] rounded-full transition-all duration-200 cursor-pointer bg-white/70"
              >
                <span>Keistimewaan Sekarsiti</span>
                <span className="group-hover:translate-x-0.5 transition-transform duration-300">→</span>
              </button>
            </div>

            {/* Trust tally */}
            <div
              className={`pt-4 grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-6 transition-all duration-700 delay-300 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <div className="text-left border-l border-[#E8E5DF] pl-4">
                <span className="block font-serif text-xl sm:text-2xl font-normal text-[#181816]">7+ Seri</span>
                <span className="text-[11px] font-sans text-[#716E68] tracking-wide">Desain Eksklusif</span>
              </div>
              <div className="text-left border-l border-[#E8E5DF] pl-4">
                <span className="block font-serif text-xl sm:text-2xl font-normal text-[#181816]">Leluasa</span>
                <span className="text-[11px] font-sans text-[#716E68] tracking-wide">Kelola dari Gawai</span>
              </div>
              <div className="text-left border-l border-[#E8E5DF] pl-4">
                <span className="block font-serif text-xl sm:text-2xl font-normal text-[#181816]">Add-On</span>
                <span className="text-[11px] font-sans text-[#716E68] tracking-wide">Kapsul Kenangan</span>
              </div>
            </div>
          </div>

          {/* — RIGHT VISUAL COMPOSITION — */}
          <div
            className={`lg:col-span-6 relative transition-all duration-1000 delay-100 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="relative mx-auto max-w-[440px]">

              {/* Main image frame — tall portrait ratio */}
              <div
                className="relative rounded-2xl overflow-hidden border border-[#E8E5DF] shadow-[0_8px_45px_rgba(0,0,0,0.07)] bg-[#F0EDE7]"
                style={{ aspectRatio: '4/5' }}
              >
                {HERO_IMAGES.map((item, i) => (
                  <img
                    key={item.src}
                    src={item.src}
                    alt={item.label}
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-in-out ${
                      i === activeImg ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.04]'
                    }`}
                  />
                ))}

                {/* Subtle bottom gradient for caption legibility */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#181816]/75 via-[#181816]/25 to-transparent pointer-events-none" />

                {/* Active series caption & indicator */}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-sans text-[#FAF9F6]/90 tracking-wide truncate">
                    {HERO_IMAGES[activeImg].label}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    {HERO_IMAGES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        aria-label={`Pilih gambar ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          i === activeImg ? 'bg-[#C6A679] w-5' : 'bg-white/50 w-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Top-left badge */}
                <div className="absolute top-4 left-4 bg-[#181816]/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-[#C6A679]">
                    Koleksi Editorial
                  </span>
                </div>
              </div>

              {/* Interactive Floating Gimmick Card: Klik untuk ganti simulasi nama tamu */}
              <div
                onClick={cycleSampleGuest}
                title="Klik untuk mencoba pergantian sapaan tamu"
                className="group absolute -bottom-6 -left-4 sm:-left-8 w-[245px] sm:w-[265px] rounded-xl border border-[#E8E5DF] bg-[#FAF9F6]/95 backdrop-blur-md p-4 shadow-[0_12px_35px_rgba(0,0,0,0.1)] hover:border-[#C6A679] hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none text-left"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 text-[9px] font-sans font-bold uppercase tracking-[0.16em] text-[#C6A679]">
                    <Sparkles className="w-2.5 h-2.5" />
                    Sapaan Tamu Personal
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-sans text-[#716E68] group-hover:text-[#181816] transition-colors">
                    <RefreshCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
                    Sentuh ganti
                  </span>
                </div>
                <p className="text-[10px] font-sans text-[#716E68]">
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </p>
                <p className="font-serif text-sm sm:text-[15px] text-[#181816] font-medium truncate mt-0.5">
                  {SAMPLE_GUESTS[guestIdx]}
                </p>
              </div>

              {/* Top-right floating chip */}
              <button
                type="button"
                onClick={onExploreFeatures || onExploreHowItWorks}
                className="absolute -top-4 -right-2 sm:-right-4 hidden sm:flex items-center gap-2 bg-white text-[#181816] border border-[#E8E5DF] hover:border-[#C6A679] rounded-full pl-3 pr-4 py-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#C6A679] animate-pulse" />
                <span className="text-[11px] font-sans font-medium text-[#716E68]">
                  Siap dalam 1 Hari
                </span>
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
