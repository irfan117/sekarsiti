import React, { useEffect, useRef, useState } from 'react';
import { ClientInvitationData } from '../../../types/clientInvitation';
import { CreditCard, Quote, Music, Upload, Loader2 } from 'lucide-react';
import { MusicSelector } from './MusicSelector';
import { TEMPLATE_REGISTRY } from '../../../admin/templateRegistry';
import { uploadMusicToCloudinary } from '../../../services/musicService';

interface GiftMusicSectionProps {
  formData: ClientInvitationData;
  selectedTemplateId?: keyof typeof TEMPLATE_REGISTRY;
  onChange: (field: keyof ClientInvitationData, value: any) => void;
}

export const GiftMusicSection: React.FC<GiftMusicSectionProps> = ({
  formData,
  selectedTemplateId,
  onChange
}) => {
  const [demoSongTitle, setDemoSongTitle] = useState(
    selectedTemplateId ? (TEMPLATE_REGISTRY[selectedTemplateId]?.defaultData?.songTitle || '') : ''
  );
  const [demoAudioUrl, setDemoAudioUrl] = useState(
    selectedTemplateId ? (TEMPLATE_REGISTRY[selectedTemplateId]?.defaultData?.audioUrl || '') : ''
  );
  const [demoUploadError, setDemoUploadError] = useState<string | null>(null);
  const [isUploadingDemoMusic, setIsUploadingDemoMusic] = useState(false);
  const demoFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!selectedTemplateId) return;

    const templateDefaults = TEMPLATE_REGISTRY[selectedTemplateId]?.defaultData;
    setDemoSongTitle(templateDefaults?.songTitle || '');
    setDemoAudioUrl(templateDefaults?.audioUrl || '');
  }, [selectedTemplateId]);

  const handleDemoTitleChange = (nextTitle: string) => {
    setDemoSongTitle(nextTitle);

    if (!selectedTemplateId) return;

    TEMPLATE_REGISTRY[selectedTemplateId].defaultData = {
      ...TEMPLATE_REGISTRY[selectedTemplateId].defaultData,
      songTitle: nextTitle,
    };

    onChange('songTitle', nextTitle);
  };

  const handleDemoTemplateMusicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTemplateId) return;

    setIsUploadingDemoMusic(true);
    setDemoUploadError(null);

    try {
      const uploadedUrl = await uploadMusicToCloudinary(file);
      const safeTitle = demoSongTitle.trim() || file.name.replace(/\.[^/.]+$/, '') || 'Demo Template Music';

      TEMPLATE_REGISTRY[selectedTemplateId].defaultData = {
        ...TEMPLATE_REGISTRY[selectedTemplateId].defaultData,
        songTitle: safeTitle,
        audioUrl: uploadedUrl,
      };

      setDemoSongTitle(safeTitle);
      setDemoAudioUrl(uploadedUrl);
      onChange('songTitle', safeTitle);
      onChange('audioUrl', uploadedUrl);
    } catch (error: any) {
      console.error('Gagal upload musik demo template:', error);
      setDemoUploadError(error?.message || 'Gagal mengunggah musik demo template.');
    } finally {
      setIsUploadingDemoMusic(false);
      if (demoFileInputRef.current) demoFileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl text-left space-y-5">
      <div>
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#C5A880]" />
          <span>Tanda Kasih (Amplop Digital) &amp; Musik Latar</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Atur rekening penerimaan tanda kasih dan lagu instrumen pengiring undangan.
        </p>
      </div>

      {/* Musik Latar Library & Upload */}
      <MusicSelector
        currentSongTitle={formData.songTitle}
        currentAudioUrl={formData.audioUrl}
        onSelect={(songTitle, audioUrl) => {
          onChange('songTitle', songTitle);
          onChange('audioUrl', audioUrl);
        }}
      />

      {selectedTemplateId && (
        <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A880] block flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              MUSIK DEMO TEMPLATE AKTIF
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-wide">{selectedTemplateId}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Judul musik demo template
            </label>
            <input
              type="text"
              value={demoSongTitle}
              onChange={(e) => handleDemoTitleChange(e.target.value)}
              placeholder="Judul musik demo"
              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              ref={demoFileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleDemoTemplateMusicUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => demoFileInputRef.current?.click()}
              disabled={isUploadingDemoMusic}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#181816] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
            >
              {isUploadingDemoMusic ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                  <span>Menyimpan musik demo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Upload musik demo template</span>
                </>
              )}
            </button>

            {demoAudioUrl && (
              <audio controls src={demoAudioUrl} className="h-9 w-full sm:max-w-xs" />
            )}
          </div>

          {demoUploadError && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{demoUploadError}</p>
          )}
        </div>
      )}

      {/* Primary Bank */}
      <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A880] block">
          REKENING BANK UTAMA
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Bank
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => onChange('bankName', e.target.value)}
              placeholder="BCA"
              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nomor Rekening
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => onChange('accountNumber', e.target.value)}
              placeholder="8271029384"
              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Atas Nama Pemilik
            </label>
            <input
              type="text"
              value={formData.accountHolder}
              onChange={(e) => onChange('accountHolder', e.target.value)}
              placeholder="Kirana Ayu Lestari"
              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Secondary Bank (Optional) */}
      <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
          REKENING BANK KEDUA (OPSIONAL)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Bank Kedua
            </label>
            <input
              type="text"
              value={formData.secondaryBankName || ''}
              onChange={(e) => onChange('secondaryBankName', e.target.value)}
              placeholder="Mandiri"
              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nomor Rekening Kedua
            </label>
            <input
              type="text"
              value={formData.secondaryAccountNumber || ''}
              onChange={(e) => onChange('secondaryAccountNumber', e.target.value)}
              placeholder="140001928374"
              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Atas Nama Pemilik Kedua
            </label>
            <input
              type="text"
              value={formData.secondaryAccountHolder || ''}
              onChange={(e) => onChange('secondaryAccountHolder', e.target.value)}
              placeholder="Adhitya Nugraha"
              className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Teks Kutipan Suci / Syair Doa</span>
          </label>
          <textarea
            rows={3}
            value={formData.quoteText}
            onChange={(e) => onChange('quoteText', e.target.value)}
            placeholder="Tuliskan ayat suci atau bait doa pembuka..."
            className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Sumber Kutipan
          </label>
          <input
            type="text"
            value={formData.quoteSource}
            onChange={(e) => onChange('quoteSource', e.target.value)}
            placeholder="Contoh: QS. Ar-Rum : 21"
            className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
