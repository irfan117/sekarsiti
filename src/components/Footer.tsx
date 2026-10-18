import React from 'react';

interface FooterProps {
  onContactWhatsApp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onContactWhatsApp }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#181816] text-[#9C9891] border-t border-[#2C2B29]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">

        {/* Main footer row */}
        <div className="py-14 sm:py-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">

          {/* Brand block */}
          <div className="space-y-3 text-left">
            <a
              href="#"
              className="block font-serif text-2xl text-[#FAF9F6] tracking-[-0.01em] hover:text-[#C6A679] transition-colors duration-300"
            >
              sekarsiti
            </a>
            <p className="font-sans text-[13px] text-[#716E68] font-light max-w-[260px] leading-relaxed">
              Atelier undangan digital terkurasi untuk perayaan yang bermakna.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[13px] font-sans font-medium text-[#716E68]">
            <a href="#koleksi" className="hover:text-[#FAF9F6] transition-colors duration-200">Koleksi</a>
            <a href="#cara-kerja" className="hover:text-[#FAF9F6] transition-colors duration-200">Cara Kerja</a>
            <a href="#tentang" className="hover:text-[#FAF9F6] transition-colors duration-200">Tentang</a>
            <button
              onClick={onContactWhatsApp}
              className="hover:text-[#C6A679] transition-colors duration-200 cursor-pointer"
            >
              Hubungi Kami
            </button>
          </nav>
        </div>

        {/* Bottom line */}
        <div className="py-5 border-t border-[#2C2B29] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-sans text-[#4E4C48] font-light tracking-wide">
          <span>© {year} sekarsiti. Hak cipta dilindungi.</span>
          <span>Dirancang dengan penuh perhatian di Indonesia.</span>
        </div>

      </div>
    </footer>
  );
};
