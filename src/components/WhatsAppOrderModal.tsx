import React, { useState, useEffect, useMemo } from 'react';
import { X, MessageCircle, Heart, Calendar, MapPin, User } from 'lucide-react';
import { InvitationItem } from '../types';
import { TEMPLATES } from '../data/catalog';
import { AdminStore } from '../admin/adminStore';
import { TemplateId } from '../types/clientInvitation';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: InvitationItem | null;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  preselectedItem,
}) => {
  // Nomor WhatsApp Resmi Pemesanan Sekarsiti Studio
  const adminPhone = '6283850714456';

  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (preselectedItem) {
      setSelectedTemplateId(preselectedItem.id);
    } else {
      setSelectedTemplateId(TEMPLATES[0].id);
    }
  }, [preselectedItem, isOpen]);

  const selectedTemplate = useMemo(() => {
    return TEMPLATES.find((t) => t.id === selectedTemplateId) || preselectedItem || TEMPLATES[0];
  }, [selectedTemplateId, preselectedItem]);

  if (!isOpen) return null;

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(selectedTemplate.price);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      setErrorMessage('Mohon cantumkan nama pemesan.');
      return;
    }

    if (!clientPhone.trim()) {
      setErrorMessage('Mohon cantumkan nomor WhatsApp Anda.');
      return;
    }

    setErrorMessage('');

    // Format tanggal jika diisi
    let formattedDateText = eventDate;
    if (eventDate) {
      try {
        const parsed = new Date(eventDate);
        if (!isNaN(parsed.getTime())) {
          formattedDateText = new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(parsed);
        }
      } catch {
        formattedDateText = eventDate;
      }
    }

    const coupleSummary =
      brideName && groomName
        ? `${brideName} & ${groomName}`
        : brideName || groomName || 'Mempelai';

    // Buat draft pesanan otomatis di AdminStore
    const newOrder = AdminStore.create({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      templateId: selectedTemplate.id as TemplateId,
      status: 'pending',
      brideName: brideName.trim() || 'Mempelai Wanita',
      groomName: groomName.trim() || 'Mempelai Pria',
      eventDateFormatted: formattedDateText || undefined,
      city: city.trim() || undefined,
      quoteText: notes.trim() || undefined,
    });

    // Susun pesan WhatsApp yang rapi dan profesional
    const message = `Halo Sekarsiti Studio, saya ingin memesan undangan digital:

• ID Draft: ${newOrder.id}
• Desain Dipilih: ${selectedTemplate.title} (${formattedPrice})
• Nama Pemesan: ${clientName.trim()}
• WhatsApp: ${clientPhone.trim()}
• Mempelai: ${coupleSummary}
• Rencana Tanggal: ${formattedDateText || '-'}
• Lokasi / Kota: ${city.trim() || '-'}
${notes.trim() ? `• Catatan: ${notes.trim()}\n` : ''}
Mohon informasi nomor rekening untuk DP dan aktivasi Portal Mempelai. Terima kasih!`;

    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2E28]/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF8F3] rounded-2xl shadow-2xl overflow-hidden border border-[#EBE6DD] my-auto text-[#2C2E28]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#414A35] text-[#F7F5EF] flex items-start justify-between">
          <div className="text-left pr-6">
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold block">
              Form Pemesanan Cepat
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#F7F5EF] leading-snug mt-0.5">
              Pesan Undangan Digital
            </h3>
            <p className="text-xs text-[#E3DFD5]/80 mt-1">
              Isi data awal pemesanan. Pembayaran DP &amp; akses portal kelengkapan template dilakukan via WhatsApp resmi.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#E3DFD5] hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          {/* Pilihan Template */}
          <div>
            <label className="block text-xs font-semibold text-[#414A35] mb-1">
              Pilihan Desain Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D9D3C7] bg-white text-[#2C2E28] focus:outline-none focus:border-[#414A35]"
            >
              {TEMPLATES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} — {item.styleLabel} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)})
                </option>
              ))}
            </select>
          </div>

          {/* Kontak Pemesan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#414A35] mb-1">
                Nama Pemesan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Adhitya / Kirana"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-8 pr-3 py-2 rounded-lg border border-[#D9D3C7] bg-white text-[#2C2E28] focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#414A35] mb-1">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full text-xs sm:text-sm p-2 rounded-lg border border-[#D9D3C7] bg-white text-[#2C2E28] focus:outline-none focus:border-[#414A35]"
              />
            </div>
          </div>

          {/* Nama Singkat Mempelai */}
          <div className="p-3.5 bg-stone-100/70 rounded-xl border border-stone-200/80 space-y-2.5">
            <span className="text-[11px] font-bold text-[#414A35] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Nama Calon Mempelai (Panggilan)</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-stone-600 mb-0.5">Mempelai Wanita</label>
                <input
                  type="text"
                  placeholder="Contoh: Kirana"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D9D3C7] bg-white text-[#2C2E28] focus:outline-none focus:border-[#414A35]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-600 mb-0.5">Mempelai Pria</label>
                <input
                  type="text"
                  placeholder="Contoh: Adhitya"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D9D3C7] bg-white text-[#2C2E28] focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>
          </div>

          {/* Tanggal & Kota Acara */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#414A35] mb-1">
                Rencana Tanggal Acara
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-[#D9D3C7] bg-white text-[#2C2E28] focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#414A35] mb-1">
                Kota Penyelenggaraan
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Contoh: Jakarta / Bandung"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-8 pr-3 py-2 rounded-lg border border-[#D9D3C7] bg-white text-[#2C2E28] focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>
          </div>

          {/* Catatan Khusus */}
          <div>
            <label className="block text-xs font-semibold text-[#414A35] mb-1">
              Catatan atau Pertanyaan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Ada request khusus tema warna, revisi font, atau pertanyaan sebelum bayar?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#D9D3C7] bg-white text-[#2C2E28] focus:outline-none focus:border-[#414A35]"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-[#EBE6DD] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Total Biaya Desain
              </span>
              <span className="text-base font-serif font-bold text-[#414A35]">
                {formattedPrice}
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-[#414A35] hover:bg-[#343B2A] text-[#F7F5EF] text-xs sm:text-sm font-semibold rounded-full transition-all active:scale-[0.98] cursor-pointer shadow-md whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Kirim Pesanan ke WhatsApp</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
