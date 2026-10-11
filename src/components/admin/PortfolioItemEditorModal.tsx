import React, { useState } from 'react';
import { X, Upload, Music, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { PortfolioItemData } from '../../types/portfolio';
import { TEMPLATE_REGISTRY } from '../../admin/templateRegistry';
import { uploadMusicToCloudinary } from '../../services/musicService';

interface PortfolioItemEditorModalProps {
  item: PortfolioItemData;
  onClose: () => void;
  onSave: (updatedItem: PortfolioItemData) => void;
}

export const PortfolioItemEditorModal: React.FC<PortfolioItemEditorModalProps> = ({
  item,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<PortfolioItemData>({ ...item });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleChange = (field: keyof PortfolioItemData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadMessage('Mengunggah & mengonversi audio...');
      const uploadedUrl = await uploadMusicToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        audioUrl: uploadedUrl,
        songTitle: file.name.replace(/\.[^/.]+$/, '')
      }));
      setUploadMessage('Audio berhasil diunggah!');
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah audio. Pastikan format file valid.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-stone-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#C5A880]" />
          <h3 className="text-xl font-serif font-bold text-stone-900">
            Edit Item Showcase Portfolio
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-6">
          Perubahan aset di sini bersifat independen dan <span className="font-semibold text-emerald-700">tidak merusak/mengubah</span> data undangan asli milik klien.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Judul Portfolio Showcase
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => handleChange('slug', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Nama Mempelai Wanita
              </label>
              <input
                type="text"
                value={formData.brideName}
                onChange={e => handleChange('brideName', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Nama Mempelai Pria
              </label>
              <input
                type="text"
                value={formData.groomName}
                onChange={e => handleChange('groomName', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Tanggal Perayaan
              </label>
              <input
                type="text"
                value={formData.eventDate}
                onChange={e => handleChange('eventDate', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Kota / Lokasi
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <label className="block font-medium text-stone-800 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#C5A880]" />
              <span>Aset Visual & Foto Utama</span>
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">
                  URL Cover/Thumbnail Sampul Katalog
                </label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={e => handleChange('coverImage', e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">
                  URL Foto Hero Utama
                </label>
                <input
                  type="text"
                  value={formData.heroImage}
                  onChange={e => handleChange('heroImage', e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <label className="block font-medium text-stone-800 mb-2 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-[#C5A880]" />
              <span>Musik & Lagu Demo Showcase</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">
                  Judul Musik Demo
                </label>
                <input
                  type="text"
                  value={formData.songTitle}
                  onChange={e => handleChange('songTitle', e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">
                  Upload Musik Baru (MP3/WebM)
                </label>
                <label className="flex items-center justify-center gap-2 p-2 bg-stone-100 hover:bg-stone-200 rounded-lg border border-dashed border-stone-300 cursor-pointer text-stone-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{isUploading ? 'Mengunggah...' : 'Pilih File Lagu'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {uploadMessage && (
              <p className="text-[11px] text-emerald-700 mt-1">{uploadMessage}</p>
            )}

            {formData.audioUrl && (
              <p className="text-[10px] text-stone-500 font-mono mt-1 truncate">
                Audio URL: {formData.audioUrl}
              </p>
            )}
          </div>

          <div className="border-t border-stone-100 pt-4">
            <label className="block font-medium text-stone-800 mb-2">
              Kutipan & Doa
            </label>
            <div className="space-y-3">
              <textarea
                value={formData.quoteText}
                onChange={e => handleChange('quoteText', e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                placeholder="Teks kutipan/doa..."
              />
              <input
                type="text"
                value={formData.quoteSource}
                onChange={e => handleChange('quoteSource', e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none"
                placeholder="Sumber kutipan (misal: Ar-Rum: 21)"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2C2E28] hover:bg-[#414A35] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
