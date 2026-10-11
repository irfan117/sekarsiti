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

  // The primary 7 templates converted with interactive demos
  const primaryTemplates = TEMPLATES.slice(0, 7);
  // Additional curated designs revealed upon clicking "Lihat semua desain"
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

        {/* Showcase Portfolio Real Client Section */}
        {publicPortfolios.length > 0 && (
          <div className="space-y-6 pt-4 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#BD9A5F]" />
              <h3 className="text-xl sm:text-2xl font-serif text-[#2C2E28]">
                Portofolio Undangan Klien
              </h3>
            </div>
            <p className="text-sm text-[#55594F] font-light max-w-2xl">
              Hasil karya undangan pernikahan digital dari pasangan yang telah mempercayakan momen bahagia mereka kepada Sekarsiti Studio.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {publicPortfolios.map((portfolio) => (
                <article
                  key={portfolio.id}
                  className="group flex flex-col justify-between bg-white rounded-2xl border border-[#BD9A5F]/40 ring-1 ring-[#BD9A5F]/20 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  <div
                    onClick={() => onPreviewPortfolio && onPreviewPortfolio(portfolio)}
                    className="relative aspect-4/3 overflow-hidden bg-[#EFECE4] cursor-pointer"
                  >
                    <img
                      src={portfolio.coverImage || portfolio.heroImage}
                      alt={`Portofolio ${portfolio.title}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#BD9A5F] text-white text-[10px] font-semibold tracking-wider uppercase shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                    
                    </div>

                    <div className="absolute inset-0 bg-[#2C2E28]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#414A35] text-xs font-medium shadow-sm">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Undangan Portofolio</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-[#7A8B74]">
                        <span className="font-sans font-medium uppercase tracking-wider">{portfolio.templateId}</span>
                        <span className="font-serif italic">{portfolio.city || 'Indonesia'}</span>
                      </div>
                      <h4
                        onClick={() => onPreviewPortfolio && onPreviewPortfolio(portfolio)}
                        className="text-xl font-serif font-semibold text-[#2C2E28] group-hover:text-[#414A35] transition-colors cursor-pointer"
                      >
                        {portfolio.title}
                      </h4>
                      <p className="text-xs text-[#6B6F63] font-light line-clamp-2">
                        "{portfolio.quoteText}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F2EFE8] flex items-center justify-between">
                      <span className="text-xs text-[#7A8B74]">
                        {portfolio.eventDate}
                      </span>
                      <button
                        onClick={() => onPreviewPortfolio && onPreviewPortfolio(portfolio)}
                        className="inline-flex items-center gap-1 text-xs text-[#1B2A22] font-semibold py-1 px-3 rounded-full bg-[#FAF7F2] hover:bg-[#EBE6DD] border border-[#BD9A5F]/40 transition-colors cursor-pointer"
                      >
                        <span>Lihat Demo</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#BD9A5F]" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedTemplates.map((template) => (
            <article
              key={template.id}
              className={`group flex flex-col justify-between bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-md ${
                template.hasDedicatedDemo
                  ? 'border-[#BD9A5F]/80 ring-1 ring-[#BD9A5F]/30'
                  : 'border-[#EBE6DD] hover:border-[#D1C9BC]'
              }`}
            >
              
              {/* Product Preview Image */}
              <div 
                onClick={() => {
                  if (template.hasDedicatedDemo) {
                    onOpenDedicatedDemo(template.id);
                  } else {
                    onPreviewTemplate(template);
                  }
                }}
                className="relative aspect-4/3 overflow-hidden bg-[#EFECE4] cursor-pointer"
              >
                <img
                  src={template.image}
                  alt={`Template undangan digital ${template.title} oleh sekarsiti`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />


                {/* Subtle overlay hint */}
                <div className="absolute inset-0 bg-[#2C2E28]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#414A35] text-xs font-medium shadow-sm">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{template.hasDedicatedDemo ? 'Buka Demo Halaman Penuh' : 'Lihat demo'}</span>
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
                    onClick={() => {
                      if (template.hasDedicatedDemo) {
                        onOpenDedicatedDemo(template.id);
                      } else {
                        onPreviewTemplate(template);
                      }
                    }}
                    className="text-2xl font-serif font-normal text-[#2C2E28] group-hover:text-[#414A35] transition-colors cursor-pointer"
                  >
                    {template.title}
                  </h3>

                  <p className="text-xs text-[#6B6F63] font-light leading-relaxed line-clamp-2">
                    {template.description}
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
                    {template.hasDedicatedDemo ? (
                      <button
                        onClick={() => onOpenDedicatedDemo(template.id)}
                        className="inline-flex items-center gap-1 text-xs text-[#1B2A22] font-semibold py-1 px-3 rounded-full bg-[#EBE6DD] hover:bg-[#ded6c9] transition-colors cursor-pointer"
                        title="Buka halaman demo React utuh"
                      >
                        <span>Demo Web</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#7A8B74]" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onPreviewTemplate(template)}
                        className="inline-flex items-center gap-1 text-xs text-[#55594F] hover:text-[#414A35] font-medium py-1 px-2.5 rounded-full hover:bg-[#F7F5EF] transition-colors cursor-pointer"
                      >
                        <span>Lihat detail</span>
                        <ArrowUpRight className="w-3 h-3 text-[#7A8B74]" />
                      </button>
                    )}

                    <button
                      onClick={() => onOrderViaWhatsApp(template)}
                      className="inline-flex items-center justify-center p-2 rounded-full bg-[#414A35] hover:bg-[#323929] text-[#F7F5EF] transition-all cursor-pointer"
                      title="Pesan template ini via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </article>
          ))}
        </div>

        {/* Secondary Link: "Lihat semua desain" */}
        <div className="text-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[#414A35] hover:text-[#2C2E28] border-b border-[#414A35]/30 hover:border-[#414A35] pb-0.5 transition-all cursor-pointer"
          >
            <span>{showAll ? 'Tampilkan desain pilihan saja' : 'Lihat semua desain'}</span>
            {showAll ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#7A8B74]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#7A8B74]" />
            )}
          </button>
        </div>

      </div>
    </section>
  );
};
