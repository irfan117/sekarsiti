import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Eye, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { InvitationItem } from '../types';
import { TEMPLATES } from '../data/catalog';
import { PortfolioStore } from '../admin/portfolioStore';
import { PortfolioItemData } from '../types/portfolio';

// Per-template editorial labels & short descriptions
const EDITORIAL_META: Record<
  string,
  { seriesLabel: string; shortDesc: string }
> = {
  'ruang-rasa': {
    seriesLabel: 'SERI NO. 01 · EDITORIAL MONOCHROME',
    shortDesc: 'Eksplorasi tipografi murni, ruang kosong yang bernapas, dan ketenangan kontemporer.',
  },
  'malam-zamrud': {
    seriesLabel: 'SERI NO. 02 · ART DECO & ONYX',
    shortDesc: 'Kemegahan malam beraksen logam kuningan untuk perayaan yang intim nan berwibawa.',
  },
  'setangkai': {
    seriesLabel: 'SERI NO. 03 · SAGE & FOLIAGE',
    shortDesc: 'Keanggunan botanical sage yang lembut, hadir dalam tata letak dual-pane yang sinematik.',
  },
  'suasana': {
    seriesLabel: 'SERI NO. 04 · BOTANICAL ARCHIVE',
    shortDesc: 'Sentuhan tekstur kertas gading dan lipatan interaktif bergaya buku kenangan.',
  },
  'lembayung': {
    seriesLabel: 'SERI NO. 05 · CINEMATIC 35MM',
    shortDesc: 'Nostalgia rol film sinematik dengan gerbang sampul dua pintu dan polaroid berserak.',
  },
  'cetak-biru': {
    seriesLabel: 'SERI NO. 06 · BLUEPRINT ARCHIVIST',
    shortDesc: 'Presisi cetak biru arsitektur dengan tipografi tabular dan komposisi garis geometris.',
  },
  'atlas-cinta': {
    seriesLabel: "SERI NO. 07 · TRAVELLER'S ATLAS",
    shortDesc: 'Perpaduan peta perjalanan dan kisah yang mengalir dalam format atlas editorial.',
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
  const [showAll, setShowAll] = useState(false);
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
  }, [showAll]);

  const portfolioByTemplateId = React.useMemo(() => {
    const map = new Map<string, PortfolioItemData>();
    publicPortfolios.forEach((p) => {
      if (p.templateId && !map.has(p.templateId)) map.set(p.templateId, p);
    });
    return map;
  }, [publicPortfolios]);

  const primaryTemplates = TEMPLATES.slice(0, 7);
  const displayedTemplates = showAll ? TEMPLATES : primaryTemplates;

  return (
    <section id="koleksi" className="py-24 sm:py-32 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">

        {/* ——— Section Header ——— */}
        <div className="space-y-5 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2.5">
            <span className="block w-6 h-[1px] bg-[#C6A679]" />
            <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
              Seri Desain 2025
            </p>
          </div>
          <h2 className="font-serif font-normal text-[#181816] text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.18] tracking-[-0.015em] text-balance">
            Koleksi yang Berbicara<br className="hidden sm:block" /> Melalui Rasa.
          </h2>
          <p className="font-sans text-base text-[#716E68] font-light leading-relaxed max-w-lg">
            Pilihlah nuansa yang paling dekat dengan kepribadian berdua — dari minimalisme monokrom, kehangatan kertas arsip, hingga nostalgi rol film sinematik.
          </p>
        </div>

        {/* ——— Template Grid — Gallery Style ——— */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {displayedTemplates.map((template, idx) => {
            const matching = portfolioByTemplateId.get(template.id);
            const isReal = Boolean(matching);
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

                  {/* Completion time */}
                  <div className="flex items-center gap-2">
                    <span className="block w-3 h-[1px] bg-[#C6A679]" />
                    <span className="text-[11px] font-sans text-[#B0AB9E] tracking-wide">
                      {template.completionTime}
                    </span>
                  </div>

                </div>

              </article>
            );
          })}
        </div>

        {/* Show all toggle */}
        {TEMPLATES.length > 7 && (
          <div className="text-center pt-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E8E5DF] hover:border-[#C6A679] text-[#716E68] hover:text-[#181816] text-[13px] font-sans font-medium transition-all duration-200 cursor-pointer"
            >
              <span>{showAll ? 'Sembunyikan Sebagian' : 'Lihat Seluruh Koleksi'}</span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
