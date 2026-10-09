import React from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  KeyRound,
  Heart,
  Eye,
  Send,
  Edit2,
  Copy,
  Trash2
} from 'lucide-react';
import { ClientInvitationData, OrderStatus } from '../../../types/clientInvitation';
import { TEMPLATE_REGISTRY } from '../../../admin/templateRegistry';

export type SortField = 'date_desc' | 'date_asc' | 'name_asc' | 'event_date';

interface AdminOrdersTableProps {
  totalCount: number;
  filteredOrders: ClientInvitationData[];
  searchQuery: string;
  statusFilter: 'all' | OrderStatus;
  templateFilter: string;
  sortOption: SortField;
  onChangeSearch: (q: string) => void;
  onChangeStatusFilter: (status: 'all' | OrderStatus) => void;
  onChangeTemplateFilter: (template: string) => void;
  onChangeSortOption: (sort: SortField) => void;
  onCopyClientAccess: (order: ClientInvitationData) => void;
  onOpenClientPortal?: (order: ClientInvitationData) => void;
  onPreviewClientInvitation: (order: ClientInvitationData) => void;
  onOpenGuestLinkModal: (order: ClientInvitationData) => void;
  onEditOrder: (order: ClientInvitationData) => void;
  onDuplicateOrder: (id: string) => void;
  onDeleteOrder: (id: string, clientName: string) => void;
}

export const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({
  totalCount,
  filteredOrders,
  searchQuery,
  statusFilter,
  templateFilter,
  sortOption,
  onChangeSearch,
  onChangeStatusFilter,
  onChangeTemplateFilter,
  onChangeSortOption,
  onCopyClientAccess,
  onOpenClientPortal,
  onPreviewClientInvitation,
  onOpenGuestLinkModal,
  onEditOrder,
  onDuplicateOrder,
  onDeleteOrder
}) => {
  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama klien, ID, mempelai, atau nomor telepon..."
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onChangeStatusFilter(e.target.value as 'all' | OrderStatus)}
            className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none"
          >
            <option value="all">Semua Status ({totalCount})</option>
            <option value="pending">Draf Baru</option>
            <option value="in_progress">Dalam Proses</option>
            <option value="review">Review Klien</option>
            <option value="published">Siap Publikasi</option>
          </select>

          <select
            value={templateFilter}
            onChange={(e) => onChangeTemplateFilter(e.target.value)}
            className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none"
          >
            <option value="all">Semua Template Desain</option>
            <option value="ruang-rasa">Seri Editorial (Ruang Rasa)</option>
            <option value="malam-zamrud">Malam Zamrud (Art Deco)</option>
            <option value="setangkai">Damar &amp; Alya (Sage)</option>
            <option value="suasana">Jurnal Dua Hati (Buku)</option>
            <option value="lembayung">Reel Sinematik 35mm</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-stone-600 pl-1 border-l border-stone-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          </div>

          <select
            value={sortOption}
            onChange={(e) => onChangeSortOption(e.target.value as SortField)}
            className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none"
          >
            <option value="date_desc">Terbaru Diperbarui</option>
            <option value="date_asc">Terlama Dibuat</option>
            <option value="name_asc">Nama Klien (A–Z)</option>
            <option value="event_date">Tanggal Acara Perayaan</option>
          </select>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <th className="py-3 px-4">ID &amp; Klien</th>
              <th className="py-3 px-4">Template Terpilih</th>
              <th className="py-3 px-4">Tanggal Perayaan</th>
              <th className="py-3 px-4 text-center">RSVP</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi &amp; Generator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-normal">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const templateDef = TEMPLATE_REGISTRY[order.templateId] || TEMPLATE_REGISTRY['ruang-rasa'];
                const rsvpCount = order.rsvpList?.length || 0;

                return (
                  <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono tabular-nums text-[10px] text-stone-500 block">
                        {order.id}
                      </span>
                      <span className="font-bold text-stone-900 text-sm">
                        {order.clientName}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {order.brideName} &amp; {order.groomName} · {order.city}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 font-mono tabular-nums text-[10px] text-stone-600">
                        <KeyRound className="w-3 h-3 text-[#C5A880]" />
                        <span>Akses: {order.accessCode || order.slug}</span>
                        <span className="text-stone-300">·</span>
                        <span>PIN: <strong>{order.pinCode || '7429'}</strong></span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={templateDef.coverThumbnail}
                          alt={templateDef.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <span className="font-medium text-stone-900 block truncate max-w-[180px]">
                            {templateDef.name}
                          </span>
                          <span className="text-[10px] text-[#C5A880] font-semibold">
                            {templateDef.styleLabel}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-700">
                      <span className="font-medium block">
                        {order.eventDateFormatted}
                      </span>
                      <span className="text-[10px] text-stone-500 truncate max-w-[180px] block">
                        {order.resepsiVenue}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                      {rsvpCount > 0 ? (
                        <span className="text-emerald-700 text-[11px] font-semibold">
                          {rsvpCount} Tamu
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[10px]">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold ${
                          order.status === 'published'
                            ? 'text-emerald-700'
                            : order.status === 'in_progress'
                            ? 'text-amber-700'
                            : order.status === 'review'
                            ? 'text-sky-700'
                            : 'text-stone-600'
                        }`}
                      >
                        {order.status === 'published'
                          ? 'Published'
                          : order.status === 'in_progress'
                          ? 'Proses Desain'
                          : order.status === 'review'
                          ? 'Review Klien'
                          : 'Draf'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onCopyClientAccess(order)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700 transition-colors cursor-pointer"
                          title="Salin Pesan Akses Portal untuk WhatsApp Klien"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenClientPortal && onOpenClientPortal(order)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#C5A880] hover:text-[#141413] text-stone-700 transition-colors cursor-pointer"
                          title="Buka Portal Mempelai Klien Ini"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onPreviewClientInvitation(order)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#C5A880] hover:text-[#141413] text-stone-700 transition-colors cursor-pointer"
                          title="Buka Pratinjau Klien"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenGuestLinkModal(order)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#C5A880] hover:text-[#141413] text-stone-700 transition-colors cursor-pointer"
                          title="Buat Tautan Tamu WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditOrder(order)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                          title="Sunting Data Undangan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDuplicateOrder(order.id)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                          title="Duplikasi Undangan Ini"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteOrder(order.id, order.clientName)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 hover:text-red-700 text-stone-500 transition-colors cursor-pointer"
                          title="Hapus Undangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-stone-500">
                  <p className="text-sm font-medium">Tidak ada undangan yang cocok dengan filter pencarian.</p>
                  <p className="text-xs text-stone-400 mt-1">Coba sesuaikan kata kunci atau ubah filter status.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
