import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Eye, MessageCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { InvitationItem } from '../types';
import { TEMPLATES } from '../data/catalog';
import { PortfolioStore } from '../admin/portfolioStore';
import { PortfolioItemData } from '../types/portfolio';

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
  onPreviewPortfolio
}) => {
  const [showAll, setShowAll] = useState(false);
  const [publicPortfolios, setPublicPortfolios] = useState<PortfolioItemData[]>([]);

  useEffect(() => {
    PortfolioStore.initFromSupabase().then(() => {
      setPublicPortfolios(PortfolioStore.getPublicItems());
    });
    const unsubscribe = PortfolioStore.subscribe(() => {
      setPublicPortfolios(PortfolioStore.getPublicItems());
    });
    return unsubscribe;
  }, []);

  // Map public portfolio items by templateId for fast override lookup
  const portfolioByTemplateId = React.useMemo(() => {
    const map = new Map<string, PortfolioItemData>();
    publicPortfolios.forEach(p => {
      if (p.templateId && !map.has(p.templateId)) {
        map.set(p.templateId, p);
      }
    });
    return map;
  }, [publicPortfolios]);

  // Primary templates
  const primaryTemplates = TEMPLATES.slice(0, 7);
  const displayedTemplates = showAll ? TEMPLATES : primaryTemplates;

  return (
    <section id="koleksi" className="py-24 sm:py-32 bg-[#F7F5EF]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-xl space-y-4 text-left">
          <p className="text-xs font-sans font-semibold tracking-widest text-[#414A35]/70 uppercase">
            KOLEKSI TEMPLATE
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-normal text-[#2C2E28] leading-[1.2] text-balance">
            Temukan desain favoritmu.
          </h2>
          <p className="text-base text-[#55594F] font-light leading-relaxed">
            Dari seri editorial modern, kemewahan Art Deco, sage minimalis, buku jurnal vintage, rol film sinematik retro, cetak biru arsitektur, hingga atlas perjalanan — pilih yang paling mencerminkan kisah cintamu.
          </p>
        </div>

        {/* Unified Balanced Grid of Template Cards (With Real Client Overrides) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedTemplates.map((template) => {
            const matchingPortfolio = portfolioByTemplateId.get(template.id);
            const isOverriddenByRealClient = Boolean(matchingPortfolio);

            // Item metadata to render (overridden by real client portfolio if present)
            const cardTitle = isOverriddenByRealClient ? matchingPortfolio!.title : template.title;
            const cardImage = isOverriddenByRealClient && (matchingPortfolio!.coverImage || matchingPortfolio!.heroImage)
              ? (matchingPortfolio!.coverImage || matchingPortfolio!.heroImage)
              : template.image;
            const cardSubtitle = template.description;

            const handleCardClick = () => {
              if (isOverriddenByRealClient && onPreviewPortfolio) {
                onPreviewPortfolio(matchingPortfolio!);
              } else if (template.hasDedicatedDemo) {
                onOpenDedicatedDemo(template.id);
              } else {
                onPreviewTemplate(template);
              }
            };

            return (
              <article
                key={template.id}
                className={`group flex flex-col justify-between bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-md ${
                  template.hasDedicatedDemo || isOverriddenByRealClient
                    ? 'border-[#BD9A5F]/80 ring-1 ring-[#BD9A5F]/30'
                    : 'border-[#EBE6DD] hover:border-[#D1C9BC]'
                }`}
              >
                
                {/* Product Preview Image */}
                <div 
                  onClick={handleCardClick}
                  className="relative aspect-4/3 overflow-hidden bg-[#EFECE4] cursor-pointer"
                >
                  <img
                    src={cardImage}
                    alt={`Template undangan digital ${cardTitle} oleh sekarsiti`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />

                  {/* Subtle overlay hint */}
                  <div className="absolute inset-0 bg-[#2C2E28]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#414A35] text-xs font-medium shadow-sm">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka Demo Undangan</span>
                    </span>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between text-xs text-[#7A8B74]">
                      <span className="font-sans tracking-wide">{template.styleLabel}</span>
                      <span className="font-serif italic">{template.completionTime}</span>
                    </div>

                    <h3 
                      onClick={handleCardClick}
                      className="text-2xl font-serif font-normal text-[#2C2E28] group-hover:text-[#414A35] transition-colors cursor-pointer"
                    >
                      {cardTitle}
                    </h3>

                    <p className="text-xs text-[#6B6F63] font-light leading-relaxed line-clamp-2">
                      {cardSubtitle}
                    </p>

                  </div>

                  {/* Pricing & Interactive Action Links */}
                  <div className="pt-4 border-t border-[#F2EFE8] flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-serif font-medium text-[#414A35]">
                        Rp{template.price.toLocaleString('id-ID')}
                      </span>
                      {template.originalPrice && (
                        <span className="text-[11px] text-[#A39E93] line-through font-light">
                          Rp{template.originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCardClick}
                        className="inline-flex items-center gap-1 text-xs text-[#1B2A22] font-semibold py-1 px-3 rounded-full bg-[#EBE6DD] hover:bg-[#ded6c9] transition-colors cursor-pointer"
                        title="Buka halaman demo undangan"
                      >
                        <span>Lihat Demo</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#7A8B74]" />
                      </button>

                      <button
                        onClick={() => onOrderViaWhatsApp(template)}
                        className="inline-flex items-center gap-1 text-xs text-white font-semibold py-1.5 px-3.5 rounded-full bg-[#414A35] hover:bg-[#2C2E28] transition-colors cursor-pointer shadow-2xs"
                        title="Pesan template ini lewat WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Pesan</span>
                      </button>
                    </div>
                  </div>

                </div>

              </article>
            );
          })}
        </div>

        {/* Toggle Show All Templates */}
        {TEMPLATES.length > 7 && (
          <div className="text-center pt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D1C9BC] hover:border-[#414A35] text-[#414A35] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>{showAll ? 'Sembunyikan Sebagian Desain' : 'Lihat Semua Desain Template'}</span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
