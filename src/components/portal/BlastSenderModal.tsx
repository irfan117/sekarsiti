import React, { useState } from 'react';
import { Send, CheckCircle2, Play, Pause, AlertTriangle, Check, ExternalLink } from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';

interface BlastSenderModalProps {
  client: ClientInvitationData;
  isOpen: boolean;
  onClose: () => void;
}

export const BlastSenderModal: React.FC<BlastSenderModalProps> = ({
  client,
  isOpen,
  onClose,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const allLinks = client.guestLinks || [];
  const targetGuests = allLinks.filter((item) => {
    if (filterCategory === 'unsent') return !item.isSent;
    if (filterCategory !== 'all') return item.category === filterCategory;
    return true;
  });

  const currentGuest = targetGuests[currentIndex];

  const handleToggleSendCurrent = () => {
    if (!currentGuest) return;

    // Susun pesan WhatsApp
    const message = AdminStore.generateWhatsAppMessage(client, currentGuest.guestName);
    const cleanPhone = currentGuest.phone ? currentGuest.phone.replace(/\D/g, '') : '';
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    // Buka tab WhatsApp
    window.open(waUrl, '_blank');

    // Tandai sudah terkirim di Supabase / AdminStore
    AdminStore.toggleGuestLinkSent(client.id, currentGuest.id);

    // Lanjut ke tamu berikutnya secara otomatis jika mode auto-next berjalan
    if (currentIndex < targetGuests.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 text-left">
        
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#C5A880]" />
              <span>Asisten Pengiriman WhatsApp Blast</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Kirim undangan ke puluhan tamu secara teratur dan aman dari blokir WA.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter & Progress Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Target Pengiriman:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 outline-none"
            >
              <option value="all">Semua Tamu ({allLinks.length})</option>
              <option value="unsent">Belum Dikirim ({allLinks.filter(l => !l.isSent).length})</option>
              <option value="Keluarga">Keluarga</option>
              <option value="Sahabat">Sahabat Dekat</option>
              <option value="VIP">Tamu VIP</option>
              <option value="Rekan Kerja">Rekan Kerja</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Progres Kirim:
            </label>
            <div className="font-mono text-xs font-bold text-stone-800 py-1">
              Tamu ke-{targetGuests.length > 0 ? currentIndex + 1 : 0} dari {targetGuests.length}
            </div>
          </div>
        </div>

        {/* Info Peringatan Anti-Spam WA */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Aturan Aman WA Anti-Blokir:</strong> Pengiriman dilakukan per 1 klik per tamu agar dianggap sebagai pesan manual alami oleh WhatsApp.
          </p>
        </div>

        {/* Card Tamu Aktif Saat Ini */}
        {currentGuest ? (
          <div className="p-4 bg-[#FAF7F2] border border-[#C5A880]/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A880] font-bold">
                  {currentGuest.category || 'Tamu Undangan'}
                </span>
                <h4 className="text-sm font-bold text-stone-900">
                  {currentGuest.guestName}
                </h4>
                <p className="text-xs text-stone-500 font-mono">
                  {currentGuest.phone || 'Tanpa Nomor WA (Pilih kontak manual)'}
                </p>
              </div>

              {currentGuest.isSent && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Sudah Dikirim</span>
                </span>
              )}
            </div>

            {/* Tombol Utama Kirim WA Tamu Ini */}
            <button
              type="button"
              onClick={handleToggleSendCurrent}
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd54] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Buka WA &amp; Kirim Ke {currentGuest.guestName}</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500 text-xs">
            Tidak ada tamu dalam kategori filter ini.
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-3 py-1.5 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
          >
            ← Tamu Sebelumnya
          </button>

          <button
            type="button"
            disabled={currentIndex >= targetGuests.length - 1}
            onClick={() => setCurrentIndex((prev) => Math.min(targetGuests.length - 1, prev + 1))}
            className="px-3 py-1.5 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
          >
            Tamu Berikutnya →
          </button>
        </div>

      </div>
    </div>
  );
};
