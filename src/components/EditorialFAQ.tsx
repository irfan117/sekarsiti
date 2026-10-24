import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Berapa lama masa aktif undangan pernikahan saya?',
    answer:
      'Undangan pernikahan Anda aktif selama 1 hingga 3 bulan penuh—mencakup masa persiapan menyebarkan undangan kepada para tamu hingga rangkaian hari bahagia selesai, tanpa ada biaya langganan bulanan yang mengikat.',
  },
  {
    question: 'Apa itu Add-On Kapsul Kenangan dan apakah dikenakan biaya tambahan?',
    answer:
      'Kapsul Kenangan adalah layanan tambahan opsional (dengan biaya tambahan satu kali yang terjangkau) bagi pasangan yang ingin memiliki arsip undangan mereka selamanya setelah masa tayang 1–3 bulan berakhir. Seluruh tampilan undangan, potret prewedding, kisah cinta, serta lagu pengiring akan dikemas menjadi arsip pribadi yang dapat Anda simpan dan buka kembali kapan saja di laptop atau komputer rumah—bahkan puluhan tahun mendatang tanpa perlu sambungan internet.',
  },
  {
    question: 'Apakah saya bisa mengatur sendiri foto dan detail acara setelah memesan?',
    answer:
      'Tentu. Setiap pemesanan sudah dilengkapi akses menuju Ruang Mempelai pribadi. Anda dan pasangan leluasa memasukkan foto, memilih lagu latar, serta memperbarui susunan waktu maupun lokasi acara kapan saja langsung dari ponsel tanpa harus menunggu antrean revisi.',
  },
  {
    question: 'Apakah ada batasan jumlah foto yang bisa dimasukkan ke dalam undangan?',
    answer:
      'Anda leluasa memasukkan foto-foto prewedding terbaik untuk sampul utama, potret mempelai, babak perjalanan cinta, hingga galeri dokumentasi. Seluruh foto akan disesuaikan secara otomatis agar tetap jernih namun ringan saat dibuka oleh para tamu.',
  },
  {
    question: 'Bagaimana cara mencantumkan nama tamu yang berbeda-beda di setiap undangan?',
    answer:
      'Di dalam Ruang Mempelai sudah tersedia fitur penyusun sapaan tamu. Anda cukup menuliskan daftar nama keluarga dan sahabat (atau memasukkannya sekaligus dari tabel daftar tamu), lalu mengirimkan pesan undangan yang sudah terpersonalisasi ke WhatsApp masing-masing tamu hanya dalam satu ketukan.',
  },
  {
    question: 'Bagaimana jika ada perubahan mendadak pada jam atau lokasi acara menjelang hari H?',
    answer:
      'Anda tidak perlu khawatir. Cukup buka Ruang Mempelai dari ponsel Anda, perbarui jadwal atau titik lokasi peta, lalu simpan. Seluruh tautan undangan yang sudah diterima oleh para tamu akan langsung menyesuaikan dengan informasi terbaru.',
  },
];

export const EditorialFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      id="faq"
      className="py-24 sm:py-32 bg-[#FAF9F6] border-t border-[#E8E5DF]"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column Header */}
          <div className="lg:col-span-5 space-y-5 text-left lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2.5">
              <span className="block w-6 h-[1px] bg-[#C6A679]" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
                Tanya Jawab
              </p>
            </div>

            <h2 className="font-serif font-normal text-[#181816] text-3xl sm:text-4xl leading-[1.18] tracking-[-0.015em] text-balance">
              Hal-hal yang sering ditanyakan mempelai.
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#716E68] font-light leading-relaxed">
              Kami merangkum jawaban atas berbagai pertanyaan seputar masa aktif undangan, kemudahan pengelolaan di Ruang Mempelai, hingga layanan tambahan Kapsul Kenangan.
            </p>
          </div>

          {/* Right Column Accordion */}
          <div className="lg:col-span-7 divide-y divide-[#E8E5DF] border-y border-[#E8E5DF]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={item.question} className="py-5 sm:py-6 text-left">
                  <button
                    type="button"
                    onClick={() => toggleIndex(idx)}
                    className="w-full flex items-start justify-between gap-6 text-left group cursor-pointer"
                  >
                    <span className="font-serif text-lg sm:text-xl text-[#181816] group-hover:text-[#C6A679] transition-colors leading-snug">
                      {item.question}
                    </span>
                    <span className="mt-1 shrink-0 w-6 h-6 rounded-full border border-[#E8E5DF] group-hover:border-[#C6A679] flex items-center justify-center text-[#716E68] group-hover:text-[#C6A679] transition-colors">
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      isOpen ? 'max-h-72 opacity-100 pt-3.5' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="font-sans text-[13px] sm:text-sm text-[#716E68] font-light leading-relaxed pr-8">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
