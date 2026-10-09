import React from 'react';
import { Calendar, Heart } from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';

interface PortalInfoTabProps {
  client: ClientInvitationData;
}

export const PortalInfoTab: React.FC<PortalInfoTabProps> = ({ client }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C5A880]" />
          <span>Informasi Rangkaian Acara</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-[#C5A880] block">
              Tanggal Pernikahan
            </span>
            <p className="font-semibold text-stone-900 mt-0.5">
              {client.eventDateFormatted}
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-[#C5A880] block">
              Akad Nikah / Pemberkatan
            </span>
            <p className="font-semibold text-stone-900 mt-0.5">
              {client.akadTime}
            </p>
            <p className="text-stone-600 mt-0.5">{client.akadVenue}</p>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-[#C5A880] block">
              Resepsi Pernikahan
            </span>
            <p className="font-semibold text-stone-900 mt-0.5">
              {client.resepsiTime}
            </p>
            <p className="text-stone-600 mt-0.5">{client.resepsiVenue}, {client.city}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#C5A880]" />
          <span>Tanda Kasih &amp; Rekening Terdaftar</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase">
              Rekening Utama
            </span>
            <div className="font-bold text-stone-900 text-sm font-mono tabular-nums">
              {client.bankName} - {client.accountNumber}
            </div>
            <div className="text-stone-600 text-xs">
              a.n {client.accountHolder}
            </div>
          </div>

          {client.secondaryBankName && (
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase">
                Rekening Sekunder
              </span>
              <div className="font-bold text-stone-900 text-sm font-mono tabular-nums">
                {client.secondaryBankName} - {client.secondaryAccountNumber}
              </div>
              <div className="text-stone-600 text-xs">
                a.n {client.secondaryAccountHolder}
              </div>
            </div>
          )}

          <div className="p-3 bg-[#FAF7F2] border border-[#C5A880]/30 rounded-xl text-[11px] text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800">Perlu mengubah jam acara atau nomor rekening?</p>
            <p className="text-stone-500">
              Untuk menjaga keaslian desain dan keamanan data, perubahan detail acara dapat langsung dikonfirmasikan kepada Admin Sekarsiti Studio melalui WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
