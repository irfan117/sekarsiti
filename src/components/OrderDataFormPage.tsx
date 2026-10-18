import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { AdminStore } from '../admin/adminStore';
import { TEMPLATES } from '../data/catalog';
import { InvitationItem } from '../types';
import { TemplateId } from '../types/clientInvitation';

interface OrderDataFormPageProps {
  initialTemplate?: InvitationItem | null;
  onBackToLanding: () => void;
}

const ADMIN_PHONE = '6283850714456';

function formatEventDate(dateValue: string): string {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T08:00:00`);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function buildSlug(brideName: string, groomName: string): string {
  const base = `${brideName || 'mempelai'}-${groomName || 'pasangan'}`;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const OrderDataFormPage: React.FC<OrderDataFormPageProps> = ({
  initialTemplate,
  onBackToLanding,
}) => {
  const defaultTemplate = initialTemplate || TEMPLATES[0];
  const [templateId, setTemplateId] = useState(defaultTemplate.id);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0],
    [templateId]
  );

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(selectedTemplate.price);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const displayClientName = clientName.trim() || `${brideName || 'Mempelai'} & ${groomName || 'Pasangan'}`;
    const eventDateFormatted = formatEventDate(eventDate);
    const countdownIsoDate = eventDate ? `${eventDate}T08:00:00` : undefined;

    const order = AdminStore.create({
      clientName: displayClientName,
      clientPhone,
      clientEmail,
      templateId: templateId as TemplateId,
      status: 'pending',
      slug: buildSlug(brideName, groomName),
      brideName,
      brideFullName: brideName,
      groomName,
      groomFullName: groomName,
      eventDateFormatted,
      countdownIsoDate,
      akadVenue: venue,
      resepsiVenue: venue,
      city,
    });

    setSubmittedOrderId(order.id);

    const message = `Halo sekarsiti, saya sudah mengisi form data pemesanan.

• ID Pemesanan: ${order.id}
• Template: ${selectedTemplate.title} (${formattedPrice})
• Nama Pemesan: ${displayClientName}
• WhatsApp: ${clientPhone || '-'}
• Email: ${clientEmail || '-'}
• Mempelai: ${brideName || '-'} & ${groomName || '-'}
• Tanggal Acara: ${eventDateFormatted || '-'}
• Lokasi: ${venue || '-'}${city ? `, ${city}` : ''}
• Catatan: ${notes || '-'}

Mohon info pembayaran dan approval selanjutnya.`;

    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#2C2E28] font-sans">
      <header className="px-5 sm:px-8 py-4 border-b border-[#EBE6DD] bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#414A35] hover:text-[#2C2E28] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <span className="font-['Fraunces',serif] text-base text-[#414A35]">sekarsiti</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="space-y-6">
          <div className="space-y-2 text-left">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#7A8B74]">
              Form Data Pemesanan
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2C2E28]">
              Lengkapi data undangan.
            </h1>
          </div>

          {submittedOrderId && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Data masuk ke admin sebagai pemesanan pending: {submittedOrderId}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 text-left">
            <div>
              <label className="block text-xs font-medium text-[#414A35] mb-1">Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-[#FAF8F3] focus:outline-none focus:border-[#414A35]"
              >
                {TEMPLATES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} - Rp{item.price.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#414A35] mb-1">Nama Pemesan</label>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#414A35] mb-1">Nomor WhatsApp</label>
                <input required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="08..." className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#414A35] mb-1">Email (Opsional)</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#414A35] mb-1">Nama Mempelai Wanita</label>
                <input required value={brideName} onChange={(e) => setBrideName(e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#414A35] mb-1">Nama Mempelai Pria</label>
                <input required value={groomName} onChange={(e) => setGroomName(e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#414A35] mb-1">Tanggal Acara</label>
                <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#414A35] mb-1">Kota</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#414A35] mb-1">Lokasi / Venue</label>
              <input value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]" />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#414A35] mb-1">Catatan Tambahan</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full text-sm p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35] resize-none" />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F2EFE8]">
              <span className="text-xs text-[#7A8B74]">Template {selectedTemplate.title} · {formattedPrice}</span>
              <button type="submit" className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#414A35] hover:bg-[#343B2A] text-[#F7F5EF] rounded-full text-sm font-medium cursor-pointer">
                <Send className="w-4 h-4" />
                <span>Kirim Data & Chat</span>
              </button>
            </div>
          </form>

          <a
            href={`https://wa.me/${ADMIN_PHONE}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#414A35] hover:text-[#2C2E28]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat seperti biasa tanpa isi form</span>
          </a>
        </div>
      </main>
    </div>
  );
};
