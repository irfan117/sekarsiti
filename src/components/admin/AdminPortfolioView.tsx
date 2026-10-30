import React, { useState, useEffect } from 'react';
import { Eye, Edit3, Trash2, CheckCircle2, XCircle, Sparkles, Plus, ExternalLink, RotateCcw } from 'lucide-react';
import { PortfolioItemData } from '../../types/portfolio';
import { PortfolioStore } from '../../admin/portfolioStore';
import { TEMPLATE_REGISTRY } from '../../admin/templateRegistry';
import { PortfolioItemEditorModal } from './PortfolioItemEditorModal';

interface AdminPortfolioViewProps {
  onPreviewPortfolio: (item: PortfolioItemData) => void;
}

export const AdminPortfolioView: React.FC<AdminPortfolioViewProps> = ({
  onPreviewPortfolio
}) => {
  const [items, setItems] = useState<PortfolioItemData[]>([]);
  const [editingItem, setEditingItem] = useState<PortfolioItemData | null>(null);

  const refreshItems = () => {
    setItems(PortfolioStore.getAll());
  };

  useEffect(() => {
    PortfolioStore.initFromSupabase().then(() => {
      refreshItems();
    });
    const unsubscribe = PortfolioStore.subscribe(() => {
      refreshItems();
    });
    return unsubscribe;
  }, []);

  const handleTogglePublish = async (item: PortfolioItemData) => {
    await PortfolioStore.togglePublished(item.id);
  };

  const handleToggleApproval = async (item: PortfolioItemData) => {
    await PortfolioStore.toggleClientApproved(item.id);
  };

  const handleDelete = async (item: PortfolioItemData) => {
    if (confirm(`Apakah Anda yakin ingin menghapus item portfolio "${item.title}"?`)) {
      await PortfolioStore.delete(item.id);
    }
  };

  const handleSaveEdit = async (updated: PortfolioItemData) => {
    await PortfolioStore.update(updated.id, updated);
    setEditingItem(null);
  };

  const publishedCount = items.filter(i => i.isPublished).length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C5A880]" />
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Katalog Portfolio Showcase Klien
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Kelola daftar portofolio nyata yang tampil di katalog depan publik. Aset portofolio terpisah secara aman dan tidak akan merusak data undangan utama milik klien.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg text-xs font-mono">
            <span className="text-stone-500">Total Showcase:</span>
            <strong className="text-stone-900">{items.length} Item</strong>
            <span className="text-stone-300">|</span>
            <span className="text-emerald-700 font-semibold">{publishedCount} Tayang Publik</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (confirm('Sinkronkan & muat ulang semua template default dari katalog ke showcase?')) {
                await PortfolioStore.resetToDefaultSeed();
                refreshItems();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-300 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
            title="Muat ulang seluruh 12 template resmi ke daftar showcase"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Sinkronkan Katalog ({items.length}/12)</span>
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <th className="py-3 px-4">Item Showcase</th>
              <th className="py-3 px-4">Template Terpilih</th>
              <th className="py-3 px-4">Lokasi &amp; Tanggal</th>
              <th className="py-3 px-4 text-center">Status Tayang Publik</th>
              <th className="py-3 px-4 text-right">Aksi Kelola</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-normal">
            {items.length > 0 ? (
              items.map((item) => {
                const templateDef = TEMPLATE_REGISTRY[item.templateId] || TEMPLATE_REGISTRY['ruang-rasa'];
                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center text-stone-400 font-serif font-bold text-sm">
                            {item.brideName[0] || 'W'}
                          </div>
                        )}
                        <div>
                          <span className="font-mono text-[10px] text-stone-500 block">
                            {item.id}
                          </span>
                          <span className="font-bold text-stone-900 text-sm block">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            /{item.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-stone-900 block truncate max-w-[160px]">
                        {templateDef.name}
                      </span>
                      <span className="text-[10px] text-[#C5A880] font-semibold">
                        {templateDef.styleLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-700">
                      <span className="font-medium block">
                        {item.eventDate || '-'}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {item.city || '-'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          item.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {item.isPublished ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tayang Publik</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-stone-400" />
                            <span>Draft (Sembunyi)</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewPortfolio(item)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#C5A880] hover:text-[#141413] text-stone-700 transition-colors cursor-pointer"
                          title="Lihat Pratinjau Tampilan Undangan Demo Ini"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-800 hover:text-white text-stone-700 transition-colors cursor-pointer"
                          title="Edit Aset Independen Portfolio"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-600 hover:text-white text-stone-700 transition-colors cursor-pointer"
                          title="Hapus Item Portfolio Ini"
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
                <td colSpan={5} className="py-12 text-center text-stone-500">
                  <p className="text-sm font-medium">Belum ada item portfolio showcase yang dibuat.</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Buka tab "Undangan Klien", lalu tekan tombol <strong className="text-stone-700">"Jadikan Portfolio"</strong> pada undangan yang berstatus Published.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <PortfolioItemEditorModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};
