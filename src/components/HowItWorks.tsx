import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Pilih Karakter Desain',
    desc: 'Telusuri arsip template dan tentukan estetika yang mencerminkan perayaanmu.',
  },
  {
    num: '02',
    title: 'Penyelarasan Informasi',
    desc: 'Kirimkan rincian kisah, tanggal, dan lokasi. Tim kami memastikan setiap detail tertata rapi.',
  },
  {
    num: '03',
    title: 'Siap Dibagikan',
    desc: 'Terima tautan undangan digital personal yang siap dikirimkan kepada para tamu terkasih.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="cara-kerja" className="py-24 sm:py-32 bg-[#FAF9F6] border-t border-[#E8E5DF]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-16">

        {/* Header */}
        <div className="space-y-5 max-w-xl text-left">
          <div className="inline-flex items-center gap-2.5">
            <span className="block w-6 h-[1px] bg-[#C6A679]" />
            <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
              Cara Kerja
            </p>
          </div>
          <h2 className="font-serif font-normal text-[#181816] text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.18] tracking-[-0.015em] text-balance">
            Tiga langkah menuju<br className="hidden sm:block" /> undangan impian.
          </h2>
        </div>

        {/* Steps — horizontal editorial layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-[#E8E5DF]">
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="flex flex-col gap-5 py-8 md:py-0 md:px-12 first:pl-0 last:pr-0 border-t border-[#E8E5DF] md:border-t-0 first:border-t-0">

              {/* Large transparent serif number */}
              <span className="font-serif text-[5rem] sm:text-[6rem] leading-none font-normal text-[#E8E5DF] select-none -mb-4">
                {num}
              </span>

              {/* Hairline accent */}
              <div className="w-8 h-[1px] bg-[#C6A679]" />

              <div className="space-y-2.5">
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#181816] leading-snug">
                  {title}
                </h3>
                <p className="font-sans text-[13px] sm:text-sm text-[#716E68] font-light leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
