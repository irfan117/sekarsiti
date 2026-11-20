import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Eye, MessageCircle, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { InvitationItem } from '../types';
import { TEMPLATES } from '../data/catalog';
import { STANDARD_TEMPLATES } from '../data/standardCatalog';
import { PortfolioStore } from '../admin/portfolioStore';
import { PortfolioItemData } from '../types/portfolio';

// Per-template editorial labels & short descriptions for Editorial collection
const EDITORIAL_META: Record<
  string,
  { seriesLabel: string; shortDesc: string }
> = {
  'noir-editorial': {
    seriesLabel: 'SERI NO. 01 · NOIR EDITORIAL',
    shortDesc: 'Estetika monokrom high-fashion, split-screen desktop interaktif, dan monogram berkarakter kuat.',
  },
  'ruang-rasa': {
    seriesLabel: 'SERI NO. 02 · EDITORIAL MONOCHROME',
    shortDesc: 'Eksplorasi tipografi murni, ruang kosong yang bernapas, dan ketenangan kontemporer.',
  },
  'malam-zamrud': {
    seriesLabel: 'SERI NO. 03 · ART DECO & ONYX',
    shortDesc: 'Kemegahan malam beraksen logam kuningan untuk perayaan yang intim nan berwibawa.',
  },
  'setangkai': {
    seriesLabel: 'SERI NO. 04 · SAGE & FOLIAGE',
    shortDesc: 'Keanggunan botanical sage yang lembut, hadir dalam tata letak dual-pane yang sinematik.',
  },
  'suasana': {
    seriesLabel: 'SERI NO. 05 · BOTANICAL ARCHIVE',
    shortDesc: 'Sentuhan tekstur kertas gading dan lipatan interaktif bergaya buku kenangan.',
  },
  'lembayung': {
    seriesLabel: 'SERI NO. 06 · CINEMATIC 35MM',
    shortDesc: 'Nostalgia rol film sinematik dengan gerbang sampul dua pintu dan polaroid berserak.',
  },
  'cetak-biru': {
    seriesLabel: 'SERI NO. 07 · BLUEPRINT ARCHIVIST',
    shortDesc: 'Presisi cetak biru arsitektur dengan tipografi tabular dan komposisi garis geometris.',
  },
  'atlas-cinta': {
    seriesLabel: "SERI NO. 08 · TRAVELLER'S ATLAS",
    shortDesc: 'Perpaduan peta perjalanan dan kisah yang mengalir dalam format atlas editorial.',
  },
  'lantera': {
    seriesLabel: 'SERI NO. 09 · GOLD & ONYX LANTERN',
    shortDesc: 'Malam onyx megah beraksen kilau emas, partikel kunang-kunang, dan 3 kolom desktop layout.',
  },
  'pasang': {
    seriesLabel: 'SERI NO. 10 · COASTAL TIDE & SAND',
    shortDesc: 'Nuansa pesisir tenang dengan rising tide water level interaktif dan bingkai kerikil halus.',
  },
  'pop-kuning': {
    seriesLabel: 'SERI NO. 11 · NEO-BRUTALIST CHEERFUL',
    shortDesc: 'Gaya pop ceria berani dengan polaroid bertape washi, running marquee, dan panel bab reaktif.',
  },
  'porselen-biru': {
    seriesLabel: 'SERI NO. 12 · AZULEJO PORCELAIN',
    shortDesc: 'Keanggunan ubin keramik Azulejo biru Delft dengan bingkai lengkung kubah dan tiket bertekstur.',
  },
  'senja-kinanti': {
    seriesLabel: 'SERI NO. 13 · TERRACOTTA SUNSET',
    shortDesc: 'Pesona golden hour sinematik dengan video latar senja, sundial berputar, dan background photo parallax ikrar janji suci.',
  },
  'kraton-heritage': {
    seriesLabel: 'SERI NO. 14 · ROYAL KRATON HERITAGE',
    shortDesc: 'Adiluhung tradisi kebesaran Keraton Jawa dengan gerbang Kori Agung berstempel segel emas, background photo sakral, dan kidung laras madya.',
  },
};

function getEditorialMeta(id: string) {
  return EDITORIAL_META[id] ?? {
    seriesLabel: 'SERI EKSKLUSIF · SEKARSITI',
    shortDesc: 'Desain terkurasi dengan ketelitian estetika atelier.',
  };
}

interface TemplateCollectionProps {
  onPreviewTemplate: (item: InvitationItem) => void;
  onOrderViaWhatsApp: (item: InvitationItem) => void;
  onOpenDedicatedDemo: (templateId: string) => void;
  onPreviewPortfolio?: (item: PortfolioItemData) => void;
}

export const TemplateCollection: React.FC<TemplateCollectionProps> = ({
  onPreviewTemplate,
  onOrderViaWhatsApp,
  onOpenDedicatedDemo,
  onPreviewPortfolio,
}) => {
  const [publicPortfolios, setPublicPortfolios] = useState<PortfolioItemData[]>([]);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    PortfolioStore.initFromSupabase().then(() => {
      setPublicPortfolios(PortfolioStore.getPublicItems());
    });
    const unsubscribe = PortfolioStore.subscribe(() => {
      setPublicPortfolios(PortfolioStore.getPublicItems());
    });
    return unsubscribe;
  }, []);

  // Intersection Observer for stagger reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.cardId;
            if (id) setVisibleCards((prev) => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const portfolioByTemplateId = React.useMemo(() => {
    const map = new Map<string, PortfolioItemData>();
    publicPortfolios.forEach((p) => {
      if (p.templateId && !map.has(p.templateId)) map.set(p.templateId, p);
    });
    return map;
  }, [publicPortfolios]);

  return (
    <section id="koleksi" className="py-20 sm:py-28 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-24">

        {/* =========================================================================
            KATALOG 1: SERI STANDAR - DITEMPATKAN DI ATAS
            Template standar dengan pilihan desain dan alur pemesanan mandiri.
           ========================================================================= */}
        <div id="katalog-standar" className="space-y-12">
          {/* Header Seri Standar */}
          <div className="space-y-4 max-w-3xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181816] text-[#C6A679] text-[11px] font-sans font-semibold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-[#C6A679]" />
              Seri Standar · {STANDARD_TEMPLATES.length} Pilihan Desain
            </div>
            <h2 className="font-serif font-normal text-[#181816] text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.18] tracking-[-0.015em]">
              Undangan Pernikahan Digital, Sesuai Gaya Anda.
            </h2>
            <p className="font-sans text-base text-[#716E68] font-light leading-relaxed max-w-2xl">
              Pilih desain yang paling dekat dengan cerita Anda, lihat demo interaktifnya, lalu pesan
              langsung dari katalog. Setiap template standar mendukung personalisasi data acara,
              musik, lokasi, RSVP, dan buku ucapan melalui portal klien.
            </p>

            {/* Feature Highlights Banner */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[12px] font-medium border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Harga mulai Rp{Math.min(...STANDARD_TEMPLATES.map((item) => item.price)).toLocaleString('id-ID')}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-100 text-stone-700 text-[12px] font-medium border border-stone-200">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Demo Interaktif
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-100 text-stone-700 text-[12px] font-medium border border-stone-200">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A679]" />
                Personalisasi Data Acara
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-100 text-stone-700 text-[12px] font-medium border border-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                RSVP &amp; Buku Ucapan
              </span>
            </div>
          </div>

          {/* Grid Seri Standar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            {STANDARD_TEMPLATES.map((item, idx) => {
              const isVisible = visibleCards.has(item.id);
              const handleCardClick = () => {
                if (item.hasDedicatedDemo) {
                  onOpenDedicatedDemo(item.id);
                } else {
                  onPreviewTemplate(item);
                }
              };

              return (
                <article
                  key={item.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(item.id, el);
                  }}
                  data-card-id={item.id}
                  className={`group flex flex-col bg-white border border-[#E8E5DF] hover:border-[#C6A679] rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_45px_rgba(198,166,121,0.18)] transition-all duration-500 ease-out ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-[15px]'
                  }`}
                  style={{ transitionDelay: `${idx * 90}ms` }}
                >
                  {/* Cover Image */}
                  <div
                    onClick={handleCardClick}
                    className="relative overflow-hidden bg-[#EDE9E0] cursor-pointer"
                    style={{ aspectRatio: '4/5' }}
                  >
                    <img
                      src={item.image}
                      alt={`Template undangan standar ${item.title} — sekarsiti`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#181816]/35 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF9F6]/95 text-[#181816] text-[12px] font-sans font-semibold shadow-sm translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="w-3.5 h-3.5" />
                        Buka Demo Interaktif
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                      <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase bg-[#181816] text-[#C6A679] px-2.5 py-1 rounded-full shadow-xs">
                        {item.categoryLabel || 'Seri Standar'}
                      </span>
                      {item.isBestSeller && (
                        <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase bg-[#C6A679] text-[#181816] px-2.5 py-1 rounded-full shadow-xs">
                          Paling Disukai
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3.5 right-3.5">
                      <span className="text-[11px] font-mono font-bold bg-white/90 backdrop-blur-sm text-stone-900 px-2 py-0.5 rounded-md shadow-xs">
                        Rp{item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1 justify-between">
                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-sans font-semibold tracking-[0.14em] text-[#C6A679] uppercase">
                        {item.styleLabel}
                      </p>
                      <h3
                        onClick={handleCardClick}
                        className="font-serif text-xl sm:text-2xl font-normal text-[#181816] leading-tight hover:text-[#C6A679] transition-colors duration-200 cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      <p className="font-sans text-[13px] text-[#716E68] font-light leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Features list mini */}
                    <div className="space-y-1.5 py-2 border-y border-[#F3EFEA] text-left">
                      {item.features?.slice(1, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#5A5751]">
                          <span className="w-1 h-1 rounded-full bg-[#C6A679]" />
                          <span className="line-clamp-1">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pricing + Action Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans text-base font-semibold text-[#181816]">
                          Rp{item.price.toLocaleString('id-ID')}
                        </span>
                        {item.originalPrice && (
                          <span className="font-sans text-[11px] text-[#B0AB9E] line-through font-light">
                            Rp{item.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleCardClick}
                          className="inline-flex items-center gap-1 text-[12px] font-sans font-medium text-[#716E68] hover:text-[#181816] py-1.5 px-3 rounded-full border border-[#E8E5DF] hover:border-[#181816] transition-all duration-200 cursor-pointer whitespace-nowrap"
                        >
                          Demo
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>

                        <button
                          onClick={() => onOrderViaWhatsApp(item)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-sans font-semibold text-[#FAF9F6] bg-[#181816] hover:bg-[#C6A679] py-1.5 px-3.5 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Pesan
                        </button>
                      </div>
                    </div>

                    {/* Footer completion note */}
                    <div className="flex items-center justify-between text-[11px] font-sans text-[#9C9891]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{item.completionTime}</span>
                      </div>
                      <span className="text-[10px] tracking-wide text-[#8C734B] font-medium">
                        Portal Data Klien
                      </span>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ——— Section Divider & Transition to Atelier Collection ——— */}
        <div className="relative py-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8E5DF]" />
          </div>
          <div className="relative px-6 py-2.5 bg-[#FAF9F6] border border-[#E8E5DF] rounded-full flex items-center gap-2.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#C6A679]" />
            <span className="text-[11px] font-sans font-semibold tracking-[0.16em] uppercase text-[#716E68]">
              Atau Eksplorasi Koleksi Editorial Atelier Penuh Kurator di Bawah Ini
            </span>
          </div>
        </div>

        {/* =========================================================================
            KATALOG 2: SERI EDITORIAL ATELIER (KATALOG ASLI SEBELUMNYA)
            Ditempatkan di bawah Seri Standar.
            Menampilkan seluruh 14 template asli tanpa tombol "Lihat Lebih Banyak".
           ========================================================================= */}
        <div id="katalog-editorial" className="space-y-12">
          {/* Section Header Editorial */}
          <div className="space-y-5 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2.5">
              <span className="block w-6 h-[1px] bg-[#C6A679]" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
                Seri Editorial Atelier 2025
              </p>
            </div>
            <h2 className="font-serif font-normal text-[#181816] text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.18] tracking-[-0.015em] text-balance">
              Koleksi yang Berbicara<br className="hidden sm:block" /> Melalui Rasa.
            </h2>
            <p className="font-sans text-base text-[#716E68] font-light leading-relaxed max-w-lg">
              Pilihlah nuansa yang paling dekat dengan kepribadian berdua — dari minimalisme monokrom,
              kehangatan kertas arsip, hingga nostalgi rol film sinematik. Didukung pendampingan kurator desainer
              dan fleksibilitas revisi penuh.
            </p>
          </div>

          {/* Template Grid — All 14 Original Editorial Templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {TEMPLATES.map((template, idx) => {
              const matching = portfolioByTemplateId.get(template.id);
              const isReal = Boolean(matching && !matching.id.startsWith('PF-DEFAULT-'));
              const cardImage = isReal && (matching!.coverImage || matching!.heroImage)
                ? (matching!.coverImage || matching!.heroImage)
                : template.image;

              const { seriesLabel, shortDesc } = getEditorialMeta(template.id);
              const isVisible = visibleCards.has(template.id);

              const handleClick = () => {
                if (isReal && onPreviewPortfolio) onPreviewPortfolio(matching!);
                else if (template.hasDedicatedDemo) onOpenDedicatedDemo(template.id);
                else onPreviewTemplate(template);
              };

              return (
                <article
                  key={template.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(template.id, el);
                  }}
                  data-card-id={template.id}
                  className={`group flex flex-col bg-white border border-[#E8E5DF] hover:border-[#C6A679]/60 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-[15px]'
                  }`}
                  style={{ transitionDelay: `${(idx % 3) * 80}ms` }}
                >

                  {/* ——— Cover Image (Portrait 4:5 ratio) ——— */}
                  <div
                    onClick={handleClick}
                    className="relative overflow-hidden bg-[#EDE9E0] cursor-pointer"
                    style={{ aspectRatio: '4/5' }}
                  >
                    <img
                      src={cardImage}
                      alt={`Template undangan digital ${template.title} — sekarsiti`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#181816]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF9F6]/95 text-[#181816] text-[12px] font-sans font-semibold shadow-sm translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="w-3.5 h-3.5" />
                        Buka Demo
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                      {template.isBestSeller && (
                        <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase bg-[#181816] text-[#C6A679] px-2.5 py-1 rounded-full">
                          Terlaris
                        </span>
                      )}
                      {template.isNew && (
                        <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase bg-[#C6A679] text-[#181816] px-2.5 py-1 rounded-full">
                          Baru
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ——— Card Content ——— */}
                  <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1 justify-between">

                    <div className="space-y-2 text-left">
                      {/* Series label */}
                      <p className="text-[10px] font-sans font-semibold tracking-[0.14em] text-[#C6A679] uppercase">
                        {seriesLabel}
                      </p>

                      {/* Title */}
                      <h3
                        onClick={handleClick}
                        className="font-serif text-xl sm:text-2xl font-normal text-[#181816] leading-tight hover:text-[#C6A679] transition-colors duration-200 cursor-pointer"
                      >
                        {template.title}
                      </h3>

                      {/* Short editorial description */}
                      <p className="font-sans text-[13px] text-[#716E68] font-light leading-relaxed line-clamp-2">
                        {shortDesc}
                      </p>
                    </div>

                    {/* ——— Footer: Price + Actions ——— */}
                    <div className="pt-3 border-t border-[#F0EDE8] flex items-center justify-between gap-2">

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans text-sm font-semibold text-[#181816]">
                          Rp{template.price.toLocaleString('id-ID')}
                        </span>
                        {template.originalPrice && (
                          <span className="font-sans text-[11px] text-[#B0AB9E] line-through font-light">
                            Rp{template.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleClick}
                          className="inline-flex items-center gap-1 text-[12px] font-sans font-medium text-[#716E68] hover:text-[#181816] py-1.5 px-3 rounded-full border border-[#E8E5DF] hover:border-[#181816] transition-all duration-200 cursor-pointer whitespace-nowrap"
                        >
                          Demo
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>

                        <button
                          onClick={() => onOrderViaWhatsApp(template)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-sans font-semibold text-[#FAF9F6] bg-[#181816] hover:bg-[#C6A679] py-1.5 px-3.5 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Pesan
                        </button>
                      </div>

                    </div>

                    {/* Completion time & Included Value */}
                    <div className="flex items-center justify-between gap-2 text-[11px] font-sans text-[#9C9891]">
                      <div className="flex items-center gap-2">
                        <span className="block w-3 h-[1px] bg-[#C6A679]" />
                        <span>{template.completionTime}</span>
                      </div>
                      <span className="text-[10px] tracking-wide text-[#8C734B] font-medium">
                        Termasuk Ruang Mempelai
                      </span>
                    </div>

                  </div>

                </article>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
