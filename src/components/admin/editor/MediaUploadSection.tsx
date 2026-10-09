import React from 'react';
import { ClientInvitationData, TemplateId } from '../../../types/clientInvitation';
import { TEMPLATE_REGISTRY } from '../../../admin/templateRegistry';
import { MediaSlotUploader } from '../MediaSlotUploader';
import { ImageIcon, Sparkles } from 'lucide-react';

interface MediaUploadSectionProps {
  formData: ClientInvitationData;
  selectedTemplateId: TemplateId;
  onMediaSlotChange: (slotKey: string, newValue: string | string[]) => void;
  onSmartAutoAssign?: () => void;
}

export const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  formData,
  selectedTemplateId,
  onMediaSlotChange,
  onSmartAutoAssign
}) => {
  const activeTemplateDef = TEMPLATE_REGISTRY[selectedTemplateId] || TEMPLATE_REGISTRY['ruang-rasa'];

  return (
    <div className="max-w-3xl text-left space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#C5A880]" />
            <span>Slot Media &amp; Foto: {activeTemplateDef.name}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Unggah foto untuk slot media khusus template ini. Untuk galeri dan klise film, Anda bebas menambahkan foto sebanyak yang diinginkan.
          </p>
        </div>

        {onSmartAutoAssign && (
          <button
            type="button"
            onClick={onSmartAutoAssign}
            title="AI akan mengurutkan & mendistribusikan foto yang tersedia ke hero, mempelai, filmstrip, dan galeri secara cerdas"
            className="px-3.5 py-2 bg-gradient-to-r from-amber-50 to-stone-100 hover:from-amber-100 hover:to-stone-200 border border-amber-300/80 rounded-xl text-xs font-bold text-stone-800 flex items-center gap-2 shadow-2xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Tata Ulang Aset Cerdas (AI)</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activeTemplateDef.mediaSlots.map((slot) => (
          <MediaSlotUploader
            key={slot.key}
            slot={slot}
            value={(formData.mediaSlots as any)[slot.key]}
            onChange={(newVal) => onMediaSlotChange(slot.key, newVal)}
          />
        ))}
      </div>
    </div>
  );
};
