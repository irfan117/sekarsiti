import React from 'react';
import { ClientInvitationData } from '../../types/clientInvitation';
import sourceHtml from '../../../templstandar/langit_porselen_mekar_poppy_undangan_pernikahan_nadia_raka.html?raw';
import { createStandardSourceDataScript, createStandardSourceFeedbackScript, StandardSourceTemplateFrame } from './StandardSourceTemplateFrame';

interface Props { onBackToLanding?: () => void; onOrderViaWhatsApp?: () => void; customData?: ClientInvitationData }

const DATA_SCRIPT = createStandardSourceDataScript({
  replaceDateText: true,
  replacements: [
    { from: 'Nadia Larasati Putri, M.Ds.', field: 'brideFullName' },
    { from: 'Raka Mahendra Wijaya, S.Ars.', field: 'groomFullName' },
    { from: 'Nadia Larasati Putri', field: 'brideFullName' },
    { from: 'Raka Mahendra Wijaya', field: 'groomFullName' },
    { from: 'Nadia', field: 'brideName' },
    { from: 'Raka', field: 'groomName' },
  ],
  mapTargets: ['a[href*="maps.google"]', 'a[href*="google.com/maps"]'],
  imageTargets: [
    { selector: '#cover-overlay img, #cover-curtain img, #silk-gate-cover img', slot: 'mediaSlots.heroImage' },
  ],
  attributeTargets: [
    { selector: '.copy-bank-btn', field: 'accountNumber', attribute: 'data-copy-num', transform: 'digits', index: 0 },
    { selector: '.copy-bank-btn', field: 'secondaryAccountNumber', hideParentWhenEmpty: true, attribute: 'data-copy-num', transform: 'digits', index: 1 },
  ],
});

const FEEDBACK_SCRIPT = createStandardSourceFeedbackScript({
  formSelector: '#poppy-rsvp-form',
  nameSelector: '#input-guest-name',
  attendanceSelector: '#input-attendance',
  countSelector: '#input-guest-count',
  messageSelector: '#input-guest-wish',
  alertSelector: '#rsvp-validation-msg',
  listSelector: '#wishes-scroll-box',
  countBadgeSelector: '#wishes-total-badge',
  statusCounts: [
    { attendance: 'Hadir', selector: '#count-hadir' },
    { attendance: 'Ragu', selector: '#count-ragu' },
    { attendance: 'Tidak Hadir', selector: '#count-tidak' },
  ],
  entryCardClass: 'atelier-wish-card',
  entryNameClass: 'font-display text-lg text-shell-50',
  entryMessageClass: 'text-xs leading-relaxed text-shell-100/85',
});

export const LangitPorselenTemplate: React.FC<Props> = ({ onBackToLanding, customData }) => (
  <StandardSourceTemplateFrame
    sourceHtml={sourceHtml}
    title={`Undangan ${customData?.brideName || 'Nadia'} & ${customData?.groomName || 'Raka'} — Langit Porselen & Mekar Poppy`}
    invitation={customData}
    onBackToLanding={onBackToLanding}
    dataScript={DATA_SCRIPT}
    feedbackScript={FEEDBACK_SCRIPT}
  />
);
