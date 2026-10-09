import React, { useState, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  Users,
  User,
  Download,
  Upload,
  Share2,
  Sparkles,
  Globe,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';
import {
  downloadGuestExcelTemplate,
  parseGuestExcelFile,
  exportGuestLinksToExcel,
  ImportedGuestRow
} from '../../utils/guestExcelUtils';
import { safeCopyToClipboard } from '../../utils/clipboardUtils';

interface GuestLinkModalProps {
  invitation: ClientInvitationData;
  onClose: () => void;
}

export const GuestLinkModal: React.FC<GuestLinkModalProps> = ({
  invitation,
  onClose
}) => {
  const [activeMode, setActiveMode] = useState<'universal' | 'single' | 'batch'>('universal');

  // 1. Universal (Satu Undangan untuk Semua) state
  const [universalStyle, setUniversalStyle] = useState<'hide_name' | 'general_greeting'>('hide_name');
  const [customGeneralGreeting, setCustomGeneralGreeting] = useState('Bapak / Ibu / Saudara / i');
  const [copiedUniversalLink, setCopiedUniversalLink] = useState(false);
  const [copiedUniversalMsg, setCopiedUniversalMsg] = useState(false);

  // 2. Single Guest Mode state
  const [guestNameInput, setGuestNameInput] = useState('Bpk. Hendra Wijaya & Keluarga');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // 3. Batch & Excel Mode state
  const [batchNamesText, setBatchNamesText] = useState(
    'Bpk. Hendra Wijaya & Keluarga\nIbu Siti Aminah & Suami\ndr. Danang Triputra\nKeluarga Besar Alm. H. Abdullah\nSahabat Kuliah Angkatan 2020'
  );
  const [importedMetaMap, setImportedMetaMap] = useState<Record<string, { category: string; phone: string }>>({});
  const [excelNotice, setExcelNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedBatchAll, setCopiedBatchAll] = useState(false);
  const [copiedRowIdx, setCopiedRowIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Universal link & message calculation
  const universalOptions = {
    hideGuestName: universalStyle === 'hide_name',
    customGreeting: universalStyle === 'general_greeting' ? customGeneralGreeting : undefined
  };
  const universalLink = AdminStore.generateUniversalShareLink(invitation, universalOptions);
  const universalMessage = AdminStore.generateUniversalWhatsAppMessage(invitation, universalOptions);

  // Single generation
  const singleLink = AdminStore.generateShareLink(invitation, guestNameInput.trim());
  const singleMessage = AdminStore.generateWhatsAppMessage(invitation, guestNameInput.trim());

  // Batch generation
  const guestNamesList = batchNamesText
    .split('\n')
    .map(n => n.trim())
    .filter(Boolean);

  const batchResults = AdminStore.generateBatchLinks(invitation, guestNamesList).map(item => ({
    ...item,
    category: importedMetaMap[item.guestName]?.category || 'Tamu Undangan',
    phone: importedMetaMap[item.guestName]?.phone || ''
  }));

  const handleCopyUniversalLink = () => {
    safeCopyToClipboard(universalLink);
    setCopiedUniversalLink(true);
    setTimeout(() => setCopiedUniversalLink(false), 2000);
  };

  const handleCopyUniversalMsg = () => {
    safeCopyToClipboard(universalMessage);
    setCopiedUniversalMsg(true);
    setTimeout(() => setCopiedUniversalMsg(false), 2000);
  };

  const handleCopySingleLink = () => {
    safeCopyToClipboard(singleLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySingleMessage = () => {
    safeCopyToClipboard(singleMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCopyBatchRow = (link: string, idx: number) => {
    safeCopyToClipboard(link);
    setCopiedRowIdx(idx);
    setTimeout(() => setCopiedRowIdx(null), 1800);
  };

  const handleCopyAllBatchText = () => {
    const combined = batchResults
      .map((item, i) => `--- [Tamu #${i + 1}: ${item.guestName}] ---\n${item.message}\n`)
      .join('\n');
    safeCopyToClipboard(combined);
    setCopiedBatchAll(true);
    setTimeout(() => setCopiedBatchAll(false), 2500);
  };

  const handleImportExcelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelNotice(null);

    try {
      const rows: ImportedGuestRow[] = await parseGuestExcelFile(file);
      const newMeta: Record<string, { category: string; phone: string }> = { ...importedMetaMap };
      rows.forEach(r => {
        newMeta[r.guestName] = { category: r.category, phone: r.phone };
      });
      setImportedMetaMap(newMeta);
      setBatchNamesText(rows.map(r => r.guestName).join('\n'));

      // Simpan juga ke daftar tautan tamu klien agar sinkron dengan Portal Klien
      AdminStore.addGuestLinksBatch(invitation.id, rows);

      setExcelNotice({
        type: 'success',
        text: `Berhasil mengimpor ${rows.length} tamu dari "${file.name}" dan menyimpannya ke Portal Klien.`
      });
    } catch (err: any) {
      setExcelNotice({
        type: 'error',
        text: err?.message || 'Gagal membaca file Excel.'
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportExcel = () => {
    exportGuestLinksToExcel(invitation, batchResults);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E0D8] bg-[#FAF7F2]">
          <div className="text-left">
            <h3 className="text-sm font-bold text-[#141413] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#C5A880]" />
              <span>Generator Tautan Undangan &amp; Impor Excel</span>
            </h3>
            <p className="text-xs text-[#7A756D] mt-0.5">
              Klien: <span className="font-semibold text-[#141413]">{invitation.clientName}</span> · ID: <span className="font-mono">{invitation.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex overflow-x-auto border-b border-stone-200 px-4 sm:px-6 bg-stone-50/70 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMode('universal')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
              activeMode === 'universal'
                ? 'border-[#C5A880] text-[#141413] font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Satu Undangan untuk Semua (Tanpa Nama)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
              activeMode === 'single'
                ? 'border-[#C5A880] text-[#141413] font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Tamu Khusus (Personal)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('batch')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
              activeMode === 'batch'
                ? 'border-[#C5A880] text-[#141413] font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Impor Excel / Massal ({guestNamesList.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-xs">

          {/* MODE 0: UNIVERSAL / SATU UNDANGAN UNTUK SEMUA TANPA NAMA TAMU */}
          {activeMode === 'universal' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-1">
                <span className="font-bold text-[#141413] flex items-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Satu Link Undangan untuk Semua (Simpel &amp; Praktis)</span>
                </span>
                <p className="text-[11px] text-[#7A756D] leading-relaxed">
                  Gunakan opsi ini jika Anda ingin membagikan satu tautan undangan ke grup WhatsApp, bio media sosial, atau ke banyak penerima sekaligus tanpa perlu mengetik nama tamu satu per satu.
                </p>
              </div>

              {/* Pilihan Gaya Sapaan Sampul */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#141413]">
                  Pilih Tampilan Sampul Undangan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUniversalStyle('hide_name')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      universalStyle === 'hide_name'
                        ? 'border-[#141413] bg-[#141413] text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Tanpa Nama Tamu (Polos)</span>
                      {universalStyle === 'hide_name' && <Check className="w-3.5 h-3.5 text-[#C5A880]" />}
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${universalStyle === 'hide_name' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Menyembunyikan kotak &ldquo;Kepada Yth.&rdquo; di sampul depan agar tampil bersih untuk semua orang.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUniversalStyle('general_greeting')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      universalStyle === 'general_greeting'
                        ? 'border-[#141413] bg-[#141413] text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
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
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#141413]">
                    Teks Sapaan Umum (Opsional):
                  </label>
                  <input
                    type="text"
                    value={customGeneralGreeting}
                    onChange={(e) => setCustomGeneralGreeting(e.target.value)}
                    placeholder="Contoh: Bapak / Ibu / Saudara / i atau Keluarga Besar..."
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D5D0C6] rounded-xl text-xs text-[#141413] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              )}

              {/* Generated Universal URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Tautan Undangan Umum (Satu untuk Semua)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={universalLink}
                    className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUniversalLink}
                    className="px-3.5 py-2.5 bg-[#141413] hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedUniversalLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUniversalLink ? 'Tersalin' : 'Salin Link'}</span>
                  </button>
                </div>
              </div>

              {/* Universal WhatsApp Message Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#141413]">
                    Format Pesan WhatsApp Umum / Grup
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyUniversalMsg}
                    className="text-[11px] text-[#C5A880] hover:text-[#9A7D55] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUniversalMsg ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUniversalMsg ? 'Pesan Tersalin!' : 'Salin Format Pesan'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={universalMessage}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl text-xs text-[#242321] leading-relaxed font-sans resize-none select-all"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(universalMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Bagikan ke WhatsApp</span>
                </a>
                <a
                  href={universalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Tautan</span>
                </a>
              </div>
            </div>
          )}

          {/* MODE 1: SINGLE GUEST */}
          {activeMode === 'single' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Nama Tamu yang Dituju (Personalisasi URL ?to=)
                </label>
                <input
                  type="text"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  placeholder="Contoh: Bpk. Ahmad Dahlan & Keluarga"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D5D0C6] rounded-xl text-xs text-[#141413] focus:outline-none focus:border-[#C5A880]"
                />
                <p className="text-[11px] text-[#7A756D]">
                  Nama tamu ini akan dicetak otomatis pada amplop sampul dan sambutan hangat undangan klien.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Tautan Undangan Khusus
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={singleLink}
                    className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopySingleLink}
                    className="px-3.5 py-2.5 bg-[#141413] hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin URL'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#141413]">
                    Pratinjau Pesan WhatsApp Otomatis
                  </label>
                  <button
                    type="button"
                    onClick={handleCopySingleMessage}
                    className="text-[11px] text-[#C5A880] hover:text-[#9A7D55] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMessage ? 'Teks Tersalin!' : 'Salin Format Teks'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={6}
                  value={singleMessage}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl text-xs text-[#242321] leading-relaxed font-sans resize-none select-all"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(singleMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim via WhatsApp Web / App</span>
                </a>

                <a
                  href={singleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Tautan</span>
                </a>
              </div>
            </div>
          )}

          {/* MODE 2: EXCEL IMPORT & BATCH GUEST GENERATOR */}
          {activeMode === 'batch' && (
            <div className="space-y-4">
              {/* Excel Import & Template Banner */}
              <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>Impor Daftar Tamu dari Excel (.xlsx / .csv)</span>
                    </span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Unduh template Excel resmi, isi daftar nama tamu, lalu unggah kembali untuk membuat seluruh link undangan secara otomatis.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadGuestExcelTemplate(invitation.slug || invitation.id)}
                    className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Unduh Template Excel (.xlsx)</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcelChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Impor File Excel (.xlsx / .csv)</span>
                  </button>
                </div>

                {excelNotice && (
                  <div
                    className={`p-2.5 rounded-lg border flex items-center gap-2 text-[11px] ${
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

              {/* Manual Textarea Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Atau Ketik / Tempel Daftar Nama Tamu (1 Nama Per Baris):
                </label>
                <textarea
                  rows={4}
                  value={batchNamesText}
                  onChange={(e) => setBatchNamesText(e.target.value)}
                  placeholder="Budi Santoso & Istri&#10;dr. Amanda Putri&#10;Keluarga Pak RT 05"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-sans text-stone-900 focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-xs font-medium text-stone-600">
                  Total Terdeteksi: <strong className="text-stone-900">{batchResults.length} tamu</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyAllBatchText}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedBatchAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBatchAll ? 'Semua Teks Tersalin!' : 'Salin Semua Teks WA'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="px-3.5 py-1.5 bg-[#C5A880] hover:bg-[#b8986c] text-[#141413] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor Hasil ke Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* Generated Links Preview List */}
              <div className="border border-stone-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F2] border-b border-stone-200 text-[10px] uppercase font-semibold text-stone-600">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Tamu</th>
                      <th className="py-2.5 px-3">Tautan Personal (?to=)</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-normal">
                    {batchResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="py-2 px-3 font-mono text-stone-400 text-[10px]">
                          #{idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-stone-900">
                          <div>{item.guestName}</div>
                          {(item.category || item.phone) && (
                            <div className="text-[10px] font-normal text-stone-400">
                              {item.category}{item.phone ? ` · ${item.phone}` : ''}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-stone-500 truncate max-w-[200px]">
                          {item.link}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyBatchRow(item.link, idx)}
                              className="p-1.5 rounded bg-stone-100 hover:bg-[#C5A880] hover:text-black text-stone-600 transition-colors cursor-pointer"
                              title="Salin Tautan"
                            >
                              {copiedRowIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>

                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(item.message)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-colors"
                              title="Kirim ke WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
