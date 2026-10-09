import React, { useState, useEffect, useRef } from 'react';
import { Plus, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { ClientInvitationData, OrderStatus } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';
import { safeCopyToClipboard } from '../../utils/clipboardUtils';
import { ClientOrderEditor } from './ClientOrderEditor';
import { GuestLinkModal } from './GuestLinkModal';
import { AdminSidebar } from './dashboard/AdminSidebar';
import { AdminStatsCards } from './dashboard/AdminStatsCards';
import { AdminOrdersTable, SortField } from './dashboard/AdminOrdersTable';

interface AdminDashboardProps {
  onBackToLanding: () => void;
  onPreviewClientInvitation: (invitation: ClientInvitationData) => void;
  onOpenClientPortal?: (invitation?: ClientInvitationData) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToLanding,
  onPreviewClientInvitation,
  onOpenClientPortal
}) => {
  const [orders, setOrders] = useState<ClientInvitationData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortField>('date_desc');

  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [editingOrder, setEditingOrder] = useState<ClientInvitationData | null>(null);
  const [autoOpenAiSetup, setAutoOpenAiSetup] = useState(false);

  const [guestLinkOrder, setGuestLinkOrder] = useState<ClientInvitationData | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleCopyClientAccess = (order: ClientInvitationData) => {
    const code = order.accessCode || order.slug || order.id;
    const pin = order.pinCode || '7429';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const portalUrl = `${origin}${path}?portal=${encodeURIComponent(code)}&pin=${encodeURIComponent(pin)}`;
    const universalNoNameUrl = AdminStore.generateUniversalShareLink(order, { hideGuestName: true });

    const message = `Halo ${order.clientName}, undangan pernikahan digital Anda di Sekarsiti Studio telah aktif! ✨

1️⃣ *Tautan Satu Undangan untuk Semua (Tanpa Nama Tamu / Grup):*
🔗 ${universalNoNameUrl}

2️⃣ *Portal Mempelai (Untuk Tamu Khusus, Impor Excel Tamu & Pantau RSVP):*
🔗 ${portalUrl}
• Kode Akses: ${code}
• Sandi PIN: ${pin}

Di dalam Portal Mempelai, Anda juga dapat mengunduh Template Excel & mengimpor daftar tamu sekaligus. Semoga persiapan hari bahagia Anda berjalan lancar!`;

    safeCopyToClipboard(message);
    showToast(`Pesan akses & tautan undangan untuk ${order.clientName} berhasil disalin!`);
  };

  const refreshOrders = () => {
    setOrders(AdminStore.getAll());
  };

  useEffect(() => {
    refreshOrders();
    const unsubscribe = AdminStore.subscribe(() => {
      refreshOrders();
    });
    return unsubscribe;
  }, []);

  const handleCreateNew = (openGFormAi = false) => {
    setEditingOrder(null);
    setAutoOpenAiSetup(openGFormAi);
    setViewState('create');
  };

  const handleEdit = (order: ClientInvitationData) => {
    setEditingOrder(order);
    setAutoOpenAiSetup(false);
    setViewState('edit');
  };

  const handleSaveOrder = (data: ClientInvitationData) => {
    if (viewState === 'create') {
      AdminStore.create(data);
      showToast('Undangan baru berhasil dibuat!');
    } else {
      AdminStore.update(data.id, data);
      showToast('Perubahan undangan tersimpan!');
    }
    setViewState('list');
    setEditingOrder(null);
  };

  const handleDelete = (id: string, clientName: string) => {
    if (window.confirm(`Yakin ingin menghapus undangan "${clientName}"? Data tidak dapat dipulihkan.`)) {
      AdminStore.delete(id);
      showToast('Undangan berhasil dihapus');
    }
  };

  const handleDuplicate = (id: string) => {
    const duplicated = AdminStore.duplicate(id);
    showToast(`Duplikasi berhasil dibuat (${duplicated.id})`);
  };

  const handleExportBackup = () => {
    AdminStore.exportAllAsJson();
    showToast('File backup JSON berhasil diunduh');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = AdminStore.importJsonBackup(content);
      if (result.success) {
        showToast(`Berhasil mengimpor ${result.count} data undangan!`);
      } else {
        showToast(result.error || 'Gagal mengimpor file.');
      }
    };
    reader.readAsText(file);

    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset seluruh data undangan ke kondisi contoh awal Sekarsiti? Perubahan kustom saat ini akan diganti.')) {
      AdminStore.resetToDefaultSeed();
      showToast('Data berhasil di-reset ke kondisi awal');
    }
  };

  const stats = AdminStore.getStats();

  const filteredOrders = orders
    .filter(item => {
      const matchesSearch =
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.clientPhone.includes(searchQuery) ||
        item.brideName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.groomName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesTemplate = templateFilter === 'all' || item.templateId === templateFilter;

      return matchesSearch && matchesStatus && matchesTemplate;
    })
    .sort((a, b) => {
      if (sortOption === 'name_asc') {
        return a.clientName.localeCompare(b.clientName);
      }
      if (sortOption === 'event_date') {
        return (a.countdownIsoDate || '').localeCompare(b.countdownIsoDate || '');
      }
      if (sortOption === 'date_asc') {
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      return (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '');
    });

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-stone-900 font-['Plus_Jakarta_Sans',sans-serif] flex">
      {feedbackToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#141413] text-[#F3EAD9] px-4 py-2.5 rounded-xl shadow-xl border border-[#C5A880]/40 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFile}
        className="hidden"
      />

      <AdminSidebar
        viewState={viewState}
        autoOpenAiSetup={autoOpenAiSetup}
        statusFilter={statusFilter}
        ordersCount={orders.length}
        stats={stats}
        onSelectListView={() => setViewState('list')}
        onCreateNew={handleCreateNew}
        onOpenClientPortal={() => onOpenClientPortal && onOpenClientPortal()}
        onChangeStatusFilter={(status) => {
          setStatusFilter(status);
          setViewState('list');
        }}
        onExportBackup={handleExportBackup}
        onTriggerImportBackup={() => importInputRef.current?.click()}
        onResetData={handleResetData}
        onBackToLanding={onBackToLanding}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-stone-200 px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Workspace</span>
            <span>/</span>
            <span>Undangan Klien</span>
            {viewState !== 'list' && (
              <>
                <span>/</span>
                <span className="font-semibold text-stone-900">
                  {viewState === 'create' ? 'Buat Undangan Baru' : 'Sunting Undangan'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {viewState === 'list' && (
              <>
                <button
                  onClick={() => handleCreateNew(true)}
                  className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EAD9] border border-[#C5A880]/60 text-stone-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Impor GForm &amp; Media (AI)</span>
                </button>
                <button
                  onClick={() => handleCreateNew(false)}
                  className="px-4 py-2 bg-[#C5A880] hover:bg-[#b8986c] text-[#141413] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Undangan Klien Baru</span>
                </button>
              </>
            )}
          </div>
        </header>

        <div className="p-8 flex-1">
          {viewState === 'list' ? (
            <div className="space-y-6">
              <AdminStatsCards
                stats={stats}
                statusFilter={statusFilter}
                onSelectStatusFilter={setStatusFilter}
              />

              <AdminOrdersTable
                totalCount={orders.length}
                filteredOrders={filteredOrders}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                templateFilter={templateFilter}
                sortOption={sortOption}
                onChangeSearch={setSearchQuery}
                onChangeStatusFilter={setStatusFilter}
                onChangeTemplateFilter={setTemplateFilter}
                onChangeSortOption={setSortOption}
                onCopyClientAccess={handleCopyClientAccess}
                onOpenClientPortal={onOpenClientPortal}
                onPreviewClientInvitation={onPreviewClientInvitation}
                onOpenGuestLinkModal={setGuestLinkOrder}
                onEditOrder={handleEdit}
                onDuplicateOrder={handleDuplicate}
                onDeleteOrder={handleDelete}
              />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-2xs">
              <ClientOrderEditor
                initialData={editingOrder}
                autoOpenAiSetup={autoOpenAiSetup}
                onSave={handleSaveOrder}
                onCancel={() => {
                  setViewState('list');
                  setEditingOrder(null);
                  setAutoOpenAiSetup(false);
                }}
                onPreview={onPreviewClientInvitation}
              />
            </div>
          )}
        </div>
      </main>

      {guestLinkOrder && (
        <GuestLinkModal
          invitation={guestLinkOrder}
          onClose={() => setGuestLinkOrder(null)}
        />
      )}
    </div>
  );
};
