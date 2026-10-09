import React, { useState, useRef } from 'react';
import { ClientInvitationData } from '../../../types/clientInvitation';
import { AdminStore } from '../../../admin/adminStore';
import {
  downloadGuestExcelTemplate,
  parseGuestExcelFile,
  exportGuestLinksToExcel
} from '../../../utils/guestExcelUtils';
import { safeCopyToClipboard } from '../../../utils/clipboardUtils';
import {
  MessageSquare,
  Users,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Globe,
  FileSpreadsheet,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface RsvpGuestbookSectionProps {
  formData: ClientInvitationData;
  onChange: (field: keyof ClientInvitationData, value: any) => void;
}

export const RsvpGuestbookSection: React.FC<RsvpGuestbookSectionProps> = ({
  formData,
  onChange
}) => {
  const [newWishName, setNewWishName] = useState('');
  const [newWishMessage, setNewWishMessage] = useState('');

  const [newRsvpName, setNewRsvpName] = useState('');
  const [newRsvpAttendance, setNewRsvpAttendance] = useState('hadir');
  const [newRsvpCount, setNewRsvpCount] = useState(2);

  // Guest Links & Excel Import state inside Editor
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestCategory, setNewGuestCategory] = useState('Keluarga');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [excelNotice, setExcelNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const guestLinks = formData.guestLinks || [];
  const rsvpList = formData.rsvpList || [];
  const guestbookEntries = formData.guestbookEntries || [];

  const countHadir = rsvpList.filter(r => r.attendance === 'hadir').length;
  const countTidakHadir = rsvpList.filter(r => r.attendance === 'tidak_hadir').length;
  const countRagu = rsvpList.filter(r => r.attendance === 'ragu').length;
  const totalGuests = rsvpList
    .filter(r => r.attendance === 'hadir')
    .reduce((acc, curr) => acc + (Number(curr.count) || 1), 0);

  const universalNoNameUrl = AdminStore.generateUniversalShareLink(formData, { hideGuestName: true });
  const universalGeneralUrl = AdminStore.generateUniversalShareLink(formData, { hideGuestName: false });

  const handleCopyText = (key: string, text: string) => {
    safeCopyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleImportExcelToForm = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelNotice(null);

    try {
      const rows = await parseGuestExcelFile(file);
      const now = new Date().toISOString();
      const newLinks = rows.map((r, idx) => ({
        id: `gl-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        guestName: r.guestName,
        category: r.category || 'Tamu Undangan',
        phone: r.phone || '',
        createdAt: now,
        isSent: false
      }));

      onChange('guestLinks', [...newLinks, ...guestLinks]);
      setExcelNotice({
        type: 'success',
        text: `Berhasil mengimpor ${newLinks.length} tamu dari "${file.name}". Jangan lupa klik Simpan Undangan.`
      });
    } catch (err: any) {
      setExcelNotice({
        type: 'error',
        text: err?.message || 'Gagal membaca file Excel.'
      });
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  const handleAddManualGuestLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newItem = {
      id: `gl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      guestName: newGuestName.trim(),
      category: newGuestCategory,
      phone: newGuestPhone.trim(),
      createdAt: new Date().toISOString(),
      isSent: false
    };

    onChange('guestLinks', [newItem, ...guestLinks]);
    setNewGuestName('');
    setNewGuestPhone('');
  };

  const handleDeleteGuestLink = (id: string) => {
    onChange('guestLinks', guestLinks.filter(g => g.id !== id));
  };

  const handleExportGuestLinksExcel = () => {
    if (guestLinks.length === 0) return;
    const rows = guestLinks.map(g => ({
      guestName: g.guestName,
      category: g.category,
      phone: g.phone,
      link: AdminStore.generateShareLink(formData, g.guestName),
      message: AdminStore.generateWhatsAppMessage(formData, g.guestName)
    }));
    exportGuestLinksToExcel(formData, rows);
  };

  const handleAddManualWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishMessage.trim()) return;

    const entry = {
      name: newWishName.trim(),
      message: newWishMessage.trim(),
      time: 'Baru saja'
    };

    onChange('guestbookEntries', [entry, ...guestbookEntries]);
    setNewWishName('');
    setNewWishMessage('');
  };

  const handleDeleteWish = (index: number) => {
    const updated = guestbookEntries.filter((_, idx) => idx !== index);
    onChange('guestbookEntries', updated);
  };

  const handleAddManualRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRsvpName.trim()) return;

    const item = {
      name: newRsvpName.trim(),
      attendance: newRsvpAttendance,
      count: Number(newRsvpCount) || 1,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    onChange('rsvpList', [item, ...rsvpList]);
    setNewRsvpName('');
  };

  const handleDeleteRsvp = (index: number) => {
    const updated = rsvpList.filter((_, idx) => idx !== index);
    onChange('rsvpList', updated);
  };

  return (
    <div className="max-w-3xl text-left space-y-6">
      <div>
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#C5A880]" />
          <span>Manajemen Tautan Tamu, Impor Excel, RSVP &amp; Buku Ucapan</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Kelola link undangan umum (tanpa nama tamu), impor daftar tamu dari Excel, serta pantau konfirmasi RSVP dan ucapan doa.
        </p>
      </div>

      {/* 0. Bagian Tautan Undangan (Satu Link untuk Semua & Impor Excel Tamu Khusus) */}
      <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Opsi 1: Satu Undangan untuk Semua (Tanpa Nama Tamu)</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Gunakan tautan ini jika klien ingin menyebarkan satu link simpel ke semua orang / grup tanpa nama spesifik.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">Tanpa Kotak Nama Tamu (Polos)</span>
              <button
                type="button"
                onClick={() => handleCopyText('univ-noname', universalNoNameUrl)}
                className="px-2.5 py-1 bg-[#141413] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'univ-noname' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'univ-noname' ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            </div>
            <p className="text-[10px] font-mono text-stone-500 truncate">{universalNoNameUrl}</p>
          </div>

          <div className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">Sapaan Umum (Bapak/Ibu/Saudara/i)</span>
              <button
                type="button"
                onClick={() => handleCopyText('univ-general', universalGeneralUrl)}
                className="px-2.5 py-1 bg-stone-800 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'univ-general' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'univ-general' ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            </div>
            <p className="text-[10px] font-mono text-stone-500 truncate">{universalGeneralUrl}</p>
          </div>
        </div>

        {/* Opsi 2: Impor Excel Daftar Tamu Khusus */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Opsi 2: Daftar Tamu Khusus &amp; Impor Excel ({guestLinks.length} Tamu)</span>
              </h3>
              <p className="text-[11px] text-stone-500">
                Impor file Excel daftar tamu klien agar otomatis tersedia di Portal Mempelai.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadGuestExcelTemplate(formData.slug || formData.id)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Template Excel (.xlsx)</span>
              </button>

              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportExcelToForm}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => excelInputRef.current?.click()}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Impor Excel (.xlsx)</span>
              </button>

              {guestLinks.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportGuestLinksExcel}
                  className="px-3 py-1.5 bg-[#C5A880] hover:bg-[#b8986c] text-[#141413] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Excel</span>
                </button>
              )}
            </div>
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

          {guestLinks.length > 0 && (
            <div className="border border-stone-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] border-b border-stone-200 text-[10px] uppercase font-semibold text-stone-600">
                  <tr>
                    <th className="py-2 px-3">Nama Tamu</th>
                    <th className="py-2 px-3">Kategori</th>
                    <th className="py-2 px-3">No. WA</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {guestLinks.map((g) => {
                    const link = AdminStore.generateShareLink(formData, g.guestName);
                    return (
                      <tr key={g.id} className="hover:bg-stone-50">
                        <td className="py-2 px-3 font-medium text-stone-900">{g.guestName}</td>
                        <td className="py-2 px-3 text-stone-500 text-[11px]">{g.category || '-'}</td>
                        <td className="py-2 px-3 font-mono text-stone-500 text-[11px]">{g.phone || '-'}</td>
                        <td className="py-2 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyText(g.id, link)}
                              className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                              title="Salin Link Personal"
                            >
                              {copiedKey === g.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGuestLink(g.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                              title="Hapus Tamu"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <form onSubmit={handleAddManualGuestLink} className="flex flex-wrap items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Tambah nama tamu khusus..."
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              className="flex-1 min-w-[150px] p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            />
            <select
              value={newGuestCategory}
              onChange={(e) => setNewGuestCategory(e.target.value)}
              className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            >
              <option value="Keluarga">Keluarga</option>
              <option value="VIP">VIP</option>
              <option value="Sahabat">Sahabat</option>
              <option value="Rekan Kerja">Rekan Kerja</option>
              <option value="Umum">Umum</option>
            </select>
            <input
              type="tel"
              placeholder="No WA (Opsional)"
              value={newGuestPhone}
              onChange={(e) => setNewGuestPhone(e.target.value)}
              className="w-32 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-stone-800 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </form>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
            Total Konfirmasi
          </span>
          <span className="text-xl font-bold text-stone-900 font-mono mt-0.5 block">
            {rsvpList.length}
          </span>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
          <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Pasti Hadir
          </span>
          <span className="text-xl font-bold text-emerald-700 font-mono mt-0.5 block">
            {countHadir} <span className="text-xs font-normal text-emerald-600">({totalGuests} orang)</span>
          </span>
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
          <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
            Masih Ragu
          </span>
          <span className="text-xl font-bold text-amber-700 font-mono mt-0.5 block">
            {countRagu}
          </span>
        </div>

        <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
          <span className="text-[10px] font-semibold text-rose-800 uppercase tracking-wider block">
            Berhalangan
          </span>
          <span className="text-xl font-bold text-rose-700 font-mono mt-0.5 block">
            {countTidakHadir}
          </span>
        </div>
      </div>

      {/* 1. RSVP Section */}
      <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Daftar Konfirmasi Kehadiran (RSVP)
            </h3>
            <p className="text-[11px] text-stone-500">
              {rsvpList.length} respon tercatat
            </p>
          </div>

          <button
            type="button"
            onClick={() => AdminStore.exportRsvpToCsv(formData)}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Unduh CSV RSVP</span>
          </button>
        </div>

        {/* Table of RSVP */}
        {rsvpList.length > 0 ? (
          <div className="border border-stone-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] border-b border-stone-200 text-[10px] uppercase font-semibold text-stone-600">
                <tr>
                  <th className="py-2 px-3">Nama Tamu</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-center">Jumlah</th>
                  <th className="py-2 px-3">Tanggal</th>
                  <th className="py-2 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rsvpList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-medium text-stone-900">
                      {item.name}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.attendance === 'hadir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.attendance === 'tidak_hadir'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.attendance === 'hadir' && <CheckCircle2 className="w-3 h-3" />}
                        {item.attendance === 'tidak_hadir' && <XCircle className="w-3 h-3" />}
                        {item.attendance === 'ragu' && <HelpCircle className="w-3 h-3" />}
                        <span>{item.attendance === 'hadir' ? 'Hadir' : item.attendance === 'tidak_hadir' ? 'Tidak Hadir' : 'Ragu'}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {item.count} org
                    </td>
                    <td className="py-2 px-3 text-stone-500 text-[11px]">
                      {item.date || '-'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRsvp(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-3 text-center italic">
            Belum ada data konfirmasi RSVP. Anda dapat menambahkan simulasi data manual di bawah ini.
          </p>
        )}

        {/* Add manual RSVP row */}
        <form onSubmit={handleAddManualRsvp} className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Tambah nama tamu..."
            value={newRsvpName}
            onChange={(e) => setNewRsvpName(e.target.value)}
            className="flex-1 min-w-[150px] p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
          />
          <select
            value={newRsvpAttendance}
            onChange={(e) => setNewRsvpAttendance(e.target.value)}
            className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
          >
            <option value="hadir">Hadir</option>
            <option value="ragu">Ragu</option>
            <option value="tidak_hadir">Tidak Hadir</option>
          </select>
          <input
            type="number"
            min="1"
            max="10"
            value={newRsvpCount}
            onChange={(e) => setNewRsvpCount(Number(e.target.value))}
            className="w-16 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-center"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-stone-800 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </form>
      </div>

      {/* 2. Guestbook Wishes Section */}
      <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Buku Tamu &amp; Ucapan Doa Restu</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              {guestbookEntries.length} ucapan tersimpan
            </p>
          </div>

          <button
            type="button"
            onClick={() => AdminStore.exportGuestbookToCsv(formData)}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Unduh CSV Ucapan</span>
          </button>
        </div>

        {guestbookEntries.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {guestbookEntries.map((w, idx) => (
              <div key={idx} className="p-3 bg-[#FAF7F2] border border-[#E5E0D8] rounded-lg flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{w.name}</span>
                    <span className="text-[10px] text-stone-400">· {w.time || 'Terkirim'}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">{w.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteWish(idx)}
                  className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                  title="Hapus ucapan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-3 text-center italic">
            Belum ada ucapan doa restu yang masuk.
          </p>
        )}

        {/* Add manual wish */}
        <form onSubmit={handleAddManualWish} className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nama pengirim..."
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-stone-800 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ucapan</span>
            </button>
          </div>
          <textarea
            rows={2}
            placeholder="Pesan ucapan doa restu..."
            value={newWishMessage}
            onChange={(e) => setNewWishMessage(e.target.value)}
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs resize-none"
          />
        </form>
      </div>
    </div>
  );
};
