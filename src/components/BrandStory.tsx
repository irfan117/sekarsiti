import React from 'react';

export const BrandStory: React.FC = () => {
  return (
    <section id="tentang" className="py-24 sm:py-32 bg-[#181816] border-t border-[#2C2B29]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">

          {/* Photograph */}
          <div className="md:col-span-5 flex justify-center md:justify-start">
            <div className="relative w-full max-w-[340px]">
              <div
                className="rounded-2xl overflow-hidden border border-[#2C2B29] shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                style={{ aspectRatio: '4/5' }}
              >
                <img
                  src="/images/brand_story_botanical_1790831303860.jpg"
                  alt="Detail kertas buatan tangan dan ranting zaitun sekarsiti"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating caption */}
              <div className="absolute -bottom-4 -right-4 bg-[#FAF9F6] rounded-xl px-4 py-3 shadow-sm border border-[#E8E5DF]">
                <p className="text-[11px] font-sans font-semibold text-[#181816] tracking-wide">
                  Handcrafted Atelier
                </p>
                <p className="text-[10px] font-sans text-[#716E68] mt-0.5">
                  Sekarsiti Studio, ID
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-7 space-y-7 text-left">

            <div className="inline-flex items-center gap-2.5">
              <span className="block w-6 h-[1px] bg-[#C6A679]" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
                Tentang Sekarsiti
              </p>
            </div>

            <h2 className="font-serif font-normal text-[#FAF9F6] text-3xl sm:text-4xl leading-[1.2] tracking-[-0.015em] text-balance">
              Kisah istimewa tidak memerlukan ornamen berlebihan.<br className="hidden sm:block" />
              <em className="not-italic text-[#C6A679]">Hanya rasa yang tertata.</em>
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#9C9891] font-light leading-relaxed max-w-[500px]">
              Sekarsiti berdiri di antara tradisi perayaan dan estetika modern. Kami percaya undangan bukan sekadar lembar pengumuman, melainkan sambutan pertama yang menghangatkan hati para penerimanya.
            </p>

            {/* Quiet quote */}
            <blockquote className="pl-5 border-l-2 border-[#C6A679]">
              <p className="font-serif italic text-lg text-[#C6A679] leading-relaxed">
                "Setiap bingkai dirancang dengan tangan yang penuh perhatian, untuk momen yang tidak terulang."
              </p>
            </blockquote>

          </div>

        </div>
      </div>
    </section>
  );
};
