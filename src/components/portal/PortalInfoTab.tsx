import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Heart, Loader2, Music, Upload } from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';
import { convertAudioFileToWebm, uploadAudioToCloudinary } from '../../utils/cloudinaryUpload';

interface PortalInfoTabProps {
  client: ClientInvitationData;
  onClientUpdated?: (updated: ClientInvitationData) => void;
}

export const PortalInfoTab: React.FC<PortalInfoTabProps> = ({ client, onClientUpdated }) => {
  const [musicTitle, setMusicTitle] = useState(client.songTitle || 'Lagu Undangan');
  const [musicUrl, setMusicUrl] = useState(client.audioUrl || '');
  const [musicError, setMusicError] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMusicTitle(client.songTitle || 'Lagu Undangan');
    setMusicUrl(client.audioUrl || '');
  }, [client]);

  const handleMusicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setMusicError('Format file harus berupa audio (.mp3, .wav, .m4a, .webm).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingMusic(true);
    setMusicError('');

    try {
      const convertedFile = await convertAudioFileToWebm(file);
      const uploadedUrl = await uploadAudioToCloudinary(convertedFile);
      const safeTitle = musicTitle.trim() || file.name.replace(/\.[^/.]+$/, '') || 'Lagu Custom';
      const updatedClient = AdminStore.update(client.id, {
        songTitle: safeTitle,
        audioUrl: uploadedUrl
      });

      setMusicTitle(safeTitle);
      setMusicUrl(uploadedUrl);
      onClientUpdated?.(updatedClient);
    } catch (error: any) {
      console.error('Gagal upload musik portal:', error);
      setMusicError(error?.message || 'Gagal mengunggah musik ke Cloudinary.');
    } finally {
      setIsUploadingMusic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C5A880]" />
            <span>Informasi Rangkaian Acara</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-[#C5A880] block">
                Tanggal Pernikahan
              </span>
              <p className="font-semibold text-stone-900 mt-0.5">
                {client.eventDateFormatted}
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-[#C5A880] block">
                Akad Nikah / Pemberkatan
              </span>
              <p className="font-semibold text-stone-900 mt-0.5">
                {client.akadTime}
              </p>
              <p className="text-stone-600 mt-0.5">{client.akadVenue}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-[#C5A880] block">
                Resepsi Pernikahan
              </span>
              <p className="font-semibold text-stone-900 mt-0.5">
                {client.resepsiTime}
              </p>
              <p className="text-stone-600 mt-0.5">{client.resepsiVenue}, {client.city}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#C5A880]" />
            <span>Tanda Kasih &amp; Rekening Terdaftar</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase">
                Rekening Utama
              </span>
              <div className="font-bold text-stone-900 text-sm font-mono tabular-nums">
                {client.bankName} - {client.accountNumber}
              </div>
              <div className="text-stone-600 text-xs">
                a.n {client.accountHolder}
              </div>
            </div>

            {client.secondaryBankName && (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">
                  Rekening Sekunder
                </span>
                <div className="font-bold text-stone-900 text-sm font-mono tabular-nums">
                  {client.secondaryBankName} - {client.secondaryAccountNumber}
                </div>
                <div className="text-stone-600 text-xs">
                  a.n {client.secondaryAccountHolder}
                </div>
              </div>
            )}

            <div className="p-3 bg-[#FAF7F2] border border-[#C5A880]/30 rounded-xl text-[11px] text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800">Perlu mengubah jam acara atau nomor rekening?</p>
              <p className="text-stone-500">
                Untuk menjaga keaslian desain dan keamanan data, perubahan detail acara dapat langsung dikonfirmasikan kepada Admin Sekarsiti Studio melalui WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Music className="w-4 h-4 text-[#C5A880]" />
            <span>Musik Undangan</span>
          </h3>
          <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-bold">
            WebM • Cloudinary
          </span>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
            Judul lagu
          </label>
          <input
            type="text"
            value={musicTitle}
            onChange={(event) => setMusicTitle(event.target.value)}
            placeholder="Contoh: Our Song - Acoustic"
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C5A880]/30"
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleMusicUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingMusic}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#181816] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
            >
              {isUploadingMusic ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Mengubah &amp; mengunggah...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-[#C5A880]" />
                  <span>Pilih File Musik</span>
                </>
              )}
            </button>
          </div>

          {musicError && (
            <p className="rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs px-3 py-2">
              {musicError}
            </p>
          )}

          {musicUrl ? (
            <div className="rounded-xl border border-[#E6DDCE] bg-[#FAF7F2] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2">
                Preview audio
              </p>
              <audio controls src={musicUrl} className="w-full h-10" />
            </div>
          ) : (
            <p className="text-xs text-stone-500">
              Belum ada musik yang tersimpan untuk undangan ini. Upload file audio untuk dipakai sebagai musik latar undangan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
