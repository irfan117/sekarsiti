import React, { useEffect, useState } from 'react';
import { Calendar, Heart, Music } from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';
import { MusicSelector } from '../admin/editor/MusicSelector';
import { isPlayableAudioUrl } from '../../services/musicService';

interface PortalInfoTabProps {
  client: ClientInvitationData;
  onClientUpdated?: (updated: ClientInvitationData) => void;
}

export const PortalInfoTab: React.FC<PortalInfoTabProps> = ({ client, onClientUpdated }) => {
  const [musicTitle, setMusicTitle] = useState(client.songTitle || 'Lagu Undangan');
  const [musicUrl, setMusicUrl] = useState(client.audioUrl || '');
  const [musicError, setMusicError] = useState('');

  useEffect(() => {
    setMusicTitle(client.songTitle || 'Lagu Undangan');
    setMusicUrl(client.audioUrl || '');
  }, [client]);

  const persistMusic = (songTitle: string, audioUrl: string) => {
    try {
      setMusicError('');
      const safeTitle = songTitle.trim() || 'Lagu Custom';
      const updatedClient = AdminStore.update(client.id, {
        songTitle: safeTitle,
        audioUrl,
      });
      setMusicTitle(safeTitle);
      setMusicUrl(audioUrl);
      onClientUpdated?.(updatedClient);
    } catch (error: any) {
      console.error('Gagal menyimpan musik portal:', error);
      setMusicError(error?.message || 'Gagal menyimpan musik undangan.');
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
              <p className="font-semibold text-stone-900 mt-0.5">{client.eventDateFormatted}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-[#C5A880] block">
                Akad Nikah / Pemberkatan
              </span>
              <p className="font-semibold text-stone-900 mt-0.5">{client.akadTime}</p>
              <p className="text-stone-600 mt-0.5">{client.akadVenue}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] uppercase font-bold text-[#C5A880] block">
                Resepsi Pernikahan
              </span>
              <p className="font-semibold text-stone-900 mt-0.5">{client.resepsiTime}</p>
              <p className="text-stone-600 mt-0.5">
                {client.resepsiVenue}, {client.city}
              </p>
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
              <span className="text-[10px] font-bold text-stone-400 uppercase">Rekening Utama</span>
              <div className="font-bold text-stone-900 text-sm font-mono tabular-nums">
                {client.bankName} - {client.accountNumber}
              </div>
              <div className="text-stone-600 text-xs">a.n {client.accountHolder}</div>
            </div>

            {client.secondaryBankName && (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">
                  Rekening Sekunder
                </span>
                <div className="font-bold text-stone-900 text-sm font-mono tabular-nums">
                  {client.secondaryBankName} - {client.secondaryAccountNumber}
                </div>
                <div className="text-stone-600 text-xs">a.n {client.secondaryAccountHolder}</div>
              </div>
            )}

            <div className="p-3 bg-[#FAF7F2] border border-[#C5A880]/30 rounded-xl text-[11px] text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800">
                Perlu mengubah jam acara atau nomor rekening?
              </p>
              <p className="text-stone-500">
                Untuk menjaga keaslian desain dan keamanan data, perubahan detail acara dapat
                langsung dikonfirmasikan kepada Admin Sekarsiti Studio melalui WhatsApp.
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
            Katalog • Upload Custom
          </span>
        </div>

        <p className="text-xs text-stone-500">
          Pilih dari katalog admin atau upload file audio custom (MP3/WAV/M4A) untuk musik latar
          undangan Anda.
        </p>

        <MusicSelector
          mode="client"
          currentSongTitle={musicTitle}
          currentAudioUrl={musicUrl}
          clientCustomTrack={client.mediaSlots?.customMusicTrack || client.customMusicTrack || null}
          onClientCustomTrackChange={(newTrack) => {
            const nextMediaSlots = {
              ...(client.mediaSlots || { galleryImages: [] }),
              customMusicTrack: newTrack || undefined,
            };
            if (!newTrack) {
              delete nextMediaSlots.customMusicTrack;
            }
            const updated = AdminStore.update(client.id, {
              mediaSlots: nextMediaSlots,
              customMusicTrack: newTrack || undefined,
            });
            onClientUpdated?.(updated);
          }}
          onSelect={(songTitle, audioUrl) => persistMusic(songTitle, audioUrl)}
        />

        {musicError && (
          <p className="rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs px-3 py-2">
            {musicError}
          </p>
        )}

        {!isPlayableAudioUrl(musicUrl) && (
          <p className="text-xs text-stone-500">
            Belum ada musik yang tersimpan untuk undangan ini. Upload file audio atau pilih dari
            katalog.
          </p>
        )}
      </div>
    </div>
  );
};
