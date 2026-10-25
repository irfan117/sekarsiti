import React, { useState } from 'react';
import {
  Save,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  CreditCard,
  Quote,
  ImageIcon,
  Music,
  Users
} from 'lucide-react';
import { ClientInvitationData, TemplateId } from '../../types/clientInvitation';
import { TEMPLATE_REGISTRY } from '../../admin/templateRegistry';
import { AdminStore } from '../../admin/adminStore';
import { MediaUploadSection } from '../admin/editor/MediaUploadSection';
import { MusicSelector } from '../admin/editor/MusicSelector';
import { smartPlaceAssets } from '../../services/mediaAssetAssistant';

interface PortalDataFormTabProps {
  client: ClientInvitationData;
  onClientUpdated: (updated: ClientInvitationData) => void;
  onOpenPreview: (client: ClientInvitationData) => void;
}

export const PortalDataFormTab: React.FC<PortalDataFormTabProps> = ({
  client,
  onClientUpdated,
  onOpenPreview,
}) => {
  const [formData, setFormData] = useState<ClientInvitationData>(() => ({ ...client }));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const templateDef = TEMPLATE_REGISTRY[formData.templateId] || TEMPLATE_REGISTRY['ruang-rasa'];

  const handleChange = (field: keyof ClientInvitationData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess(false);
  };

  const handleMediaSlotChange = (slotKey: string, newValue: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      mediaSlots: {
        ...prev.mediaSlots,
        [slotKey]: newValue,
      },
    }));
    setSaveSuccess(false);
  };

  const handleSmartAutoAssign = () => {
    const currentSlots = formData.mediaSlots || { galleryImages: [] };
    const pool: string[] = [];
    if (currentSlots.heroImage) pool.push(currentSlots.heroImage);
    if (currentSlots.bridePortrait) pool.push(currentSlots.bridePortrait);
    if (currentSlots.groomPortrait) pool.push(currentSlots.groomPortrait);
    if (currentSlots.qrisImageUrl) pool.push(currentSlots.qrisImageUrl);
    if (currentSlots.waxSealEmblem) pool.push(currentSlots.waxSealEmblem);
    if (Array.isArray(currentSlots.galleryImages)) pool.push(...currentSlots.galleryImages);
    if (Array.isArray(currentSlots.filmstripImages)) pool.push(...currentSlots.filmstripImages);

    const { placedMedia } = smartPlaceAssets(currentSlots, formData.templateId, pool);
    setFormData((prev) => ({
      ...prev,
      mediaSlots: {
        ...prev.mediaSlots,
        ...placedMedia,
        galleryImages: placedMedia.galleryImages || prev.mediaSlots?.galleryImages || [],
      },
    }));
    setSaveSuccess(false);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      // Perbarui clientName otomatis agar sesuai nama kedua mempelai jika ada
      const autoClientName =
        formData.brideName && formData.groomName
          ? `${formData.brideName} & ${formData.groomName}`
          : formData.clientName;

      const payload: Partial<ClientInvitationData> = {
        ...formData,
        clientName: autoClientName,
      };

      const updated = AdminStore.update(client.id, payload);
      setFormData(updated);
      onClientUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Gagal menyimpan data undangan:', err);
      setSaveError(err?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left pb-12">
      
      {/* Banner Ringkasan Template */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={templateDef.coverThumbnail}
            alt={templateDef.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A880] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E4DA]">
                {templateDef.styleLabel}
              </span>
              <span className="text-xs text-stone-500 font-mono">
                {client.id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mt-0.5">
              {templateDef.name}
            </h2>
            <p className="text-xs text-stone-500">
              Lengkapi informasi dan unggah foto pernikahan Anda. Data otomatis terhubung ke undangan digital.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onOpenPreview(formData)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-[#C5A880] hover:text-[#141413] text-stone-800 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Pratinjau</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#414A35] hover:bg-[#343B2A] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Data'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Data undangan dan foto Anda berhasil disimpan! Klik <strong>"Lihat Pratinjau"</strong> untuk melihat perubahannya.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* SECTION 1: UPLOAD FOTO & MEDIA */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-5">
        <div className="border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FAF7F2] rounded-lg border border-[#E8E4DA]">
              <ImageIcon className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                1. Foto &amp; Media Visual Template
              </h3>
              <p className="text-xs text-stone-500">
                Unggah foto hero utama, foto portrait kedua mempelai, serta foto galeri prewedding Anda.
              </p>
            </div>
          </div>
        </div>

        <MediaUploadSection
          formData={formData}
          selectedTemplateId={formData.templateId}
          onMediaSlotChange={handleMediaSlotChange}
          onSmartAutoAssign={handleSmartAutoAssign}
        />
      </div>

      {/* SECTION 2: PROFIL KEDUA MEMPELAI */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FAF7F2] rounded-lg border border-[#E8E4DA]">
              <Heart className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                2. Profil Kedua Mempelai
              </h3>
              <p className="text-xs text-stone-500">
                Lengkapi nama panggilan, nama lengkap bergelar, serta nama orang tua kedua belah pihak.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mempelai Wanita */}
          <div className="p-4 sm:p-5 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-3.5">
            <span className="text-xs font-bold text-[#414A35] uppercase tracking-wider block">
              Mempelai Wanita
            </span>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={formData.brideName}
                onChange={(e) => handleChange('brideName', e.target.value)}
                placeholder="Contoh: Kirana"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Lengkap &amp; Gelar
              </label>
              <input
                type="text"
                value={formData.brideFullName}
                onChange={(e) => handleChange('brideFullName', e.target.value)}
                placeholder="Contoh: Kirana Larasati, S.Ds."
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Orang Tua
              </label>
              <input
                type="text"
                value={formData.brideParents}
                onChange={(e) => handleChange('brideParents', e.target.value)}
                placeholder="Putri pertama dari Bpk. Bambang & Ibu Ratna"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Username Instagram (Opsional)
              </label>
              <input
                type="text"
                value={formData.brideInstagram || ''}
                onChange={(e) => handleChange('brideInstagram', e.target.value)}
                placeholder="@kirana.larasati"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>
          </div>

          {/* Mempelai Pria */}
          <div className="p-4 sm:p-5 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-3.5">
            <span className="text-xs font-bold text-[#414A35] uppercase tracking-wider block">
              Mempelai Pria
            </span>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={formData.groomName}
                onChange={(e) => handleChange('groomName', e.target.value)}
                placeholder="Contoh: Adhitya"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Lengkap &amp; Gelar
              </label>
              <input
                type="text"
                value={formData.groomFullName}
                onChange={(e) => handleChange('groomFullName', e.target.value)}
                placeholder="Contoh: Adhitya Pratama, M.Sc."
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Orang Tua
              </label>
              <input
                type="text"
                value={formData.groomParents}
                onChange={(e) => handleChange('groomParents', e.target.value)}
                placeholder="Putra bungsu dari Bpk. Hendra & Ibu Yulia"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Username Instagram (Opsional)
              </label>
              <input
                type="text"
                value={formData.groomInstagram || ''}
                onChange={(e) => handleChange('groomInstagram', e.target.value)}
                placeholder="@adhitya.pratama"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: RANGKAIAN ACARA & LOKASI */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FAF7F2] rounded-lg border border-[#E8E4DA]">
              <Calendar className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                3. Rangkaian Acara &amp; Lokasi
              </h3>
              <p className="text-xs text-stone-500">
                Atur jadwal akad nikah/pemberkatan, resepsi, serta tautan petunjuk arah Google Maps.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Format Tanggal Pernikahan
              </label>
              <input
                type="text"
                value={formData.eventDateFormatted}
                onChange={(e) => handleChange('eventDateFormatted', e.target.value)}
                placeholder="Minggu, 14 Februari 2027"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kota Acara
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Contoh: Jakarta Selatan / Yogyakarta"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Akad */}
            <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-3">
              <span className="text-xs font-bold text-[#414A35] uppercase tracking-wider block">
                Akad Nikah / Pemberkatan
              </span>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Waktu Pelaksanaan
                </label>
                <input
                  type="text"
                  value={formData.akadTime}
                  onChange={(e) => handleChange('akadTime', e.target.value)}
                  placeholder="08.00 – 10.00 WIB"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Tempat / Gedung / Masjid
                </label>
                <input
                  type="text"
                  value={formData.akadVenue}
                  onChange={(e) => handleChange('akadVenue', e.target.value)}
                  placeholder="Masjid Agung Sunda Kelapa / Plataran Dharmawangsa"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>

            {/* Resepsi */}
            <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-3">
              <span className="text-xs font-bold text-[#414A35] uppercase tracking-wider block">
                Resepsi Pernikahan
              </span>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Waktu Pelaksanaan
                </label>
                <input
                  type="text"
                  value={formData.resepsiTime}
                  onChange={(e) => handleChange('resepsiTime', e.target.value)}
                  placeholder="11.00 – 14.00 WIB"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Tempat / Ballroom
                </label>
                <input
                  type="text"
                  value={formData.resepsiVenue}
                  onChange={(e) => handleChange('resepsiVenue', e.target.value)}
                  placeholder="Grand Ballroom The Dharmawangsa"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>

          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Link Tautan Google Maps
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="url"
                value={formData.mapsUrl}
                onChange={(e) => handleChange('mapsUrl', e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">
              Buka Google Maps &gt; cari lokasi acara &gt; klik Bagikan / Share &gt; salin tautan link.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: MUSIK LATAR UNDANGAN */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FAF7F2] rounded-lg border border-[#E8E4DA]">
              <Music className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                4. Musik Latar Undangan
              </h3>
              <p className="text-xs text-stone-500">
                Pilih musik romantis dari katalog Sekarsiti atau unggah file MP3 lagu pilihan Anda.
              </p>
            </div>
          </div>
        </div>

        <MusicSelector
          mode="client"
          currentSongTitle={formData.songTitle}
          currentAudioUrl={formData.audioUrl}
          clientCustomTrack={formData.mediaSlots?.customMusicTrack || formData.customMusicTrack || null}
          onClientCustomTrackChange={(newTrack) => {
            setFormData((prev) => {
              const nextMediaSlots = {
                ...(prev.mediaSlots || { galleryImages: [] }),
                customMusicTrack: newTrack || undefined,
              };
              if (!newTrack) {
                delete nextMediaSlots.customMusicTrack;
              }
              const updated = {
                ...prev,
                mediaSlots: nextMediaSlots,
                customMusicTrack: newTrack || undefined,
              };
              try {
                AdminStore.update(client.id, updated);
                onClientUpdated(updated);
              } catch (e) {
                console.warn('Auto-save custom track failed', e);
              }
              return updated;
            });
            setSaveSuccess(false);
          }}
          onSelect={(songTitle, audioUrl) => {
            setFormData((prev) => {
              const updated = {
                ...prev,
                songTitle,
                audioUrl,
              };
              try {
                AdminStore.update(client.id, updated);
                onClientUpdated(updated);
              } catch (e) {
                console.warn('Auto-save selected track failed', e);
              }
              return updated;
            });
            setSaveSuccess(false);
          }}
        />
      </div>

      {/* SECTION 5: KUTIPAN / DOA & TANDA KASIH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Doa / Kutipan */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Quote className="w-4 h-4 text-[#C5A880]" />
            <h3 className="text-sm font-bold text-stone-900">Kutipan / Ayat Pernikahan</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Isi Kutipan / Doa
            </label>
            <textarea
              rows={4}
              value={formData.quoteText}
              onChange={(e) => handleChange('quoteText', e.target.value)}
              placeholder="Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Sumber Kutipan / Ayat
            </label>
            <input
              type="text"
              value={formData.quoteSource}
              onChange={(e) => handleChange('quoteSource', e.target.value)}
              placeholder="QS. Ar-Rum: 21"
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
            />
          </div>
        </div>

        {/* Tanda Kasih & Rekening */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <CreditCard className="w-4 h-4 text-[#C5A880]" />
            <h3 className="text-sm font-bold text-stone-900">Tanda Kasih (Amplop Digital)</h3>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Nama Bank
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="BCA / Mandiri"
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  placeholder="1234567890"
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white text-stone-900 font-mono focus:outline-none focus:border-[#414A35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Atas Nama Pemilik Rekening
              </label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => handleChange('accountHolder', e.target.value)}
                placeholder="Kirana Larasati"
                className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-[#414A35]"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Floating / Sticky Bottom Bar for Saving */}
      <div className="sticky bottom-16 md:bottom-4 z-30 p-3 sm:p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 shadow-xl flex items-center justify-between gap-3">
        <div className="text-xs text-stone-600 hidden sm:block">
          Pastikan untuk menekan <strong>Simpan Perubahan</strong> agar foto dan data terbaru tampil pada undangan.
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
          <button
            type="button"
            onClick={() => onOpenPreview(formData)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-[#C5A880] hover:text-[#141413] text-stone-800 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Pratinjau Undangan</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#414A35] hover:bg-[#343B2A] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-md whitespace-nowrap disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

