import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Send,
  Upload,
  Sparkles,
  Link2,
  Image as ImageIcon,
  Heart,
  Calendar,
  MapPin,
  CreditCard,
  Music,
  Loader2
} from 'lucide-react';
import { AdminStore } from '../admin/adminStore';
import { TEMPLATES } from '../data/catalog';
import { TEMPLATE_REGISTRY } from '../admin/templateRegistry';
import { InvitationItem } from '../types';
import { TemplateId, ClientInvitationData } from '../types/clientInvitation';
import { uploadToCloudinary, isCloudinaryConfigured } from '../utils/cloudinaryUpload';
import { smartPlaceAssets } from '../services/mediaAssetAssistant';

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
  const [templateId, setTemplateId] = useState<string>(defaultTemplate.id);

  // Data Pemesan & Mempelai
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [brideName, setBrideName] = useState('');
  const [brideFullName, setBrideFullName] = useState('');
  const [brideParents, setBrideParents] = useState('');
  const [groomName, setGroomName] = useState('');
  const [groomFullName, setGroomFullName] = useState('');
  const [groomParents, setGroomParents] = useState('');

  // Acara & Waktu
  const [eventDate, setEventDate] = useState('');
  const [akadTime, setAkadTime] = useState('08.00 – 10.00 WIB');
  const [akadVenue, setAkadVenue] = useState('');
  const [resepsiTime, setResepsiTime] = useState('11.00 – 14.00 WIB');
  const [resepsiVenue, setResepsiVenue] = useState('');
  const [city, setCity] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');

  // Amplop & Musik
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [songTitle, setSongTitle] = useState('Until I Found You - Stephen Sanchez');
  const [notes, setNotes] = useState('');

  // Upload Media
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [gdriveLink, setGdriveLink] = useState('');
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Status Submit
  const [submittedOrder, setSubmittedOrder] = useState<ClientInvitationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0],
    [templateId]
  );

  const activeTemplateDef = useMemo(
    () => TEMPLATE_REGISTRY[templateId as TemplateId] || TEMPLATE_REGISTRY['ruang-rasa'],
    [templateId]
  );

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(selectedTemplate.price);

  // Upload handler langsung ke Cloudinary
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploadingFiles(true);

    const fileList = Array.from(files);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgressText(`Mengunggah foto ${i + 1} dari ${fileList.length}...`);

        if (isCloudinaryConfigured) {
          const cloudUrl = await uploadToCloudinary(file);
          newUrls.push(cloudUrl);
        } else {
          // Fallback FileReader base64 jika offline/dev
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newUrls.push(base64);
        }
      }

      setUploadedPhotos((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error('Upload foto gagal:', err);
      setUploadError(err.message || 'Gagal mengunggah foto. Silakan coba lagi.');
    } finally {
      setIsUploadingFiles(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const displayClientName =
      clientName.trim() || `${brideName || 'Mempelai'} & ${groomName || 'Pasangan'}`;
    const eventDateFormatted = formatEventDate(eventDate);
    const countdownIsoDate = eventDate ? `${eventDate}T08:00:00` : undefined;

    // Distribusikan aset cerdas ke slot template
    const rawMediaCandidate = {
      heroImage: uploadedPhotos[0] || '',
      bridePortrait: uploadedPhotos[1] || '',
      groomPortrait: uploadedPhotos[2] || '',
      galleryImages: uploadedPhotos,
      gdriveFolderUrl: gdriveLink.trim() || undefined
    };

    const { placedMedia } = smartPlaceAssets(
      rawMediaCandidate,
      templateId as TemplateId,
      uploadedPhotos
    );

    const newOrder = AdminStore.create({
      clientName: displayClientName,
      clientPhone,
      clientEmail,
      templateId: templateId as TemplateId,
      status: 'pending', // Masuk sebagai draf pending siap ditinjau admin
      slug: buildSlug(brideName, groomName),
      brideName: brideName.trim(),
      brideFullName: brideFullName.trim() || brideName.trim(),
      brideParents: brideParents.trim(),
      groomName: groomName.trim(),
      groomFullName: groomFullName.trim() || groomName.trim(),
      groomParents: groomParents.trim(),
      eventDateFormatted,
      countdownIsoDate,
      akadTime: akadTime.trim(),
      akadVenue: akadVenue.trim() || resepsiVenue.trim(),
      resepsiTime: resepsiTime.trim(),
      resepsiVenue: resepsiVenue.trim(),
      city: city.trim(),
      mapsUrl: mapsUrl.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      songTitle: songTitle.trim(),
      mediaSlots: {
        ...placedMedia,
        heroImage: placedMedia.heroImage || uploadedPhotos[0] || '',
        bridePortrait: placedMedia.bridePortrait || uploadedPhotos[1] || '',
        groomPortrait: placedMedia.groomPortrait || uploadedPhotos[2] || '',
        galleryImages: placedMedia.galleryImages?.length > 0 ? placedMedia.galleryImages : uploadedPhotos
      }
    });

    setSubmittedOrder(newOrder);
    setIsSubmitting(false);

    // Buka WhatsApp konfirmasi ke admin
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ssiti.tech';
    const previewUrl = `${origin}/?client=${encodeURIComponent(newOrder.slug || newOrder.id)}`;

    const message = `Halo Sekarsiti Studio, saya sudah mengirim formulir data pesanan undangan digital:

• *ID Pemesanan:* ${newOrder.id}
• *Template:* ${selectedTemplate.title} (${selectedTemplate.styleLabel})
• *Nama Pemesan:* ${displayClientName}
• *WhatsApp:* ${clientPhone || '-'}
• *Mempelai:* ${brideName} & ${groomName}
• *Tanggal Acara:* ${eventDateFormatted || '-'}
• *Kota / Lokasi:* ${city ? `${city} · ` : ''}${resepsiVenue || '-'}
• *Jumlah Foto Diunggah:* ${uploadedPhotos.length} foto${gdriveLink ? `\n• *Link Google Drive:* ${gdriveLink}` : ''}
${notes ? `• *Catatan Tambahan:* ${notes}\n` : ''}
Mohon info tindak lanjut dan peninjauannya ya. Terima kasih! 🙏`;

    window.open(
      `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#2C2E28] font-sans text-left">
      {/* Top Navbar */}
      <header className="px-5 sm:px-8 py-4 border-b border-[#EBE6DD] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#414A35] hover:text-[#2C2E28] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
          <span className="font-['Fraunces',serif] text-base text-[#414A35] font-semibold">sekarsiti</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#7A8B74] block">
              Formulir Pemesanan Resmi
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#2C2E28]">
              Lengkapi Data &amp; Aset Undangan
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
              Silakan lengkapi formulir berikut. Data dan foto yang Anda kirimkan akan otomatis masuk ke sistem kami untuk disusun menjadi draf undangan yang rapi dan estetis.
            </p>
          </div>

          {/* Success Banner */}
          {submittedOrder && (
            <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 space-y-3 shadow-xs animate-fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">Data Berhasil Terkirim &amp; Draf Siap Ditinjau!</h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    Pesanan Anda dengan nomor draf <strong>{submittedOrder.id}</strong> telah tercatat di sistem kami.
                    Tim kurator Sekarsiti akan meninjau dan mengaktifkan undangan Anda segera.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: PILIH TEMPLATE */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">1. Pilihan Desain &amp; Tema</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414A35] mb-2">
                  Template Undangan Digital
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TEMPLATES.map((item) => {
                    const isSelected = templateId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setTemplateId(item.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#414A35] bg-[#F7F5EF] shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="aspect-[16/10] rounded-lg overflow-hidden mb-2 bg-stone-100">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-[#2C2E28]">{item.title}</p>
                            <p className="text-[10px] text-stone-500">{item.styleLabel}</p>
                          </div>
                          <span className="text-[11px] font-bold text-[#414A35]">
                            Rp{item.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP 2: DATA KONTAK & PEMESAN */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <Heart className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">2. Data Kontak Pemesan</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Nama Pemesan / Penghubung <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: Kirana"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="email@anda.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: PROFIL KEDUA MEMPELAI */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-bold text-[#2C2E28]">3. Profil Kedua Mempelai</h2>
              </div>

              {/* Mempelai Wanita */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200/80 space-y-3">
                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Mempelai Wanita (The Bride)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Panggilan Wanita <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      placeholder="Contoh: Kirana"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Lengkap &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={brideFullName}
                      onChange={(e) => setBrideFullName(e.target.value)}
                      placeholder="Contoh: Kirana Ayu Lestari, S.Ds."
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nama Orang Tua Mempelai Wanita
                  </label>
                  <input
                    type="text"
                    value={brideParents}
                    onChange={(e) => setBrideParents(e.target.value)}
                    placeholder="Contoh: Putri pertama dari Bapak Hendra Wijaya & Ibu Sinta Maharani"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
              </div>

              {/* Mempelai Pria */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200/80 space-y-3">
                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Mempelai Pria (The Groom)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Panggilan Pria <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      placeholder="Contoh: Adhitya"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Lengkap &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={groomFullName}
                      onChange={(e) => setGroomFullName(e.target.value)}
                      placeholder="Contoh: Adhitya Nugraha, B.Eng."
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nama Orang Tua Mempelai Pria
                  </label>
                  <input
                    type="text"
                    value={groomParents}
                    onChange={(e) => setGroomParents(e.target.value)}
                    placeholder="Contoh: Putra kedua dari Bapak Suryanto Nugraha & Ibu Ratna Dewi"
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
              </div>
            </div>

            {/* STEP 4: WAKTU & LOKASI ACARA */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">4. Waktu &amp; Lokasi Rangkaian Acara</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Tanggal Perayaan Utama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#414A35] mb-1">
                    Kota / Wilayah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan / Denpasar"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                  />
                </div>
              </div>

              {/* Akad & Resepsi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <span className="text-xs font-bold text-stone-800 block">Akad Nikah / Pemberkatan</span>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Waktu Akad</label>
                    <input
                      type="text"
                      value={akadTime}
                      onChange={(e) => setAkadTime(e.target.value)}
                      placeholder="08.00 – 10.00 WIB"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Tempat / Gedung Akad</label>
                    <input
                      type="text"
                      value={akadVenue}
                      onChange={(e) => setAkadVenue(e.target.value)}
                      placeholder="Nama masjid / aula akad"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <span className="text-xs font-bold text-stone-800 block">Resepsi Pernikahan</span>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Waktu Resepsi</label>
                    <input
                      type="text"
                      value={resepsiTime}
                      onChange={(e) => setResepsiTime(e.target.value)}
                      placeholder="11.00 – 14.00 WIB"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Tempat / Gedung Resepsi</label>
                    <input
                      type="text"
                      value={resepsiVenue}
                      onChange={(e) => setResepsiVenue(e.target.value)}
                      placeholder="Nama ballroom / venue resepsi"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414A35] mb-1">
                  Tautan Google Maps Lokasi (Opsional)
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>

            {/* STEP 5: UNGGAH FOTO & MEDIA */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <ImageIcon className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">5. Unggah Foto &amp; Media Dokumentasi</h2>
              </div>

              <p className="text-xs text-stone-600">
                Unggah foto prewedding atau momen terbaik Anda (bebas jumlah, tanpa batasan). Foto yang diunggah akan otomatis dipetakan secara cerdas ke sampul utama, potret mempelai, dan galeri momen.
              </p>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-[#C5A880]/60 rounded-xl p-6 text-center bg-[#FAF8F5] space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#C5A880]/20 text-[#93754F] flex items-center justify-center mx-auto">
                  {isUploadingFiles ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-800">
                    {isUploadingFiles ? uploadProgressText : 'Pilih Foto dari Perangkat Anda'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Mendukung JPG, PNG, WEBP (bisa pilih banyak foto sekaligus)
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#414A35] hover:bg-[#343B2A] text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs">
                  <span>Pilih File Foto</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isUploadingFiles}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {uploadError}
                </p>
              )}

              {/* Thumbnail List */}
              {uploadedPhotos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-semibold text-emerald-800">
                      ✓ {uploadedPhotos.length} foto berhasil diunggah
                    </span>
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos([])}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      Kosongkan Semua
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {uploadedPhotos.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100 group shadow-2xs"
                      >
                        <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600/90 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Hapus foto ini"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tautan Alternatif Google Drive */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-medium text-[#414A35] mb-1">
                  Atau Cantumkan Link Folder Google Drive (Opsional):
                </label>
                <input
                  type="url"
                  value={gdriveLink}
                  onChange={(e) => setGdriveLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white focus:outline-none focus:border-[#414A35]"
                />
                <span className="text-[10px] text-stone-400 block mt-1">
                  Pastikan akses link di Google Drive disetel ke "Siapa saja yang memiliki tautan (Viewer)".
                </span>
              </div>
            </div>

            {/* STEP 6: AMPLOP DIGITAL & MUSIK */}
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
                <CreditCard className="w-4 h-4 text-[#C5A880]" />
                <h2 className="text-sm font-bold text-[#2C2E28]">6. Tanda Kasih &amp; Lagu Favorit</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Bank / Dompet Digital</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BCA / Mandiri / GoPay"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Contoh: 1234567890"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Atas Nama Pemilik</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Nama di buku tabungan"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Judul Musik Latar Favorit
                </label>
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Contoh: Until I Found You - Stephen Sanchez"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Catatan Khusus untuk Tim Desainer (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Tolong foto sampul gunakan yang berlatar senja, dresscode warna sage green..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EBE6DD] bg-white resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F2EFE8]">
              <div>
                <span className="text-xs text-stone-500 block">Paket Desain:</span>
                <span className="text-sm font-bold text-[#414A35]">
                  {selectedTemplate.title} &middot; {formattedPrice}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingFiles}
                className="inline-flex items-center justify-center gap-2 py-3 px-8 bg-[#414A35] hover:bg-[#343B2A] disabled:opacity-50 text-[#F7F5EF] rounded-full text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Draf Pesanan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Data Pesanan &amp; Konfirmasi WA</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Chat Link */}
          <div className="text-center pt-2">
            <a
              href={`https://wa.me/${ADMIN_PHONE}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#414A35] hover:text-[#2C2E28] hover:underline"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Butuh bantuan atau ingin konsultasi via WhatsApp terlebih dahulu? Klik di sini</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
