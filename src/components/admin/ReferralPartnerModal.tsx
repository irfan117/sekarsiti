import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  Share2
} from 'lucide-react';
import { ReferralStore } from '../../admin/referralStore';
import { ResellerPartner, ReferralRecord } from '../../data/referrals';
import { safeCopyToClipboard } from '../../utils/clipboardUtils';

interface ReferralPartnerModalProps {
  onClose: () => void;
}

export const ReferralPartnerModal: React.FC<ReferralPartnerModalProps> = ({ onClose }) => {
  const [resellers, setResellers] = useState<ResellerPartner[]>([]);
  const [records, setRecords] = useState<ReferralRecord[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form input reseller baru
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCommission, setNewCommission] = useState(25000);
  const [newNotes, setNewNotes] = useState('');

  const refreshData = () => {
    setResellers([...ReferralStore.getResellers()]);
    setRecords([...ReferralStore.getRecords()]);
  };

  useEffect(() => {
    refreshData();
    const unsub = ReferralStore.subscribe(refreshData);
    return unsub;
  }, []);

  const handleCopyLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ssiti.tech';
    const link = `${origin}/?order=all&ref=${encodeURIComponent(code)}`;
    safeCopyToClipboard(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddReseller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    ReferralStore.addReseller({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      phone: newPhone.trim(),
      bankInfo: newNotes.trim(),
      defaultCommission: Number(newCommission) || 25000,
      notes: newNotes.trim(),
      createdAt: new Date().toISOString()
    });

    setNewCode('');
    setNewName('');
    setNewPhone('');
    setNewCommission(25000);
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleMarkPaid = (invitationId: string) => {
    ReferralStore.markPayout(invitationId);
  };

  // Ringkasan Finansial Komisi
  const unpaidRecords = records.filter((r) => r.status === 'confirmed' && r.payoutStatus !== 'paid');
  const totalUnpaidCommission = unpaidRecords.reduce((acc, r) => acc + r.commission, 0);
  const paidRecords = records.filter((r) => r.payoutStatus === 'paid');
  const totalPaidCommission = paidRecords.reduce((acc, r) => acc + r.commission, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in text-left font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-5 border-b border-stone-200 bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#93754F]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">Manajemen Mitra Reseller &amp; Referral</h3>
              <p className="text-[11px] text-stone-500">
                Reseller hanya membagikan tautan formulir pemesanan. Undangan dan peninjauan tetap 100% Anda kelola.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#C5A880]" />
                <span>Total Mitra Reseller</span>
              </span>
              <p className="text-xl font-bold font-mono text-stone-900">
                {resellers.length} <span className="text-xs font-normal text-stone-500">mitra</span>
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Komisi Perlu Ditransfer</span>
              </span>
              <p className="text-xl font-bold font-mono text-amber-900">
                Rp {totalUnpaidCommission.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-amber-700">
                Dari {unpaidRecords.length} undangan aktif (published)
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Komisi Sudah Dibayarkan</span>
              </span>
              <p className="text-xl font-bold font-mono text-emerald-900">
                Rp {totalPaidCommission.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Daftar Kode &amp; Link Mitra Reseller
              </h4>
              <p className="text-[11px] text-stone-500">
                Salin tautan formulir dengan kode referral untuk diberikan ke reseller.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-[#141413] hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Batal' : 'Tambah Mitra Baru'}</span>
            </button>
          </div>

          {/* Add Partner Form */}
          {showAddForm && (
            <form onSubmit={handleAddReseller} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
              <p className="font-semibold text-xs text-stone-800">Pendaftaran Mitra Reseller Baru</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Kode Referral (Unik) *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="Contoh: WO-MAWAR"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Nama Mitra / WO *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Mawar Wedding Organizer"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">Komisi Per Undangan Aktif (Rp)</label>
                  <input
                    type="number"
                    value={newCommission}
                    onChange={(e) => setNewCommission(Number(e.target.value))}
                    step="5000"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">Catatan Tambahan / Nomor Rekening</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="BCA 1234567890 a.n Mawar"
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C5A880] hover:bg-[#b8986c] text-[#141413] rounded-lg text-xs font-bold cursor-pointer"
                >
                  Simpan Mitra
                </button>
              </div>
            </form>
          )}

          {/* List Resellers Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-stone-200 text-stone-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Mitra</th>
                  <th className="py-2.5 px-3">Komisi / Order</th>
                  <th className="py-2.5 px-3">Catatan / Rekening</th>
                  <th className="py-2.5 px-3 text-right">Tautan Form Reseller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {resellers.map((reseller) => {
                  const isCopied = copiedCode === reseller.code;
                  return (
                    <tr key={reseller.code} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                        <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-md">
                          {reseller.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-stone-800">
                        <div>{reseller.name}</div>
                        {reseller.phone && (
                          <div className="text-[10px] text-stone-400 font-mono">{reseller.phone}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-800 font-semibold">
                        Rp {reseller.defaultCommission.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 text-[11px]">
                        {reseller.notes || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(reseller.code)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-[#141413] hover:text-white border border-stone-200 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Salin Link Form Pemesanan dengan Kode Referral ini"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Link</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Activity & Commission Records */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>Aktivitas Referral &amp; Status Komisi</span>
              <span className="text-[11px] font-normal text-stone-500 font-mono">
                {records.length} pesanan tercatat
              </span>
            </h4>

            {records.length === 0 ? (
              <div className="p-8 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
                Belum ada pesanan yang menggunakan kode referral.
              </div>
            ) : (
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-stone-200 text-stone-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Tanggal</th>
                      <th className="py-2 px-3">Kode / Mitra</th>
                      <th className="py-2 px-3">Klien &amp; Template</th>
                      <th className="py-2 px-3">Komisi</th>
                      <th className="py-2 px-3">Status Undangan</th>
                      <th className="py-2 px-3 text-right">Aksi Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {records.map((rec) => {
                      const partner = resellers.find((r) => r.code === rec.resellerCode);
                      return (
                        <tr key={rec.invitationId} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">
                            {rec.activatedAt
                              ? new Date(rec.activatedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short'
                                })
                              : '-'}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            <span className="font-mono font-bold text-stone-900">{rec.resellerCode}</span>
                            {partner && <div className="text-[10px] text-stone-400">{partner.name}</div>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-stone-800">{rec.clientName}</span>
                            <div className="text-[10px] text-stone-400 font-mono">ID: {rec.invitationId}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                            Rp {rec.commission.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3">
                            {rec.status === 'pending' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-semibold">
                                Draf (Belum Aktif)
                              </span>
                            )}
                            {rec.status === 'confirmed' && rec.payoutStatus !== 'paid' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-semibold">
                                Aktif (Perlu Bayar)
                              </span>
                            )}
                            {rec.payoutStatus === 'paid' && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-semibold">
                                Selesai Ditransfer
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {rec.status === 'confirmed' && rec.payoutStatus !== 'paid' && (
                              <button
                                type="button"
                                onClick={() => handleMarkPaid(rec.invitationId)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <Check className="w-3 h-3" />
                                <span>Tandai Ditransfer</span>
                              </button>
                            )}
                            {rec.payoutStatus === 'paid' && (
                              <span className="text-[11px] text-stone-400 font-mono">
                                Lunas {rec.paidAt ? `(${new Date(rec.paidAt).toLocaleDateString('id-ID')})` : ''}
                              </span>
                            )}
                            {rec.status === 'pending' && (
                              <span className="text-[11px] text-stone-400 italic">
                                Menunggu Publikasi
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-[11px] text-stone-500">
          <span>
            💡 Komisi hanya terkonfirmasi saat undangan berstatus <strong>Siap Publikasi (Published)</strong>.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-stone-200 rounded-lg font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
