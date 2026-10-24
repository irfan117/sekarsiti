import React from 'react';

const STEPS = [
  {
    num: '01',
    badge: 'PILIH KARAKTER',
    title: 'Pilih Seri & Terima Akses',
    desc: 'Telusuri koleksi desain kami dan tentukan estetika yang paling mewakili kisah cinta berdua. Anda akan langsung mendapatkan akses pribadi menuju Ruang Mempelai.',
  },
  {
    num: '02',
    badge: 'PENYELARASAN KISAH',
    title: 'Susun Cerita & Foto dengan Nyaman',
    desc: 'Lengkapi rincian acara, pilih alunan lagu, dan masukkan foto-foto prewedding terbaik dengan leluasa langsung dari gawai Anda tanpa harus menunggu antrean revisi.',
  },
  {
    num: '03',
    badge: 'SIAP DIBAGIKAN',
    title: 'Bagikan & Abadikan Momen',
    desc: 'Kirimkan undangan bersapaan personal kepada keluarga dan sahabat dalam satu ketukan. Anda juga dapat memilih add-on Kapsul Kenangan untuk menyimpannya selamanya.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="cara-kerja" className="py-24 sm:py-32 bg-[#FAF9F6] border-t border-[#E8E5DF]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-16">

        {/* Header */}
        <div className="space-y-5 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2.5">
            <span className="block w-6 h-[1px] bg-[#C6A679]" />
            <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
              Cara Kerja
            </p>
          </div>
          <h2 className="font-serif font-normal text-[#181816] text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.18] tracking-[-0.015em] text-balance">
            Tiga langkah tenang menuju<br className="hidden sm:block" /> undangan impian Anda.
          </h2>
        </div>

        {/* Steps — horizontal editorial layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-[#E8E5DF]">
          {STEPS.map(({ num, badge, title, desc }) => (
            <div
              key={num}
              className="group flex flex-col gap-5 py-8 md:py-0 md:px-10 first:pl-0 last:pr-0 border-t border-[#E8E5DF] md:border-t-0 first:border-t-0"
            >
              <div className="flex items-baseline justify-between">
                {/* Large transparent serif number */}
                <span className="font-serif text-[4.5rem] sm:text-[5.5rem] leading-none font-normal text-[#E8E5DF] group-hover:text-[#C6A679]/40 transition-colors duration-500 select-none -mb-3">
                  {num}
                </span>
                <span className="text-[10px] font-sans font-semibold tracking-[0.15em] text-[#C6A679] uppercase">
                  {badge}
                </span>
              </div>

              {/* Hairline accent */}
              <div className="w-8 group-hover:w-16 h-[1px] bg-[#C6A679] transition-all duration-500" />

              <div className="space-y-2.5 text-left">
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
