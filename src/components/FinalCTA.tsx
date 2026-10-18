import React from 'react';

interface FinalCTAProps {
  onExploreCollection: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onExploreCollection }) => {
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
          Setiap pasangan berhak atas<br className="hidden sm:block" /> undangan yang mencerminkan dirinya.
        </h2>

        <p className="font-sans text-base sm:text-lg text-[#716E68] font-light leading-relaxed">
          Temukan desain yang paling dekat dengan kepribadian berdua dari koleksi eksklusif Sekarsiti.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreCollection}
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-[13px] font-sans font-semibold text-[#FAF9F6] bg-[#181816] hover:bg-[#C6A679] rounded-full transition-all duration-300 active:scale-[0.97] cursor-pointer shadow-sm"
          >
            <span>Jelajahi Koleksi</span>
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">↗</span>
          </button>
        </div>

      </div>
    </section>
  );
};
