import React from 'react';
import { OrderStatus } from '../../../types/clientInvitation';
import { AdminStoreStats } from '../../../admin/adminStore';

interface AdminStatsCardsProps {
  stats: AdminStoreStats;
  statusFilter: 'all' | OrderStatus;
  onSelectStatusFilter: (status: 'all' | OrderStatus) => void;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  stats,
  statusFilter,
  onSelectStatusFilter
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        onClick={() => onSelectStatusFilter('all')}
        className={`p-4 bg-white rounded-xl border transition-all cursor-pointer text-left ${
          statusFilter === 'all'
            ? 'border-[#C5A880] shadow-sm ring-1 ring-[#C5A880]/30'
            : 'border-stone-200 hover:border-stone-300'
        }`}
      >
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
          Total Undangan Klien
        </span>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
            {stats.total}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            Semua Draf
          </span>
        </div>
      </div>

      <div
        onClick={() => onSelectStatusFilter('published')}
        className={`p-4 bg-white rounded-xl border transition-all cursor-pointer text-left ${
          statusFilter === 'published'
            ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
            : 'border-stone-200 hover:border-stone-300'
        }`}
      >
        <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
          Siap Publikasi (Published)
        </span>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-800">
            {stats.published}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Aktif Live
          </span>
        </div>
      </div>

      <div
        onClick={() => onSelectStatusFilter('in_progress')}
        className={`p-4 bg-white rounded-xl border transition-all cursor-pointer text-left ${
          statusFilter === 'in_progress'
            ? 'border-amber-500 shadow-sm ring-1 ring-amber-500/30'
            : 'border-stone-200 hover:border-stone-300'
        }`}
      >
        <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
          Proses Desain
        </span>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-amber-800">
            {stats.inProgress}
          </span>
          <span className="text-[10px] text-amber-700">
            In-Progress
          </span>
        </div>
      </div>

      <div
        onClick={() => onSelectStatusFilter('pending')}
        className={`p-4 bg-white rounded-xl border transition-all cursor-pointer text-left ${
          statusFilter === 'pending'
            ? 'border-stone-400 shadow-sm ring-1 ring-stone-400/30'
            : 'border-stone-200 hover:border-stone-300'
        }`}
      >
        <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
          Draf Baru (Pending)
        </span>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-stone-700">
            {stats.pending}
          </span>
          <span className="text-[10px] text-stone-500">
            Belum Review
          </span>
        </div>
      </div>
    </div>
  );
};
