import React from 'react';
import { Users, Download } from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';

interface PortalRsvpTabProps {
  client: ClientInvitationData;
}

export const PortalRsvpTab: React.FC<PortalRsvpTabProps> = ({ client }) => {
  const rsvpList = client.rsvpList || [];
  const totalRsvpCount = rsvpList.length;
  const attendingGuests = rsvpList.filter(
    r => r.attendance.toLowerCase().includes('hadir') && !r.attendance.toLowerCase().includes('tidak')
  );
  const totalAttendingPax = attendingGuests.reduce((acc, curr) => acc + (curr.count || 1), 0);
  const uncertainGuests = rsvpList.filter(r => r.attendance.toLowerCase().includes('ragu'));
  const declinedGuests = rsvpList.filter(
    r => r.attendance.toLowerCase().includes('tidak') || r.attendance.toLowerCase().includes('berhalangan')
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">
            Total Respon
          </span>
          <div className="text-2xl font-serif font-bold tabular-nums text-stone-900 mt-1">
            {totalRsvpCount}
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5 block">
            Tamu telah mengonfirmasi
          </span>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#C5A880]/40 shadow-2xs">
          <span className="text-[10px] text-[#8C6D3F] uppercase font-semibold tracking-wider block">
            Porsi / Pax Hadir
          </span>
          <div className="text-2xl font-serif font-bold tabular-nums text-[#8C6D3F] mt-1">
            {totalAttendingPax}
          </div>
          <span className="text-[10px] text-stone-600 mt-0.5 block">
            Dari {attendingGuests.length} keluarga hadir
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] text-amber-600 uppercase font-semibold tracking-wider block">
            Masih Ragu
          </span>
          <div className="text-2xl font-serif font-bold tabular-nums text-amber-600 mt-1">
            {uncertainGuests.length}
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5 block">
            Menunggu kepastian
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">
            Berhalangan
          </span>
          <div className="text-2xl font-serif font-bold tabular-nums text-stone-400 mt-1">
            {declinedGuests.length}
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            Tidak dapat hadir
          </span>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Daftar Konfirmasi Kehadiran Katering
            </h3>
            <p className="text-xs text-stone-500">
              Data tamu yang telah mengisi formulir konfirmasi RSVP di halaman undangan.
            </p>
          </div>

          <button
            onClick={() => AdminStore.exportRsvpToCsv(client)}
            className="bg-[#141413] hover:bg-[#2C2E28] text-[#FAF8F3] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Unduh Rekap Tamu (Excel / CSV)</span>
          </button>
        </div>

        {rsvpList.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl">
            <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs text-stone-500 font-medium">Belum ada respon RSVP.</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Ketika tamu mengisi formulir RSVP pada undangan digital Anda, nama dan jumlah porsi akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Tamu</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Jumlah Hadir</th>
                  <th className="py-2.5 px-3">Tanggal Konfirmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rsvpList.map((r, i) => {
                  const isAttending = r.attendance.toLowerCase().includes('hadir') && !r.attendance.toLowerCase().includes('tidak');
                  const isUncertain = r.attendance.toLowerCase().includes('ragu');

                  return (
                    <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-3 text-stone-400 font-mono tabular-nums">{i + 1}</td>
                      <td className="py-3 px-3 font-semibold text-stone-900">{r.name}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-semibold ${
                            isAttending
                              ? 'text-emerald-700'
                              : isUncertain
                              ? 'text-amber-700'
                              : 'text-stone-500'
                          }`}
                        >
                          {r.attendance}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold tabular-nums text-stone-700">
                        {r.count} Orang
                      </td>
                      <td className="py-3 px-3 text-stone-500 font-mono tabular-nums text-[11px]">
                        {r.date || '-'}
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
  );
};
