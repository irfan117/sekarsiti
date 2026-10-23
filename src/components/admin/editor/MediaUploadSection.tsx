import React, { useRef, useState } from 'react';
import { ClientInvitationData, StoryChapterData, TemplateId } from '../../../types/clientInvitation';
import { TEMPLATE_REGISTRY } from '../../../admin/templateRegistry';
import { MediaSlotUploader } from '../MediaSlotUploader';
import {
  ImageIcon,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Upload,
  Loader2,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { uploadToCloudinary, isCloudinaryConfigured, isVideoUrl } from '../../../utils/cloudinaryUpload';
import { normalizeMediaUrl } from '../../../services/mediaAssetAssistant';

interface MediaUploadSectionProps {
  formData: ClientInvitationData;
  selectedTemplateId: TemplateId;
  onMediaSlotChange: (slotKey: string, newValue: any) => void;
  onSmartAutoAssign?: () => void;
}

const DEFAULT_EDITORIAL_STORY_CHAPTERS: StoryChapterData[] = [
  {
    chapter: 'BABAK 01',
    date: 'Agustus 2019',
    location: 'Bandung · Sudut Baca Kampus',
    title: 'Titik Temu di Kota Kembang',
    quote: '“Pertemuan pertama yang tak disengaja di ruang baca kampus...”',
    story:
      'Dipertemukan dalam lingkaran perkuliahan di Bandung. Dari obrolan hangat tentang arsitektur, karya desain, dan secangkir kopi di sudut kota, kisah kami perlahan menemukan jalannya.',
    image: '',
  },
  {
    chapter: 'BABAK 02',
    date: 'November 2021',
    location: 'Jakarta & Denpasar · Meniti Karir',
    title: 'Saling Menguatkan Cita',
    quote: '“Menemukan ketenangan di tengah riuhnya langkah awal...”',
    story:
      'Menghadapi fase awal dunia kerja dan kesibukan yang sesekali memisahkan jarak, kami belajar arti saling percaya dan mendengarkan.',
    image: '',
  },
  {
    chapter: 'BABAK 03',
    date: 'Desember 2023',
    location: 'Jakarta Selatan · Ikrar Pertunangan',
    title: 'Satu Niat di Hadapan Keluarga',
    quote: '“Di hadapan kedua keluarga besar, doa-doa mulai berpadu...”',
    story:
      'Di hadapan kedua orang tua dan keluarga besar yang kami muliakan, sebuah cincin melingkar sebagai tanda kesungguhan hati untuk melangkah ke jenjang pernikahan.',
    image: '',
  },
  {
    chapter: 'BABAK 04',
    date: 'Februari 2027',
    location: 'Grand Ballroom Aryaduta · Janji Suci',
    title: 'Menyatukan Dua Jiwa',
    quote: '“Awal dari pelayaran panjang yang dibangun di atas cinta dan iman.”',
    story:
      'Kini, dengan penuh rasa syukur dan memohon ridho Allah SWT, kami melangkah menuju gerbang pernikahan suci dalam sakinah, mawaddah, dan rahmah.',
    image: '',
  },
];

export const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  formData,
  selectedTemplateId,
  onMediaSlotChange,
  onSmartAutoAssign,
}) => {
  const activeTemplateDef = TEMPLATE_REGISTRY[selectedTemplateId] || TEMPLATE_REGISTRY['ruang-rasa'];
  const [uploadingChapterIdx, setUploadingChapterIdx] = useState<number | null>(null);
  const [chapterUploadError, setChapterUploadError] = useState<string | null>(null);
  const chapterFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Kumpulan foto asli yang sudah diupload admin di undangan ini (untuk pilihan cepat di Our Story)
  const uploadedInvitationPhotos = React.useMemo(() => {
    const slots = formData.mediaSlots || { galleryImages: [] };
    const list: string[] = [];
    const addIfPhoto = (url?: string) => {
      if (url && typeof url === 'string' && url.trim() && !isVideoUrl(url) && !list.includes(url)) {
        list.push(url);
      }
    };
    addIfPhoto(slots.heroImage);
    addIfPhoto(slots.bridePortrait);
    addIfPhoto(slots.groomPortrait);
    addIfPhoto(slots.spotlightImage);
    addIfPhoto(slots.closingImage);
    (slots.galleryImages || []).forEach(addIfPhoto);
    (slots.leftPanelImages || []).forEach(addIfPhoto);
    (slots.filmstripImages || []).forEach(addIfPhoto);
    return list;
  }, [formData.mediaSlots]);

  const storyChapters: StoryChapterData[] = Array.isArray(formData.mediaSlots?.storyChapters)
    ? formData.mediaSlots.storyChapters
    : [];

  const updateStoryChapters = (nextChapters: StoryChapterData[]) => {
    onMediaSlotChange('storyChapters', nextChapters);
  };

  const handleAddStoryChapter = () => {
    const nextNum = String(storyChapters.length + 1).padStart(2, '0');
    const fallbackImg = uploadedInvitationPhotos[storyChapters.length % Math.max(1, uploadedInvitationPhotos.length)] || '';
    updateStoryChapters([
      ...storyChapters,
      {
        chapter: `BABAK ${nextNum}`,
        date: 'Tahun / Bulan',
        location: 'Lokasi Momen',
        title: `Judul Babak ${nextNum}`,
        quote: '“Kutipan singkat momen...”',
        story: 'Tuliskan cerita perjalanan cinta pada babak ini...',
        image: fallbackImg,
      },
    ]);
  };

  const handleLoadSampleStoryChapters = () => {
    const populated = DEFAULT_EDITORIAL_STORY_CHAPTERS.map((ch, idx) => ({
      ...ch,
      image: uploadedInvitationPhotos[idx % Math.max(1, uploadedInvitationPhotos.length)] || '',
    }));
    updateStoryChapters(populated);
  };

  const handleUpdateChapterField = (index: number, field: keyof StoryChapterData, value: string) => {
    const next = storyChapters.map((ch, i) => (i === index ? { ...ch, [field]: value } : ch));
    updateStoryChapters(next);
  };

  const handleRemoveChapter = (index: number) => {
    updateStoryChapters(storyChapters.filter((_, i) => i !== index));
  };

  const handleMoveChapter = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= storyChapters.length) return;
    const next = [...storyChapters];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    updateStoryChapters(next);
  };

  const handleChapterFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setChapterUploadError(null);
    setUploadingChapterIdx(index);

    try {
      let imageUrl = '';
      if (isCloudinaryConfigured) {
        imageUrl = await uploadToCloudinary(file);
      } else {
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve((ev.target?.result as string) || '');
          reader.readAsDataURL(file);
        });
      }
      if (imageUrl) {
        handleUpdateChapterField(index, 'image', imageUrl);
      }
    } catch (err: any) {
      setChapterUploadError(err?.message || 'Gagal mengunggah foto babak kisah.');
    } finally {
      setUploadingChapterIdx(null);
      if (chapterFileInputRefs.current[index]) {
        chapterFileInputRefs.current[index]!.value = '';
      }
    }
  };

  return (
    <div className="max-w-3xl text-left space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#C5A880]" />
            <span>Slot Media, Foto &amp; Our Story: {activeTemplateDef.name}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Semua foto di undangan berasal 100% dari unggahan Admin di bawah ini (tidak ada batas minimal maupun maksimal jumlah foto).
          </p>
        </div>

        {onSmartAutoAssign && (
          <button
            type="button"
            onClick={onSmartAutoAssign}
            title="Sistem akan mengurutkan & mendistribusikan foto yang tersedia ke hero, mempelai, filmstrip, dan galeri secara cerdas"
            className="px-3.5 py-2 bg-gradient-to-r from-amber-50 to-stone-100 hover:from-amber-100 hover:to-stone-200 border border-amber-300/80 rounded-xl text-xs font-bold text-stone-800 flex items-center gap-2 shadow-2xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Tata Ulang Aset Cerdas</span>
          </button>
        )}
      </div>

      {/* Daftar Slot Media Template */}
      <div className="space-y-4">
        {activeTemplateDef.mediaSlots.map((slot) => (
          <MediaSlotUploader
            key={slot.key}
            slot={slot}
            value={(formData.mediaSlots as any)[slot.key]}
            onChange={(newVal) => onMediaSlotChange(slot.key, newVal)}
          />
        ))}
      </div>

      {/* CRUD Babak Kisah Cinta / Our Story (Bebas Jumlah Babak & Foto Asli Admin) */}
      {activeTemplateDef.hasStoryChapters && (
        <div className="p-5 bg-[#FAF8F4] border border-[#E5E0D8] rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0D8]">
            <div>
              <h3 className="text-xs font-bold text-[#181816] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#C5A880]" />
                <span>CRUD Babak Kisah Cinta (Our Story / Journey)</span>
              </h3>
              <p className="text-[11px] text-[#78756E] mt-0.5">
                Atur foto dan cerita setiap babak perjalanan cinta. Bebas jumlah babak (bisa 1, 4, 10+ babak, atau dikosongkan jika tidak ingin menampilkan section Our Story).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {storyChapters.length === 0 && (
                <button
                  type="button"
                  onClick={handleLoadSampleStoryChapters}
                  className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-[#D5D0C6] text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Isi 4 Babak Awal
                </button>
              )}
              {storyChapters.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateStoryChapters([])}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Kosongkan Semua</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleAddStoryChapter}
                className="px-3 py-1.5 bg-[#181816] hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Tambah Babak Kisah</span>
              </button>
            </div>
          </div>

          {chapterUploadError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {chapterUploadError}
            </p>
          )}

          {storyChapters.length === 0 ? (
            <div className="p-4 bg-white border border-dashed border-stone-300 rounded-xl text-center space-y-2">
              <p className="text-xs text-stone-600 font-medium">
                Belum ada babak kisah cinta (Our Story) yang ditambahkan.
              </p>
              <p className="text-[11px] text-stone-500">
                Klik <strong>&ldquo;+ Tambah Babak Kisah&rdquo;</strong> atau <strong>&ldquo;Isi 4 Babak Awal&rdquo;</strong> untuk menambahkan cerita beserta foto asli klien. Jika dibiarkan kosong, section Our Story tidak akan menampilkan gambar bawaan template.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {storyChapters.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-[#E5E0D8] rounded-xl space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-[#181816] font-mono">
                      #{idx + 1} · {item.chapter || `BABAK 0${idx + 1}`} — {item.title || 'Tanpa Judul'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveChapter(idx, -1)}
                        className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                        title="Geser ke atas"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === storyChapters.length - 1}
                        onClick={() => handleMoveChapter(idx, 1)}
                        className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                        title="Geser ke bawah"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveChapter(idx)}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer ml-1"
                        title="Hapus babak ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Foto Babak Kisah */}
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="w-full sm:w-44 aspect-[16/10] bg-stone-100 border border-stone-200 rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <>
                          <img
                            src={item.image}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateChapterField(idx, 'image', '')}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full cursor-pointer"
                            title="Hapus foto babak"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-stone-400 text-center px-2">
                          Otomatis memakai foto unggahan admin jika dikosongkan
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={(el) => {
                            chapterFileInputRefs.current[idx] = el;
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleChapterFileUpload(idx, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploadingChapterIdx === idx}
                          onClick={() => chapterFileInputRefs.current[idx]?.click()}
                          className="py-1.5 px-3 bg-[#181816] hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {uploadingChapterIdx === idx ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                              <span>Mengunggah...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                              <span>Upload Foto Babak #{idx + 1}</span>
                            </>
                          )}
                        </button>

                        {uploadedInvitationPhotos.length > 0 && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateChapterField(idx, 'image', e.target.value);
                              }
                            }}
                            className="py-1.5 px-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-700 focus:outline-none"
                          >
                            <option value="">Pilih dari Foto yang Sudah Diupload ({uploadedInvitationPhotos.length})...</option>
                            {uploadedInvitationPhotos.map((photoUrl, pIdx) => (
                              <option key={pIdx} value={photoUrl}>
                                Gunakan Foto Unggahan #{pIdx + 1}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.image || ''}
                        onChange={(e) =>
                          handleUpdateChapterField(idx, 'image', normalizeMediaUrl(e.target.value))
                        }
                        placeholder="Atau tempel URL foto / link Google Drive untuk babak ini..."
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  {/* Metadata Babak: Label, Waktu, Lokasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                        Label Babak
                      </label>
                      <input
                        type="text"
                        value={item.chapter}
                        onChange={(e) => handleUpdateChapterField(idx, 'chapter', e.target.value)}
                        placeholder="BABAK 01"
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                        Waktu / Tanggal
                      </label>
                      <input
                        type="text"
                        value={item.date}
                        onChange={(e) => handleUpdateChapterField(idx, 'date', e.target.value)}
                        placeholder="Agustus 2019"
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                        Lokasi Momen
                      </label>
                      <input
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => handleUpdateChapterField(idx, 'location', e.target.value)}
                        placeholder="Bandung · Sudut Baca Kampus"
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Judul & Kutipan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                        Judul Babak
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateChapterField(idx, 'title', e.target.value)}
                        placeholder="Titik Temu di Kota Kembang"
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                        Kutipan Singkat (Opsional)
                      </label>
                      <input
                        type="text"
                        value={item.quote || ''}
                        onChange={(e) => handleUpdateChapterField(idx, 'quote', e.target.value)}
                        placeholder="“Pertemuan pertama yang tak disengaja...”"
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cerita / Narasi */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Narasi / Cerita Perjalanan
                    </label>
                    <textarea
                      rows={2}
                      value={item.story}
                      onChange={(e) => handleUpdateChapterField(idx, 'story', e.target.value)}
                      placeholder="Tuliskan kisah perjalanan pada babak ini..."
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
