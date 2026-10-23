import React, { useRef, useState } from 'react';
import { Upload, X, Plus, Image as ImageIcon, Film, Link2, Check, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaSlotDefinition } from '../../admin/templateRegistry';
import { normalizeMediaUrl, parseMultipleMediaUrls } from '../../services/mediaAssetAssistant';
import { uploadToCloudinary, isCloudinaryConfigured, isVideoUrl } from '../../utils/cloudinaryUpload';

// Library of high-res authentic wedding photos ready for quick pick
const ASSET_LIBRARY = [
  { label: 'Potret Mempelai Berdua (Editorial)', src: '/images/editorial_couple_portrait_1790838636662.jpg' },
  { label: 'Mempelai Wanita Gaun Sutra & Veil', src: '/images/wedding_bride_veil_1790901501919.jpg' },
  { label: 'Mempelai Pria Jas Hitam Klasik', src: '/images/editorial_groom_portrait_1790915490996.jpg' },
  { label: 'Sepasang Cincin Emas di Meja Travertine', src: '/images/editorial_venue_rings_1790838653826.jpg' },
  { label: 'Buket Mawar Putih & Buku Sumpah', src: '/images/wedding_vows_bouquet_1790901516667.jpg' },
  { label: 'Tarian Pertama di Bawah Cahaya Lampu', src: '/images/wedding_dance_lights_1790901533590.jpg' },
  { label: 'Sepatu Pengantin & Perhiasan Antik', src: '/images/wedding_shoes_jewelry_1790901548736.jpg' },
  { label: 'Pasangan Analog 35mm Vintage', src: '/images/film_vintage_couple_1791034007642.jpg' },
  { label: 'Pasangan Outdoor Sage Botanical', src: '/images/sage_outdoor_couple_portrait_1790919006777.jpg' },
  { label: 'Resepsi Onyx Emerald Art Deco', src: '/images/art_deco_emerald_couple_1790840336340.jpg' },
  { label: 'Segel Lilin Emas Monogram KA', src: '/images/wax_seal_gold_monogram_1790915522548.jpg' },
];

const VIDEO_LIBRARY = [
  { label: 'Video Sinematik Pasangan (Editorial Daylight)', src: '/videos/wedding-cinematic.mp4' },
  { label: 'Video Sinematik Resepsi Malam (Evening Ballroom)', src: '/videos/wedding-evening.mp4' },
];

interface MediaSlotUploaderProps {
  slot: MediaSlotDefinition;
  value: string | string[] | undefined;
  onChange: (newValue: string | string[]) => void;
}

export const MediaSlotUploader: React.FC<MediaSlotUploaderProps> = ({
  slot,
  value,
  onChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Single vs Multiple
  const isMultiple = Boolean(slot.isMultiple);
  const currentImages: string[] = isMultiple 
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (typeof value === 'string' && value ? [value] : []);

  // Handle local device file upload via Cloudinary (or fallback to FileReader data URL)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    const fileList = Array.from(files);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgressText(
          fileList.length > 1 ? `Mengunggah ${i + 1}/${fileList.length}...` : 'Mengunggah...'
        );
        if (isCloudinaryConfigured) {
          const cloudinaryUrl = await uploadToCloudinary(file);
          uploadedUrls.push(cloudinaryUrl);
        } else {
          // Fallback jika Cloudinary env belum diset
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve((event.target?.result as string) || '');
            reader.readAsDataURL(file);
          });
          if (dataUrl) uploadedUrls.push(dataUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        if (isMultiple) {
          onChange([...currentImages, ...uploadedUrls]);
        } else {
          onChange(uploadedUrls[0]);
        }
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      setUploadError(err?.message || 'Gagal mengunggah file.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectFromLibrary = (src: string) => {
    if (isMultiple) {
      onChange([...currentImages, src]);
    } else {
      onChange(src);
    }
  };

  const handleAddFromGDriveOrUrl = () => {
    if (!urlInputValue.trim()) return;
    if (isMultiple) {
      const parsedUrls = parseMultipleMediaUrls(urlInputValue);
      if (parsedUrls.length > 0) {
        onChange([...currentImages, ...parsedUrls]);
      }
    } else {
      const normalized = normalizeMediaUrl(urlInputValue);
      if (normalized) {
        onChange(normalized);
      }
    }
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (isMultiple) {
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    if (!isMultiple) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentImages.length) return;
    const next = [...currentImages];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  };

  const handleClearAll = () => {
    if (isMultiple) {
      onChange([]);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-3 p-4 bg-[#F8F7F4] border border-[#E8E4DD] rounded-xl text-left">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#181816] tracking-wide flex items-center gap-1.5">
            {slot.videoOnly ? (
              <Film className="w-3.5 h-3.5 text-[#C5A880]" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
            )}
            <span>{slot.label}</span>
            {slot.acceptsVideo && (
              <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800 border border-amber-300/60">
                {slot.videoOnly ? 'Video MP4/WebM' : 'Foto / Video'}
              </span>
            )}
          </p>
          <p className="text-[11px] text-[#78756E] mt-0.5">
            {slot.description}
          </p>
        </div>
        <span className="text-[10px] font-mono text-[#78756E]">
          Rasio {slot.aspectRatio}
        </span>
      </div>

      {/* Render Error Message */}
      {uploadError && (
        <p className="text-[11px] text-red-600 font-medium px-1">
          {uploadError}
        </p>
      )}

      {/* Render Current Uploaded / Selected Images or Videos */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {currentImages.map((src, idx) => {
            const isVid = isVideoUrl(src);
            return (
              <div 
                key={idx} 
                className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-200/70 border border-[#E8E4DD] shadow-2xs"
              >
                {isVid ? (
                  <video
                    src={src}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={src} 
                    alt={`${slot.label} ${idx + 1}`} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors opacity-90 group-hover:opacity-100 cursor-pointer"
                  title="Hapus media ini"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1.5 text-[9px] font-mono tabular-nums text-white/90 bg-black/60 px-1.5 rounded flex items-center gap-1">
                  {isVid && <Film className="w-2.5 h-2.5 text-amber-300" />}
                  <span>{isVid ? `VIDEO #${idx + 1}` : `#${idx + 1}`}</span>
                </span>
                {isMultiple && currentImages.length > 1 && (
                  <div className="absolute bottom-1 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveImage(idx, -1)}
                      className="p-0.5 bg-black/70 hover:bg-black text-white rounded disabled:opacity-30 cursor-pointer"
                      title="Geser ke kiri"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentImages.length - 1}
                      onClick={() => handleMoveImage(idx, 1)}
                      className="p-0.5 bg-black/70 hover:bg-black text-white rounded disabled:opacity-30 cursor-pointer"
                      title="Geser ke kanan"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Optional GDrive / Direct URL Input Row */}
      {showUrlInput && (
        <div className="p-3 bg-white border border-[#D5D0C6] rounded-lg space-y-2">
          <label className="block text-[11px] font-medium text-stone-700">
            {isMultiple
              ? 'Tempel 1 atau beberapa link Google Drive / URL foto, pisahkan dengan koma:'
              : slot.acceptsVideo
                ? 'Tempel link Google Drive atau URL langsung gambar / video (.mp4 / .webm):'
                : 'Tempel link Google Drive atau URL gambar:'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              placeholder={slot.acceptsVideo ? 'https://... (.jpg / .mp4 / .webm) atau link GDrive' : 'https://drive.google.com/open?id=... atau URL foto'}
              className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:border-[#C5A880]"
            />
            <button
              type="button"
              onClick={handleAddFromGDriveOrUrl}
              className="px-3 py-1.5 bg-[#141413] hover:bg-stone-800 text-[#FAF8F3] rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Pasang Link</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(false);
                setUrlInputValue('');
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-stone-500">
            Otomatis mengubah tautan <span className="font-mono">drive.google.com/open?id=...</span> menjadi gambar langsung, atau mendukung URL langsung file video <span className="font-mono">.mp4 / .webm</span>.
          </p>
        </div>
      )}

      {/* Action Controls: Upload from device, paste GDrive/direct link, or pick from curated library */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EAE6DE]">
        <input 
          ref={fileInputRef}
          type="file" 
          accept={
            slot.videoOnly
              ? 'video/mp4,video/webm,video/quicktime,video/*'
              : slot.acceptsVideo
                ? 'image/*,video/mp4,video/webm,video/quicktime,video/*'
                : 'image/*'
          } 
          multiple={isMultiple}
          onChange={handleFileChange}
          className="hidden" 
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-neutral-50 border border-[#D5D0C6] text-[#242321] rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 text-[#C5A880] animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
          )}
          <span>
            {isUploading
              ? uploadProgressText || 'Mengunggah...'
              : slot.videoOnly
                ? 'Unggah Video'
                : slot.acceptsVideo
                  ? 'Unggah Foto / Video'
                  : isMultiple
                    ? 'Unggah Foto (Bisa Pilih Banyak Sekaligus)'
                    : 'Unggah File'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowUrlInput(prev => !prev)}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-neutral-50 border border-[#D5D0C6] text-[#242321] rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <Link2 className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Tempel Link GDrive / URL</span>
        </button>

        {/* Quick Pick Dropdown from Library */}
        <div className="relative group">
          <button
            type="button"
            className="inline-flex items-center gap-1 py-1.5 px-3 bg-white hover:bg-neutral-50 border border-[#D5D0C6] text-[#605C55] rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Pilih dari Galeri Sekarsiti</span>
          </button>

          <div className="hidden group-hover:block absolute left-0 bottom-full mb-1 z-30 w-72 max-h-64 overflow-y-auto bg-white border border-[#E5E0D8] rounded-xl shadow-xl p-2 space-y-1">
            {slot.acceptsVideo && (
              <>
                <p className="text-[10px] font-semibold text-[#8C867C] px-2 py-1 tracking-wider">
                  Pustaka Video Sinematik Sekarsiti
                </p>
                {VIDEO_LIBRARY.map((vid, i) => (
                  <button
                    key={`vid-${i}`}
                    type="button"
                    onClick={() => handleSelectFromLibrary(vid.src)}
                    className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#FAF7F2] text-left transition-colors cursor-pointer text-xs"
                  >
                    <div className="w-9 h-9 rounded shrink-0 border border-[#E5E0D8] bg-stone-900 flex items-center justify-center text-amber-300">
                      <Film className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-[#242321] truncate">{vid.label}</span>
                  </button>
                ))}
              </>
            )}
            {!slot.videoOnly && (
              <>
                <p className="text-[10px] font-semibold text-[#8C867C] px-2 py-1 tracking-wider">
                  Pustaka Foto Pre-wedding Sekarsiti
                </p>
                {ASSET_LIBRARY.map((asset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectFromLibrary(asset.src)}
                    className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#FAF7F2] text-left transition-colors cursor-pointer text-xs"
                  >
                    <img src={asset.src} alt={asset.label} referrerPolicy="no-referrer" className="w-9 h-9 object-cover rounded shrink-0 border border-[#E5E0D8]" />
                    <span className="text-[11px] text-[#242321] truncate">{asset.label}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {isMultiple && currentImages.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
            title="Hapus semua foto pada slot ini"
          >
            <Trash2 className="w-3 h-3" />
            <span>Kosongkan ({currentImages.length})</span>
          </button>
        )}

        {isMultiple && (
          <span className="text-[10px] text-[#8C867C] ml-auto font-mono tabular-nums">
            {currentImages.length} file terpasang (bebas jumlah · tanpa batas)
          </span>
        )}
      </div>
    </div>
  );
};
