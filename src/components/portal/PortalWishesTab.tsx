import React from 'react';
import { MessageSquare, Download } from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';

interface PortalWishesTabProps {
  client: ClientInvitationData;
}

export const PortalWishesTab: React.FC<PortalWishesTabProps> = ({ client }) => {
  const entries = client.guestbookEntries || [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900">
            Ucapan Doa &amp; Buku Tamu ({entries.length})
          </h3>
          <p className="text-xs text-stone-500">
            Doa restu yang dikirimkan oleh keluarga dan kerabat melalui undangan.
          </p>
        </div>

        <button
          onClick={() => AdminStore.exportGuestbookToCsv(client)}
          className="bg-[#FAF7F2] hover:bg-[#F3EAD9] text-stone-800 border border-[#C5A880]/50 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Unduh Ucapan (CSV)</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl">
          <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-stone-500 font-medium">Belum ada ucapan doa masuk.</p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Setiap ucapan yang dikirimkan tamu akan terekam secara rapi di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[550px] overflow-y-auto pr-1">
          {entries.map((entry, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">{entry.name}</span>
                <span className="text-[10px] text-stone-400 font-mono">{entry.time}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic">
                &ldquo;{entry.message}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
