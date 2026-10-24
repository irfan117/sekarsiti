import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  Sparkles,
  Link2,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  Globe
} from 'lucide-react';
import { safeCopyToClipboard } from '../../utils/clipboardUtils';
import { TEMPLATES } from '../../data/catalog';

interface ShareOrderFormModalProps {
  onClose: () => void;
}

export const ShareOrderFormModal: React.FC<ShareOrderFormModalProps> = ({ onClose }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all');
  const [customClientName, setCustomClientName] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedChat, setCopiedChat] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ssiti.tech';
  
  // URL form pemesanan
  const formUrl = selectedTemplateId && selectedTemplateId !== 'all'
    ? `${origin}/?order=${encodeURIComponent(selectedTemplateId)}`
    : `${origin}/?order=all`;

  // Draft chat WhatsApp
  const greetingName = customClientName.trim() ? `Kak ${customClientName.trim()}` : 'Kak';
  const selectedTemplateObj = TEMPLATES.find((t) => t.id === selectedTemplateId);
  const templateNote = selectedTemplateObj
    ? ` (Pilihan Desain: *${selectedTemplateObj.title}*)`
    : '';

  const draftMessage = `Halo ${greetingName}, terima kasih telah mempercayakan pembuatan undangan pernikahan digital Anda kepada *Sekarsiti Studio*! ✨🌿

Untuk mempermudah dan mempercepat proses pembuatan undangan${templateNote}, silakan isi data acara serta unggah foto/media terbaik melalui tautan formulir pemesanan resmi kami:

🔗 *Link Formulir Pemesanan:*
${formUrl}

📌 *Apa saja yang perlu disiapkan di formulir:*
1. Data nama mempelai & orang tua
2. Tanggal, waktu & lokasi acara (Akad & Resepsi)
3. Rekening / barcode QRIS untuk tanda kasih
4. Foto-foto momen untuk sampul, potret, dan galeri (bisa unggah langsung atau link Google Drive)
5. Pilihan musik lagu latar favorit Anda

Setelah formulir terkirim, tim kami akan langsung menyusun draf undangan dan memberikan pratinjau (preview) resmi untuk Anda tinjau. 

Jika ada hal yang ingin ditanyakan, jangan ragu untuk membalas pesan ini ya! 🤍`;

  const handleCopyLink = () => {
    safeCopyToClipboard(formUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyChat = () => {
    safeCopyToClipboard(draftMessage);
    setCopiedChat(true);
    setTimeout(() => setCopiedChat(false), 2500);
  };

  const handleDirectWhatsApp = () => {
    const encoded = encodeURIComponent(draftMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in text-left">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#93754F]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">Salin Link Form &amp; Draft Chat Klien</h3>
              <p className="text-[11px] text-stone-500">
                Kirim tautan formulir ke calon klien agar data &amp; foto otomatis masuk jadi draf siap tinjau.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
          {/* Customizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                Sapaan Nama Klien (Opsional):
              </label>
              <input
                type="text"
                value={customClientName}
                onChange={(e) => setCustomClientName(e.target.value)}
                placeholder="Contoh: Kirana / Adhitya"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                Kunci Template Terpilih:
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
              >
                <option value="all">Bebas Pilih di Form (Semua Template)</option>
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.styleLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Direct URL Card */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-800 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Tautan Langsung Formulir (URL)</span>
              </span>
              <a
                href={formUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 hover:underline"
              >
                <span>Uji Buka Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={formUrl}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px] text-stone-700 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-[#181816] hover:bg-[#C5A880] hover:text-[#141413] text-[#FAF8F5] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Tersalin!' : 'Salin URL'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Draft Preview */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-800 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Draf Pesan WhatsApp Siap Kirim</span>
              </span>
              <span className="text-[10px] font-mono text-stone-400">Siap Paste ke Chat</span>
            </div>

            <div className="bg-[#FAF8F3] border border-[#EAE3D2] rounded-xl p-3 font-mono text-[11px] text-stone-700 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto select-all">
              {draftMessage}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyChat}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copiedChat ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedChat ? 'Pesan Tersalin!' : 'Salin Pesan WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka WhatsApp Web / App langsung dengan teks ini"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buka WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Klien isi form &rarr; otomatis masuk Dashboard dengan status <strong>Draf Baru (Pending)</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-stone-200 rounded-lg font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

