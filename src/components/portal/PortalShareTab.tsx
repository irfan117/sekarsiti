import React, { useState, useRef } from 'react';
import {
  Send,
  Sparkles,
  Search,
  Users,
  Check,
  Phone,
  Copy,
  CheckCircle2,
  Globe,
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  ExternalLink,
  Zap
} from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';
import {
  downloadGuestExcelTemplate,
  parseGuestExcelFile,
  exportGuestLinksToExcel
} from '../../utils/guestExcelUtils';
import { BlastSenderModal } from './BlastSenderModal';

interface PortalShareTabProps {
  client: ClientInvitationData;
}

import { safeCopyToClipboard } from '../../utils/clipboardUtils';

export const PortalShareTab: React.FC<PortalShareTabProps> = ({ client }) => {
  // Mode pilihan: 'universal' (Satu Undangan untuk Semua Tanpa Nama) | 'personal' (Tamu Khusus & Impor Excel)
  const [shareType, setShareType] = useState<'universal' | 'personal'>('personal');

  // State Mode Universal (Satu Undangan untuk Semua)
  const [universalStyle, setUniversalStyle] = useState<'hide_name' | 'general_greeting'>('hide_name');
  const [customGeneralGreeting, setCustomGeneralGreeting] = useState('Bapak / Ibu / Saudara / i');

  // State Mode Tamu Khusus (Personal)
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestCategory, setNewGuestCategory] = useState('Keluarga');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State Impor Excel
  const [excelNotice, setExcelNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const getBaseInvitationUrl = (guestParam?: string) => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}${window.location.pathname}?client=${client.id}`;
    if (guestParam) {
      return `${base}&to=${encodeURIComponent(guestParam)}`;
    }
    return base;
  };

  const generateWhatsAppMessage = (guestName: string) => {
    const link = getBaseInvitationUrl(guestName);
    return `Kepada Yth.
*${guestName}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia pernikahan kami:

*${client.brideName} & ${client.groomName}*
🗓 ${client.eventDateFormatted}
📍 ${client.resepsiVenue}, ${client.city}

Tautan undangan digital personal Anda:
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.

Terima kasih,
*${client.brideName} & ${client.groomName}*`;
  };

  // Universal Link & Message
  const universalOptions = {
    hideGuestName: universalStyle === 'hide_name',
    customGreeting: universalStyle === 'general_greeting' ? customGeneralGreeting : undefined
  };
  const universalUrl = AdminStore.generateUniversalShareLink(client, universalOptions);
  const universalWaMessage = AdminStore.generateUniversalWhatsAppMessage(client, universalOptions);

  const handleCreateGuestLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    AdminStore.addGuestLink(client.id, {
      guestName: newGuestName.trim(),
      category: newGuestCategory,
      phone: newGuestPhone.trim()
    });

    setNewGuestName('');
    setNewGuestPhone('');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelNotice(null);

    try {
      const importedRows = await parseGuestExcelFile(file);
      const res = AdminStore.addGuestLinksBatch(client.id, importedRows);
      if (res.success) {
        setExcelNotice({
          type: 'success',
          text: `Berhasil mengimpor ${res.addedCount} tamu dari file "${file.name}".`
        });
      } else {
        setExcelNotice({
          type: 'error',
          text: 'Gagal menyimpan daftar tamu dari file Excel.'
        });
      }
    } catch (err: any) {
      setExcelNotice({
        type: 'error',
        text: err?.message || 'Format file Excel tidak dikenali.'
      });
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  const handleExportGuestListExcel = () => {
    const rows = (client.guestLinks || []).map(item => ({
      guestName: item.guestName,
      category: item.category,
      phone: item.phone,
      link: getBaseInvitationUrl(item.guestName),
      message: generateWhatsAppMessage(item.guestName)
    }));
    if (rows.length === 0) return;
    exportGuestLinksToExcel(client, rows);
  };

  const handleCopy = (id: string, text: string) => {
    safeCopyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendViaWhatsApp = (guestName: string, phone?: string) => {
    const message = generateWhatsAppMessage(guestName);
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredLinks = (client.guestLinks || []).filter(l =>
    l.guestName.toLowerCase().includes(guestSearchQuery.toLowerCase()) ||
    (l.category && l.category.toLowerCase().includes(guestSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Pilihan Mode Sebar Undangan: Satu untuk Semua vs Tamu Khusus */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">
            Pilih Cara Sebar Undangan Anda
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Gunakan satu link simpel tanpa nama untuk semua orang, atau buat link khusus per nama tamu (manual / impor Excel).
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 shrink-0">
          <button
            type="button"
            onClick={() => setShareType('universal')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              shareType === 'universal'
                ? 'bg-[#141413] text-[#FAF8F3] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Satu Link untuk Semua (Tanpa Nama)</span>
          </button>

          <button
            type="button"
            onClick={() => setShareType('personal')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              shareType === 'personal'
                ? 'bg-[#141413] text-[#FAF8F3] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Tamu Khusus &amp; Impor Excel ({client.guestLinks?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* TAMPILAN 1: SATU UNDANGAN UNTUK SEMUA TANPA NAMA TAMU */}
      {shareType === 'universal' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9A7D55]">
                <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
                Mode Praktis · Satu Undangan untuk Semua
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-1">
                Bagikan Tautan Umum Tanpa Nama Tamu Spesifik
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Cocok untuk disebarkan ke Grup WhatsApp, keluarga besar, bio Instagram, atau saat Anda tidak ingin mencantumkan nama tamu satu per satu.
              </p>
            </div>

            <a
              href={universalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shrink-0 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Tampilan Undangan</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800">
                  1. Pilih Tampilan Sapaan di Sampul Depan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUniversalStyle('hide_name')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      universalStyle === 'hide_name'
                        ? 'border-[#141413] bg-[#141413] text-white'
                        : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Tanpa Nama Tamu (Bersih)</span>
                      {universalStyle === 'hide_name' && <Check className="w-3.5 h-3.5 text-[#C5A880]" />}
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${universalStyle === 'hide_name' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Menghilangkan bagian &ldquo;Kepada Yth.&rdquo; pada sampul depan undangan.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUniversalStyle('general_greeting')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      universalStyle === 'general_greeting'
                        ? 'border-[#141413] bg-[#141413] text-white'
                        : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Sapaan Umum / Grup</span>
                      {universalStyle === 'general_greeting' && <Check className="w-3.5 h-3.5 text-[#C5A880]" />}
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${universalStyle === 'general_greeting' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Menampilkan sapaan umum seperti &ldquo;Bapak / Ibu / Saudara / i&rdquo; atau nama grup.
                    </p>
                  </button>
                </div>
              </div>

              {universalStyle === 'general_greeting' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Teks Sapaan Umum / Nama Grup:
                  </label>
                  <input
                    type="text"
                    value={customGeneralGreeting}
                    onChange={(e) => setCustomGeneralGreeting(e.target.value)}
                    placeholder="Contoh: Bapak / Ibu / Saudara / i atau Sahabat Alumni..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#C5A880]/50 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  2. Tautan Undangan Umum Anda:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={universalUrl}
                    className="flex-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy('universal-url', universalUrl)}
                    className="px-4 py-2.5 bg-[#141413] hover:bg-[#2C2E28] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedId === 'universal-url' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-800">
                  3. Format Pesan WhatsApp Umum / Grup:
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy('universal-msg', universalWaMessage)}
                  className="text-xs font-semibold text-[#9A7D55] hover:text-[#141413] flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'universal-msg' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pesan Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Pesan</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={7}
                value={universalWaMessage}
                className="w-full p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 font-sans leading-relaxed resize-none select-all"
              />

              <a
                href={`https://wa.me/?text=${encodeURIComponent(universalWaMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Bagikan Langsung ke WhatsApp / Grup</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAMPILAN 2: TAMU KHUSUS (MANUAL & IMPOR EXCEL) */}
      {shareType === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Impor Excel & Form Buat Link Tamu */}
          <div className="lg:col-span-5 space-y-5">
            {/* Kotak Impor Excel & Unduh Template */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3.5">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Impor Daftar Tamu dari Excel</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Punya banyak daftar tamu? Unduh template Excel resmi kami, isi nama tamu &amp; nomor WA, lalu unggah untuk membuat ratusan link sekaligus.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => downloadGuestExcelTemplate(client.slug || client.id)}
                  className="py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Template Excel (.xlsx)</span>
                </button>

                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportExcel}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => excelInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor File Excel</span>
                </button>
              </div>

              {excelNotice && (
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                    excelNotice.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {excelNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{excelNotice.text}</span>
                </div>
              )}
            </div>

            {/* Form Tambah Tamu Satu per Satu */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#C5A880]" />
                  <span>Tambah Tamu Satu per Satu</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Ketik nama tamu undangan. Sistem akan membuatkan tautan khusus dengan nama penerima di sampul depan undangan.
                </p>
              </div>

              <form onSubmit={handleCreateGuestLink} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Tamu Undangan *
                  </label>
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Contoh: Bpk. Ir. Hendra & Ibu / Sahabat SMA"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#C5A880]/50 focus:border-[#C5A880] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newGuestCategory}
                      onChange={(e) => setNewGuestCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:ring-2 focus:ring-[#C5A880]/50 outline-none"
                    >
                      <option value="Keluarga">Keluarga</option>
                      <option value="Sahabat">Sahabat Dekat</option>
                      <option value="Rekan Kerja">Rekan Kerja</option>
                      <option value="VIP">Tamu VIP</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      No. WhatsApp (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={newGuestPhone}
                      onChange={(e) => setNewGuestPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#C5A880]/50 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newGuestName.trim()}
                  className="w-full bg-[#141413] hover:bg-[#2C2E28] disabled:opacity-50 text-[#FAF8F3] py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Simpan &amp; Buat Tautan</span>
                </button>
              </form>

              <div className="pt-3 border-t border-stone-100 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Pratinjau Format Pesan Personal:
                </span>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {generateWhatsAppMessage(newGuestName || 'Nama Tamu')}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Daftar Link Tamu yang Sudah Dibuat */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Daftar Tautan Tamu Khusus ({filteredLinks.length})
                </h3>
                <p className="text-xs text-stone-400">
                  Klik tombol WhatsApp untuk langsung mengirim pesan personal ke tamu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(client.guestLinks?.length || 0) > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsBlastModalOpen(true)}
                      className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd54] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                      title="Mulai pengiriman otomatis berurutan"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Mode WA Blast</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportGuestListExcel}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      title="Unduh seluruh daftar tautan tamu ke Excel"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Ekspor Excel</span>
                    </button>
                  </>
                )}

                <div className="relative w-full sm:w-44">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={guestSearchQuery}
                    onChange={(e) => setGuestSearchQuery(e.target.value)}
                    placeholder="Cari nama tamu..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-[#C5A880] outline-none"
                  />
                </div>
              </div>
            </div>

            {filteredLinks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl space-y-2">
                <Users className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-600 font-medium">Belum ada daftar tamu khusus.</p>
                <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                  Tambahkan tamu di sebelah kiri, impor dari file Excel, atau gunakan tab <strong>Satu Link untuk Semua</strong> di atas jika ingin simpel tanpa nama tamu.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                {filteredLinks.map((link) => {
                  const guestUrl = getBaseInvitationUrl(link.guestName);

                  return (
                    <div
                      key={link.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        link.isSent
                          ? 'bg-stone-50/70 border-stone-200 opacity-80'
                          : 'bg-white border-stone-200 hover:border-[#C5A880]/50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-stone-900">
                              {link.guestName}
                            </h4>
                            {link.category && (
                              <span className="text-[11px] text-stone-500">
                                · {link.category}
                              </span>
                            )}
                            {link.phone && (
                              <span className="text-[11px] font-mono text-stone-400">
                                · {link.phone}
                              </span>
                            )}
                            {link.isSent && (
                              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                · <Check className="w-3 h-3" /> Terkirim
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-stone-400 font-mono truncate max-w-sm">
                            {guestUrl}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleSendViaWhatsApp(link.guestName, link.phone)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="Buka WhatsApp & Kirim"
                          >
                            <Phone className="w-3 h-3" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleCopy(link.id, guestUrl)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                            title="Salin Tautan Saja"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => AdminStore.toggleGuestLinkSent(client.id, link.id)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              link.isSent
                                ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                                : 'border-stone-200 text-stone-400 hover:text-stone-700'
                            }`}
                            title={link.isSent ? 'Tandai Belum Terkirim' : 'Tandai Sudah Terkirim'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('Hapus tamu ini dari daftar sebar?')) {
                                AdminStore.deleteGuestLink(client.id, link.id);
                              }
                            }}
                            className="p-1.5 text-stone-300 hover:text-red-500 rounded-lg transition-colors text-xs cursor-pointer"
                            title="Hapus"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal Pengiriman WA Blast / Teratur */}
      <BlastSenderModal
        client={client}
        isOpen={isBlastModalOpen}
        onClose={() => setIsBlastModalOpen(false)}
      />
    </div>
  );
};
