import React from 'react';

const PILLARS = [
  {
    num: '01',
    title: 'Kurasi Estetika',
    body: 'Setiap siluet, palet, dan pilihan huruf disusun dengan ketelitian editorial.',
  },
  {
    num: '02',
    title: 'Alur Tanpa Hambatan',
    body: 'Siap dibagikan hanya dalam hitungan hari, dirancang responsif di setiap genggaman gawai.',
  },
  {
    num: '03',
    title: 'Nilai yang Jujur',
    body: 'Kualitas desain atelier berstandar tinggi dengan penawaran yang tetap bersahabat.',
  },
];

export const ValueProposition: React.FC = () => {
  return (
    <section className="border-y border-[#E8E5DF] bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E8E5DF]">
          {PILLARS.map(({ num, title, body }) => (
            <div key={num} className="py-9 px-0 md:px-10 first:pl-0 last:pr-0 flex flex-col gap-3 text-left">
              <span className="font-serif text-[11px] tracking-[0.18em] text-[#C6A679] font-normal">
                {num} /
              </span>
              <h3 className="font-sans text-sm font-semibold text-[#181816] tracking-wide">
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
