import React from 'react';
import {
  LayoutDashboard,
  Plus,
  FileSpreadsheet,
  Heart,
  Download,
  Upload,
  RefreshCw,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { OrderStatus } from '../../../types/clientInvitation';
import { AdminStoreStats } from '../../../admin/adminStore';
import { useAuth } from '../../../context/AuthContext';

interface AdminSidebarProps {
  viewState: 'list' | 'create' | 'edit';
  autoOpenAiSetup: boolean;
  statusFilter: 'all' | OrderStatus;
  ordersCount: number;
  stats: AdminStoreStats;
  onSelectListView: () => void;
  onCreateNew: (openGFormAi?: boolean) => void;
  onOpenClientPortal?: () => void;
  onChangeStatusFilter: (status: 'all' | OrderStatus) => void;
  onExportBackup: () => void;
  onTriggerImportBackup: () => void;
  onResetData: () => void;
  onBackToLanding: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  viewState,
  autoOpenAiSetup,
  statusFilter,
  ordersCount,
  stats,
  onSelectListView,
  onCreateNew,
  onOpenClientPortal,
  onChangeStatusFilter,
  onExportBackup,
  onTriggerImportBackup,
  onResetData,
  onBackToLanding
}) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    localStorage.removeItem('sekarsiti_mock_admin_session');
    await signOut();
    onBackToLanding();
  };
  return (
    <aside className="w-64 bg-[#141413] text-stone-300 flex flex-col shrink-0 border-r border-[#262522]">
      <div className="p-5 border-b border-[#262522] space-y-1 text-left">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
          <span className="font-['Fraunces',serif] text-base text-white tracking-wide">
            Sekarsiti Studio
          </span>
        </div>
        <p className="text-[10px] text-[#A8A39A] uppercase tracking-widest font-mono">
          Admin Workspace &amp; Client Generator
        </p>
      </div>

      <nav className="p-3 space-y-1 text-xs font-medium flex-1 text-left">
        <button
          onClick={onSelectListView}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
            viewState === 'list'
              ? 'bg-[#22211E] text-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white hover:bg-[#1A1918]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4" />
            <span>Daftar Undangan Klien</span>
          </div>
          <span className="font-mono tabular-nums text-[10px] text-stone-300">
            {ordersCount}
          </span>
        </button>

        <button
          onClick={() => onCreateNew(false)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
            viewState === 'create' && !autoOpenAiSetup
              ? 'bg-[#22211E] text-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white hover:bg-[#1A1918]'
          }`}
        >
          <Plus className="w-4 h-4 text-[#C5A880]" />
          <span>Buat Undangan Baru</span>
        </button>

        <button
          onClick={() => onCreateNew(true)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
            viewState === 'create' && autoOpenAiSetup
              ? 'bg-[#22211E] text-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white hover:bg-[#1A1918]'
          }`}
          title="Impor data & media dari Google Form klien"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#C5A880]" />
          <span>Impor GForm &amp; Media (AI)</span>
        </button>

        <button
          onClick={() => onOpenClientPortal && onOpenClientPortal()}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-stone-400 hover:text-white hover:bg-[#1A1918]"
          title="Buka portal login mempelai"
        >
          <Heart className="w-4 h-4 text-[#C5A880]" />
          <span>Portal Mempelai</span>
        </button>

        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
            Filter Cepat Status
          </span>
        </div>

        <div className="space-y-0.5 text-[11px]">
          <button
            onClick={() => onChangeStatusFilter('all')}
            className={`w-full px-3 py-1.5 rounded text-left flex items-center justify-between cursor-pointer ${
              statusFilter === 'all' && viewState === 'list'
                ? 'bg-[#1F1E1B] text-white font-semibold'
                : 'text-stone-400 hover:bg-[#1A1918]'
            }`}
          >
            <span>Semua Status</span>
            <span className="font-mono tabular-nums text-[10px]">{stats.total}</span>
          </button>

          <button
            onClick={() => onChangeStatusFilter('published')}
            className={`w-full px-3 py-1.5 rounded text-left flex items-center justify-between cursor-pointer ${
              statusFilter === 'published' && viewState === 'list'
                ? 'bg-[#1F1E1B] text-emerald-400 font-semibold'
                : 'text-stone-400 hover:bg-[#1A1918]'
            }`}
          >
            <span>Siap Publikasi</span>
            <span className="font-mono tabular-nums text-[10px]">{stats.published}</span>
          </button>

          <button
            onClick={() => onChangeStatusFilter('in_progress')}
            className={`w-full px-3 py-1.5 rounded text-left flex items-center justify-between cursor-pointer ${
              statusFilter === 'in_progress' && viewState === 'list'
                ? 'bg-[#1F1E1B] text-amber-400 font-semibold'
                : 'text-stone-400 hover:bg-[#1A1918]'
            }`}
          >
            <span>Proses Desain</span>
            <span className="font-mono tabular-nums text-[10px]">{stats.inProgress}</span>
          </button>

          <button
            onClick={() => onChangeStatusFilter('pending')}
            className={`w-full px-3 py-1.5 rounded text-left flex items-center justify-between cursor-pointer ${
              statusFilter === 'pending' && viewState === 'list'
                ? 'bg-[#1F1E1B] text-stone-200 font-semibold'
                : 'text-stone-400 hover:bg-[#1A1918]'
            }`}
          >
            <span>Draf Baru</span>
            <span className="font-mono tabular-nums text-[10px]">{stats.pending}</span>
          </button>
        </div>

        <div className="pt-5 pb-1 px-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
            Alat &amp; Arsip Data
          </span>
        </div>

        <div className="space-y-1">
          <button
            onClick={onExportBackup}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-stone-400 hover:text-white hover:bg-[#1A1918] transition-colors cursor-pointer text-[11px]"
            title="Unduh seluruh data undangan dalam file JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Ekspor Backup JSON</span>
          </button>

          <button
            onClick={onTriggerImportBackup}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-stone-400 hover:text-white hover:bg-[#1A1918] transition-colors cursor-pointer text-[11px]"
            title="Pulihkan data undangan dari file JSON"
          >
            <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Impor Backup JSON</span>
          </button>

          <button
            onClick={onResetData}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-stone-500 hover:text-stone-300 hover:bg-[#1A1918] transition-colors cursor-pointer text-[11px]"
            title="Reset ke template contoh bawaan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data Contoh</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-[#262522] space-y-2">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 bg-[#261E1E] hover:bg-red-950/60 text-red-300 hover:text-red-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Logout)</span>
        </button>
        <button
          onClick={onBackToLanding}
          className="w-full py-2 px-3 bg-[#1A1918] hover:bg-[#262522] text-stone-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Lihat Website Utama</span>
        </button>
      </div>
    </aside>
  );
};
