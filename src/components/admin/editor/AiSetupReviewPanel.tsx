import React from 'react';
import { Check, Image as ImageIcon, Link2 } from 'lucide-react';
import { ParsedInvitationAiResult } from '../../../services/aiSetupAssistant';

interface AiSetupReviewPanelProps {
  parsedResult: ParsedInvitationAiResult;
  statusMessage: string;
  detectedMediaCount: number;
  applyMedia: boolean;
  onToggleApplyMedia: (checked: boolean) => void;
  onResetResult: () => void;
}

export const AiSetupReviewPanel: React.FC<AiSetupReviewPanelProps> = ({
  parsedResult,
  statusMessage,
  detectedMediaCount,
  applyMedia,
  onToggleApplyMedia,
  onResetResult
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-emerald-700 font-semibold">
          {detectedMediaCount} file media terdeteksi
        </span>
      </div>

      {/* Section 1: Data Pemesan, Mempelai & Acara */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="space-y-0.5">
          <span className="text-[10px] text-stone-500 font-semibold">Pasangan &amp; Slug URL</span>
          <p className="font-bold text-stone-900">{parsedResult.clientName || '-'}</p>
          <p className="text-[11px] font-mono text-stone-600">
            /{parsedResult.slug || '-'} · {parsedResult.clientPhone || 'No WA -'}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-stone-500 font-semibold">Tanggal &amp; Kota Acara</span>
          <p className="font-bold text-stone-900">{parsedResult.eventDateFormatted || '-'}</p>
          <p className="text-[11px] text-stone-600">{parsedResult.city || '-'}</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-stone-500 font-semibold">Template Terpilih</span>
          <p className="font-bold text-[#141413]">
            {parsedResult.recommendedTemplate || 'ruang-rasa'}
          </p>
          <p className="text-[11px] text-stone-500 truncate">
            Lagu: {parsedResult.songTitle || '-'}
          </p>
        </div>

        <div className="space-y-0.5 pt-2 border-t border-stone-200/80">
          <span className="text-[10px] text-stone-500 font-semibold">Mempelai Wanita</span>
          <p className="text-stone-900 font-semibold">
            {parsedResult.brideFullName || parsedResult.brideName || '-'}
          </p>
          <p className="text-[10px] text-stone-500">{parsedResult.brideParents || '-'}</p>
          {parsedResult.brideInstagram && (
            <p className="text-[10px] font-mono text-stone-600">{parsedResult.brideInstagram}</p>
          )}
        </div>

        <div className="space-y-0.5 pt-2 border-t border-stone-200/80">
          <span className="text-[10px] text-stone-500 font-semibold">Mempelai Pria</span>
          <p className="text-stone-900 font-semibold">
            {parsedResult.groomFullName || parsedResult.groomName || '-'}
          </p>
          <p className="text-[10px] text-stone-500">{parsedResult.groomParents || '-'}</p>
          {parsedResult.groomInstagram && (
            <p className="text-[10px] font-mono text-stone-600">{parsedResult.groomInstagram}</p>
          )}
        </div>

        <div className="space-y-0.5 pt-2 border-t border-stone-200/80">
          <span className="text-[10px] text-stone-500 font-semibold">Akad &amp; Resepsi</span>
          <p className="text-[11px] text-stone-800 font-medium">
            Akad: {parsedResult.akadTime || '-'} ({parsedResult.akadVenue || '-'})
          </p>
          <p className="text-[11px] text-stone-800 font-medium">
            Resepsi: {parsedResult.resepsiTime || '-'} ({parsedResult.resepsiVenue || '-'})
          </p>
        </div>

        <div className="space-y-0.5 pt-2 border-t border-stone-200/80 sm:col-span-2">
          <span className="text-[10px] text-stone-500 font-semibold">Amplop Digital (Rekening 1 &amp; 2)</span>
          <p className="text-[11px] text-stone-800 font-mono tabular-nums">
            1. {parsedResult.bankName || 'BCA'} {parsedResult.accountNumber || '-'} a.n {parsedResult.accountHolder || '-'}
            {parsedResult.secondaryBankName && (
              <>
                {' · '}2. {parsedResult.secondaryBankName} {parsedResult.secondaryAccountNumber || '-'} a.n {parsedResult.secondaryAccountHolder || '-'}
              </>
            )}
          </p>
        </div>

        <div className="space-y-0.5 pt-2 border-t border-stone-200/80">
          <span className="text-[10px] text-stone-500 font-semibold">Tautan Google Maps</span>
          <p className="text-[11px] font-mono text-stone-700 truncate">
            {parsedResult.mapsUrl || '-'}
          </p>
        </div>
      </div>

      {/* Section 2: Pratinjau Media & Foto yang Diekstrak dari GForm */}
      <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#C5A880] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                Peta Penempatan Aset Cerdas oleh AI ({detectedMediaCount} Aset Ditemukan)
              </h4>
              <p className="text-[10px] text-stone-500">
                AI mengidentifikasi dan menempatkan foto ke slot template secara otomatis berdasarkan konteks &amp; proporsi.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 self-start sm:self-auto">
            <input
              type="checkbox"
              checked={applyMedia}
              onChange={(e) => onToggleApplyMedia(e.target.checked)}
              className="rounded border-stone-300 text-[#141413] focus:ring-[#C5A880]"
            />
            <span>Terapkan Media ke Undangan</span>
          </label>
        </div>

        {/* Laporan Penempatan Aset Cerdas */}
        {parsedResult.assetPlacements && parsedResult.assetPlacements.length > 0 ? (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase">
              Distribusi Slot Template: {parsedResult.recommendedTemplate || 'ruang-rasa'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {parsedResult.assetPlacements.map((item, idx) => (
                <div
                  key={`${item.slotKey}-${idx}`}
                  className="bg-white p-2.5 rounded-lg border border-stone-200 flex gap-2.5 items-start shadow-2xs hover:border-[#C5A880] transition-colors"
                >
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                    <img
                      src={item.url}
                      alt={item.slotLabel}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-stone-900 truncate">
                        {item.slotLabel}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                          item.isCustom
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {item.isCustom ? 'Foto Klien' : 'Preset'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-tight line-clamp-2">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : detectedMediaCount > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {parsedResult.media?.heroImage && (
              <div className="bg-white p-2 rounded-lg border border-stone-200 space-y-1">
                <div className="aspect-[16/10] rounded overflow-hidden bg-stone-100">
                  <img
                    src={parsedResult.media.heroImage}
                    alt="Hero Sampul"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] font-semibold text-stone-800 truncate">Foto Sampul (Hero)</p>
              </div>
            )}

            {parsedResult.media?.bridePortrait && (
              <div className="bg-white p-2 rounded-lg border border-stone-200 space-y-1">
                <div className="aspect-[16/10] rounded overflow-hidden bg-stone-100">
                  <img
                    src={parsedResult.media.bridePortrait}
                    alt="Potret Mempelai Wanita"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] font-semibold text-stone-800 truncate">Potret Mempelai Wanita</p>
              </div>
            )}

            {parsedResult.media?.groomPortrait && (
              <div className="bg-white p-2 rounded-lg border border-stone-200 space-y-1">
                <div className="aspect-[16/10] rounded overflow-hidden bg-stone-100">
                  <img
                    src={parsedResult.media.groomPortrait}
                    alt="Potret Mempelai Pria"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] font-semibold text-stone-800 truncate">Potret Mempelai Pria</p>
              </div>
            )}

            {parsedResult.media?.galleryImages && parsedResult.media.galleryImages.length > 0 && (
              <div className="bg-white p-2 rounded-lg border border-stone-200 space-y-1">
                <div className="aspect-[16/10] rounded overflow-hidden bg-stone-100 relative">
                  <img
                    src={parsedResult.media.galleryImages[0]}
                    alt="Galeri Momen"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/75 text-white font-mono tabular-nums text-[9px] px-1.5 py-0.5 rounded">
                    {parsedResult.media.galleryImages.length} Foto
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-stone-800 truncate">
                  Galeri Prewedding ({parsedResult.media.galleryImages.length})
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-stone-500 italic">
            Tidak ada tautan foto/media yang disertakan pada teks GForm ini. Slot foto saat ini tidak akan ditimpa.
          </p>
        )}

        {parsedResult.media?.gdriveFolderUrl && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8] text-[11px]">
            <span className="text-stone-600 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Folder Google Drive Klien Terdeteksi:</span>
            </span>
            <a
              href={parsedResult.media.gdriveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#141413] underline hover:text-[#C5A880] truncate max-w-xs"
            >
              {parsedResult.media.gdriveFolderUrl}
            </a>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onResetResult}
        className="text-[11px] text-stone-500 hover:text-stone-800 underline block text-center cursor-pointer"
      >
        &larr; Kembali &amp; Edit Teks Masukan Google Form
      </button>
    </div>
  );
};
