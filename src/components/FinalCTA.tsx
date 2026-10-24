import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FinalCTAProps {
  onExploreCollection: () => void;
  onContactWhatsApp?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onExploreCollection,
  onContactWhatsApp,
}) => {
  return (
    <section className="relative bg-[#FAF9F6] border-t border-[#E8E5DF] py-24 sm:py-36 px-6 sm:px-8 overflow-hidden">

      {/* Decorative hairline grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#E8E5DF]/60" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#E8E5DF]/60" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center space-y-8">

        <div className="inline-flex items-center gap-2.5 mx-auto justify-center">
          <span className="block w-6 h-[1px] bg-[#C6A679]" />
          <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
            Koleksi Sekarsiti
          </p>
          <span className="block w-6 h-[1px] bg-[#C6A679]" />
        </div>

        <h2 className="font-serif font-normal text-[#181816] text-3xl sm:text-4xl lg:text-[2.85rem] leading-[1.18] tracking-[-0.015em] text-balance">
          Setiap pasangan berhak atas undangan<br className="hidden sm:block" /> yang mencerminkan dirinya.
        </h2>

        <p className="font-sans text-base sm:text-lg text-[#716E68] font-light leading-relaxed">
          Berikan sambutan pertama yang berkesan kepada para tamu terkasih, dan abadikan momen bahagianya sesuai dengan kepribadian Anda berdua.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          {onContactWhatsApp && (
            <button
              onClick={onContactWhatsApp}
              className="group inline-flex items-center gap-2 px-8 py-3.5 text-[13px] font-sans font-semibold text-[#FAF9F6] bg-[#181816] hover:bg-[#C6A679] hover:text-[#181816] rounded-full transition-all duration-300 active:scale-[0.97] cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Konsultasikan Undangan via WhatsApp</span>
            </button>
          )}

          <button
            onClick={onExploreCollection}
            className="group inline-flex items-center gap-2 px-6 py-3.5 text-[13px] font-sans font-medium text-[#181816] hover:text-[#C6A679] border border-[#E8E5DF] hover:border-[#C6A679] bg-white rounded-full transition-all duration-300 cursor-pointer"
          >
            <span>Jelajahi Koleksi Desain</span>
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">↗</span>
          </button>
        </div>

        {/* Assurance Note */}
        <p className="text-[11px] font-sans text-[#9C9891] tracking-wide pt-2">
          Konsultasi Gratis · Kelola Nyaman di Ruang Mempelai · Tersedia Add-On Kapsul Kenangan
        </p>

      </div>
    </section>
  );
};
