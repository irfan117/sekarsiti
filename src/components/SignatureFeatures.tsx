import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  KeyRound,
  Heart,
  BookOpen,
  Music,
  ShieldCheck,
  Copy,
  CheckCircle2,
  BookmarkCheck,
} from 'lucide-react';

type CapsuleTabKey = 'eternal' | 'story' | 'melody' | 'heirloom';

interface CapsuleChapter {
  key: CapsuleTabKey;
  label: string;
  subtitle: string;
  badge: string;
  title: string;
  description: string;
  note: string;
}

const CAPSULE_CHAPTERS: CapsuleChapter[] = [
  {
    key: 'eternal',
    label: '01 · Abadi Selamanya',
    subtitle: 'Tanpa Batas Waktu',
    badge: 'Add-On Eksklusif',
    title: 'Kenangan yang Tetap Hidup Setelah Hari Bahagia Usai',
    description:
      'Masa tayang undangan reguler berlangsung selama 1 hingga 3 bulan mengikuti rangkaian acara pernikahan Anda. Bagi pasangan yang tidak ingin kenangannya hilang begitu saja, layanan tambahan Kapsul Kenangan mengemas utuh seluruh undangan Anda agar dapat dibuka kembali kapan pun di perangkat pribadi—bahkan puluhan tahun mendatang.',
    note: 'Tersedia sebagai layanan tambahan (add-on) dengan biaya sekali bayar yang terjangkau.',
  },
  {
    key: 'story',
    label: '02 · Album & Kisah',
    subtitle: 'Potret Tersimpan Utuh',
    badge: 'Dokumentasi Pribadi',
    title: 'Seluruh Foto Prewedding & Cerita Cinta Tersimpan Rapi',
    description:
      'Setiap potret kebersamaan, kutipan doa, hingga babak perjalanan cinta yang telah Anda rangkai di dalam undangan akan tersimpan dalam kualitas visual yang jernih. Layaknya album foto fisik, Anda dapat membukanya kembali bersama pasangan dan keluarga kapan saja tanpa memerlukan sambungan internet.',
    note: 'Seluruh foto dan rangkaian cerita menjadi milik pribadi Anda sepenuhnya.',
  },
  {
    key: 'melody',
    label: '03 · Alunan Nada',
    subtitle: 'Lagu Pernikahan',
    badge: 'Suasana Romantis',
    title: 'Lagu Pengiring yang Mengembalikan Memori Hari Pernikahan',
    description:
      'Bukan hanya tampilan visual, alunan lagu pilihan Anda juga turut tersimpan di dalam Kapsul Kenangan. Setiap kali Anda membuka kembali undangan tersebut di masa depan, melodi yang sama akan kembali mengalun—dan Anda pun tetap leluasa mengganti lagunya kapan saja dengan mudah.',
    note: 'Menghadirkan kembali kehangatan suasana hari pernikahan dalam satu sentuhan.',
  },
  {
    key: 'heirloom',
    label: '04 · Tanpa Sewa Tahunan',
    subtitle: 'Sekali untuk Selamanya',
    badge: 'Bebas Biaya Bulanan',
    title: 'Tanpa Biaya Perpanjangan Tahunan yang Membebani',
    description:
      'Anda tidak perlu membayar biaya perpanjangan sewa setiap tahun hanya demi menjaga halaman undangan tetap ada. Cukup tambahkan add-on Kapsul Kenangan satu kali saat pemesanan, dan seluruh arsip undangan siap Anda simpan di komputer, laptop, maupun penyimpanan pribadi Anda selamanya.',
    note: 'Dilengkapi panduan sederhana yang mudah diikuti oleh siapa saja.',
  },
];

const COMPARISON_ROWS = [
  {
    aspect: 'Kesan Pertama & Estetika',
    market: 'Tampilan terlalu ramai dengan ornamen yang mengganggu kenyamanan membaca',
    sekarsiti: 'Tata letak bergaya majalah editorial yang tenang, anggun, dan tak lekang oleh waktu',
  },
  {
    aspect: 'Kemudahan Mengatur Isi Undangan',
    market: 'Harus mengirim pesan bolak-balik ke admin dan menunggu antrean revisi berhari-hari',
    sekarsiti: 'Dilengkapi Ruang Mempelai pribadi untuk memperbarui foto, lagu, & jadwal acara kapan saja',
  },
  {
    aspect: 'Kenyamanan Tamu Saat Membuka',
    market: 'Sering terasa berat dan lambat dibuka ketika sinyal telepon tamu kurang stabil',
    sekarsiti: 'Setiap foto disesuaikan secara cerdas agar halaman terbuka dengan ringan dan jernih',
  },
  {
    aspect: 'Menyapa Ratusan Tamu Undangan',
    market: 'Mengetik nama tamu dan menyalin pesan satu per satu secara manual yang melelahkan',
    sekarsiti: 'Penyusun sapaan tamu otomatis yang siap dikirimkan ke WhatsApp dalam satu ketukan',
  },
  {
    aspect: 'Kenangan Setelah Acara Selesai',
    market: 'Undangan lenyap begitu saja setelah masa aktif berakhir tanpa menyisakan arsip',
    sekarsiti: 'Tersedia pilihan Add-On Kapsul Kenangan agar undangan dapat disimpan & dibuka selamanya',
  },
];

interface SignatureFeaturesProps {}

export const SignatureFeatures: React.FC<SignatureFeaturesProps> = () => {
  // Interactive Gimmick 1: Live Guest Personalizer state
  const [guestNameInput, setGuestNameInput] = useState('Bapak Raditya & Ibu');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [copiedSim, setCopiedSim] = useState(false);

  // Interactive Gimmick 2: Memory Capsule Chapter state
  const [activeTab, setActiveTab] = useState<CapsuleTabKey>('eternal');

  const guestPresets = [
    'Bapak Raditya & Ibu',
    'dr. Nadia Maharani, Sp.A',
    'Keluarga Besar Bpk. H. Suryanto',
    'Sahabatku, Clara Anindita',
  ];

  const activeChapter =
    CAPSULE_CHAPTERS.find((c) => c.key === activeTab) || CAPSULE_CHAPTERS[0];

  const cleanGuestName = guestNameInput.trim() || 'Tamu Kehormatan';

  const handleCopySimulation = () => {
    setCopiedSim(true);
    setTimeout(() => setCopiedSim(false), 2200);
  };

  return (
    <section
      id="fitur"
      className="py-24 sm:py-32 bg-[#FAF9F6] border-t border-[#E8E5DF] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-24">

        {/* ——— SECTION HEADER ——— */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2.5">
              <span className="block w-6 h-[1px] bg-[#C6A679]" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
                Keistimewaan Layanan Sekarsiti
              </p>
            </div>
            <h2 className="font-serif font-normal text-[#181816] text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.15] tracking-[-0.015em] text-balance">
              Kemudahan penuh selama persiapan,<br className="hidden sm:block" />
              <span className="italic text-[#8C734B]">dan kenangan yang dapat disimpan selamanya.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-left">
            <p className="font-sans text-sm sm:text-base text-[#716E68] font-light leading-relaxed">
              Kami merancang pengalaman yang menenangkan bagi calon pengantin—mulai dari menyapa setiap tamu secara personal hingga pilihan mengabadikan undangan setelah hari bahagia usai.
            </p>
          </div>
        </div>

        {/* ——— INTERACTIVE GIMMICK 1 & 2: TWO-COLUMN EDITORIAL EXPERIENCE ——— */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* LEFT CARD: Interactive Guest Greeting Simulator */}
          <div className="lg:col-span-6 bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-7 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="space-y-5 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.16em] uppercase text-[#C6A679] bg-[#FAF9F6] border border-[#E8E5DF] px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Coba Langsung
                </span>
                <span className="text-[11px] font-sans text-[#9C9891]">
                  Fitur Bawaan Ruang Mempelai
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#181816] leading-snug">
                  Sambut Setiap Tamu dengan Sapaan yang Personal
                </h3>
                <p className="font-sans text-[13px] text-[#716E68] font-light leading-relaxed">
                  Coba ketik nama keluarga atau sahabat Anda di bawah ini untuk melihat bagaimana sampul undangan dan pesan pengantar menyesuaikan secara otomatis:
                </p>
              </div>

              {/* Input field for live gimmick */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[#716E68]">
                  Tulis Nama Tamu Undangan:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    placeholder="Contoh: Bapak Budi & Keluarga"
                    maxLength={48}
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#D8D3C8] focus:border-[#C6A679] rounded-xl text-sm font-sans text-[#181816] focus:outline-none transition-colors"
                  />
                </div>

                {/* Preset quick pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {guestPresets.map((preset, idx) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setGuestNameInput(preset);
                        setSelectedPresetIdx(idx);
                      }}
                      className={`text-[11px] font-sans px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        guestNameInput === preset && selectedPresetIdx === idx
                          ? 'bg-[#181816] text-[#FAF9F6] border-[#181816]'
                          : 'bg-[#FAF9F6] text-[#716E68] border-[#E8E5DF] hover:border-[#C6A679]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Miniature Envelope Cover Preview */}
            <div className="relative rounded-xl bg-[#181816] text-[#FAF9F6] p-6 border border-[#2C2B29] overflow-hidden space-y-5">
              {/* Subtle corner ornament */}
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border border-[#C6A679]/20 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#2C2B29] pb-3">
                <div>
                  <p className="text-[9px] font-sans tracking-[0.22em] uppercase text-[#C6A679]">
                    PERNIKAHAN KAMI
                  </p>
                  <p className="font-serif text-lg text-[#FAF9F6] tracking-wide">
                    Kirana &amp; Adhitya
                  </p>
                </div>
                <span className="text-[10px] font-sans text-[#9C9891] bg-[#242421] px-2.5 py-1 rounded-md border border-[#33322E]">
                  Minggu, 14 Februari 2027
                </span>
              </div>

              {/* Dynamic Guest Name Box */}
              <div className="bg-[#22221F] border border-[#C6A679]/30 rounded-lg p-4 text-left space-y-1 transition-all duration-300">
                <p className="text-[10px] font-sans text-[#9C9891] tracking-wide">
                  Kepada Yth. Bapak / Ibu / Saudara / i:
                </p>
                <p className="font-serif text-xl text-[#C6A679] break-words transition-all duration-200">
                  {cleanGuestName}
                </p>
                <p className="text-[10px] font-sans text-[#716E68] pt-1">
                  Di Tempat · Merupakan suatu kehormatan bagi kami atas kehadiran Anda
                </p>
              </div>

              {/* Simulated Polite WhatsApp Invitation Snippet */}
              <div className="flex items-center justify-between gap-3 bg-[#121210] px-3.5 py-2.5 rounded-lg border border-[#2C2B29]">
                <p className="text-[11px] font-sans text-[#9C9891] truncate text-left">
                  &ldquo;Yth. <span className="text-[#C6A679] font-medium">{cleanGuestName}</span>, tanpa mengurangi rasa hormat...&rdquo;
                </p>
                <button
                  type="button"
                  onClick={handleCopySimulation}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-sans font-semibold px-3 py-1 rounded-md bg-[#C6A679] text-[#181816] hover:bg-[#d4b689] transition-colors cursor-pointer"
                >
                  {copiedSim ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Siap Kirim</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Simulasi Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CARD: Add-On Kapsul Kenangan Showcase */}
          <div
            id="kapsul-kenangan"
            className="lg:col-span-6 bg-[#181816] text-[#FAF9F6] border border-[#2C2B29] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-7 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          >
            <div className="space-y-5 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.16em] uppercase text-[#181816] bg-[#C6A679] px-3 py-1 rounded-full">
                  <BookmarkCheck className="w-3 h-3" />
                  Layanan Tambahan · Add-On
                </span>
                <span className="text-[11px] font-sans text-[#C6A679] border border-[#C6A679]/30 bg-[#C6A679]/10 px-2.5 py-0.5 rounded-full">
                  Opsional (Dengan Biaya Tambahan)
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#FAF9F6] leading-snug">
                  Kapsul Kenangan Abadi: Simpan Undangan Anda Selamanya
                </h3>
                <p className="font-sans text-[13px] text-[#9C9891] font-light leading-relaxed">
                  Bagaimana jika setelah masa aktif 1–3 bulan berakhir, Anda tetap ingin menyimpan undangan pernikahan ini sebagai kenang-kenangan keluarga? Pilih bab di bawah untuk mengenal Add-On Kapsul Kenangan:
                </p>
              </div>

              {/* Interactive Chapter Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {CAPSULE_CHAPTERS.map((chap) => {
                  const isSelected = activeTab === chap.key;
                  const Icon =
                    chap.key === 'eternal'
                      ? Heart
                      : chap.key === 'story'
                      ? BookOpen
                      : chap.key === 'melody'
                      ? Music
                      : ShieldCheck;

                  return (
                    <button
                      key={chap.key}
                      type="button"
                      onClick={() => setActiveTab(chap.key)}
                      className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C6A679]/15 border-[#C6A679] text-[#FAF9F6]'
                          : 'bg-[#22221F] border-[#33322E] text-[#9C9891] hover:border-[#4E4C48]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? 'text-[#C6A679]' : 'text-[#716E68]'
                        }`}
                      />
                      <span className="text-[11px] font-sans font-semibold leading-tight">
                        {chap.label}
                      </span>
                      <span className="text-[10px] font-sans text-[#716E68] truncate w-full">
                        {chap.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Chapter Details */}
            <div className="bg-[#22221F] border border-[#33322E] rounded-xl p-5 sm:p-6 text-left space-y-3.5 transition-all duration-300">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-[#C6A679]">
                  {activeChapter.label}
                </span>
                <span className="text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#181816] text-[#D8D3C8] border border-[#33322E]">
                  {activeChapter.badge}
                </span>
              </div>

              <h4 className="font-serif text-lg sm:text-xl text-[#FAF9F6] leading-snug">
                {activeChapter.title}
              </h4>

              <p className="font-sans text-[13px] text-[#B8B4AC] font-light leading-relaxed">
                {activeChapter.description}
              </p>

              <div className="pt-2.5 border-t border-[#33322E] flex items-center gap-2 text-[12px] font-sans text-[#C6A679]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{activeChapter.note}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ——— RUANG MEMPELAI PRIVAT VIA WHATSAPP ——— */}
        <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-sans font-semibold tracking-[0.15em] uppercase text-[#C6A679]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ruang Mempelai Privat</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#181816]">
              Akses Eksklusif Langsung Dikirim ke WhatsApp Anda
            </h3>
            <p className="font-sans text-[13px] sm:text-sm text-[#716E68] font-light leading-relaxed">
              Setelah pemesanan disiapkan, tautan akses pribadi menuju Ruang Mempelai beserta kode PIN unik akan kami kirimkan langsung ke WhatsApp Anda. Anda dan pasangan dapat langsung mengisi detail acara, mengunggah foto, dan membagikan undangan kapan saja dengan aman.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF9F6] border border-[#E8E5DF] text-[12px] font-sans font-medium text-[#716E68]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tautan Rahasia Dikirim via WA</span>
          </div>
        </div>

        {/* ——— EDITORIAL CONTRAST TABLE (Sekarsiti vs Undangan Biasa) ——— */}
        <div className="space-y-8">
          <div className="max-w-2xl text-left space-y-3">
            <div className="inline-flex items-center gap-2.5">
              <span className="block w-6 h-[1px] bg-[#C6A679]" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.18em] text-[#C6A679] uppercase">
                Nilai &amp; Keunggulan
              </p>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#181816] leading-snug">
              Mengapa Pasangan Memilih Sekarsiti
            </h3>
            <p className="font-sans text-sm text-[#716E68] font-light">
              Undangan pernikahan adalah sambutan pertama yang mencerminkan kehangatan dan kehormatan perayaan Anda.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E8E5DF] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#E8E5DF] bg-[#FAF9F6]">
                  <th className="py-4 px-6 text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-[#716E68] w-1/4">
                    Pengalaman Mempelai
                  </th>
                  <th className="py-4 px-6 text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-[#9C9891] w-[37.5%]">
                    Undangan Digital Biasa
                  </th>
                  <th className="py-4 px-6 text-[11px] font-sans font-bold uppercase tracking-[0.14em] text-[#181816] bg-[#C6A679]/10 w-[37.5%]">
                    Sekarsiti Wedding Atelier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF] text-[13px] font-sans">
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.aspect}
                    className="hover:bg-[#FAF9F6]/80 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-[#181816]">
                      {row.aspect}
                    </td>
                    <td className="py-4 px-6 text-[#716E68] font-light">
                      <div className="flex items-start gap-2.5">
                        <X className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        <span>{row.market}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#181816] font-medium bg-[#C6A679]/5">
                      <div className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#C6A679] shrink-0 mt-0.5" />
                        <span>{row.sekarsiti}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
