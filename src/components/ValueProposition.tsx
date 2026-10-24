import React from 'react';

const PILLARS = [
  {
    num: '01',
    tag: 'KURASI ESTETIKA',
    title: 'Tata Letak Bergaya Editorial',
    body: 'Setiap siluet, palet warna, dan pilihan tipografi disusun selayaknya lembaran majalah seni—menghadirkan sambutan hangat nan berwibawa bagi setiap tamu.',
  },
  {
    num: '02',
    tag: 'KENDALI PENUH',
    title: 'Leluasa Mengatur Tanpa Menunggu',
    body: 'Tak perlu menunggu antrean revisi lewat pesan singkat. Melalui Ruang Mempelai pribadi, Anda bebas memperbarui foto, memilih lagu, dan menyusun nama tamu kapan saja.',
  },
  {
    num: '03',
    tag: 'LAYANAN TAMBAHAN',
    title: 'Add-On Kapsul Kenangan Abadi',
    body: 'Ingin menyimpan undangan bahkan setelah acara usai? Tersedia pilihan add-on arsip pribadi agar kisah indah pernikahan Anda tetap dapat dibuka selamanya.',
  },
];

export const ValueProposition: React.FC = () => {
  return (
    <section className="border-y border-[#E8E5DF] bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E8E5DF]">
          {PILLARS.map(({ num, tag, title, body }) => (
            <div
              key={num}
              className="group py-10 px-0 md:px-10 first:pl-0 last:pr-0 flex flex-col gap-3 text-left transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-[12px] tracking-[0.18em] text-[#C6A679] font-normal">
                  {num} /
                </span>
                <span className="text-[10px] font-sans font-semibold tracking-[0.14em] text-[#9C9891] group-hover:text-[#C6A679] transition-colors">
                  {tag}
                </span>
              </div>
              <div className="w-6 group-hover:w-12 h-[1px] bg-[#C6A679] transition-all duration-500" />
              <h3 className="font-serif text-lg font-normal text-[#181816] tracking-tight pt-1">
                {title}
              </h3>
              <p className="font-sans text-[13px] text-[#716E68] font-light leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
