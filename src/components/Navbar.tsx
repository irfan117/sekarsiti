import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onSelectTemplateCTA: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTemplateCTA }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-[#FAF9F6]/95 backdrop-blur-md shadow-[0_1px_0_0_#E8E5DF]'
          : 'bg-[#FAF9F6] border-b border-[#E8E5DF]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-[68px] flex items-center justify-between gap-6">

        {/* Wordmark */}
        <a
          href="#"
          className="font-serif text-[1.45rem] tracking-[-0.01em] text-[#181816] hover:text-[#C6A679] transition-colors duration-300"
        >
          sekarsiti
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-sans font-medium text-[#716E68] tracking-wide">
          <a href="#koleksi" className="hover:text-[#181816] transition-colors duration-200">
            Koleksi
          </a>
          <a href="#cara-kerja" className="hover:text-[#181816] transition-colors duration-200">
            Cara Kerja
          </a>
          <a href="#tentang" className="hover:text-[#181816] transition-colors duration-200">
            Tentang
          </a>
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectTemplateCTA}
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-sans font-semibold text-[#FAF9F6] bg-[#181816] hover:bg-[#C6A679] rounded-full transition-all duration-300 active:scale-[0.97] cursor-pointer whitespace-nowrap tracking-wide"
          >
            <span>Pesan Sekarang</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#181816] hover:text-[#C6A679] md:hidden rounded-lg focus:outline-none transition-colors"
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-[#E8E5DF] bg-[#FAF9F6] px-6 py-5 space-y-4">
          {[
            { href: '#koleksi', label: 'Koleksi' },
            { href: '#cara-kerja', label: 'Cara Kerja' },
            { href: '#tentang', label: 'Tentang' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-sans font-medium text-[#181816] hover:text-[#C6A679] py-0.5 transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="pt-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onSelectTemplateCTA(); }}
              className="w-full text-center px-4 py-2.5 text-[13px] font-sans font-semibold text-[#FAF9F6] bg-[#181816] rounded-full transition-colors hover:bg-[#C6A679]"
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
