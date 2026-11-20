import React from 'react';
import { ClientInvitationData } from '../../types/clientInvitation';
import sourceHtml from '../../../templstandar/simpul_sutra_cahaya_fajar_undangan_pernikahan_clarissa_narendra.html?raw';
import { createStandardSourceDataScript, createStandardSourceFeedbackScript, StandardSourceTemplateFrame } from './StandardSourceTemplateFrame';

interface Props { onBackToLanding?: () => void; onOrderViaWhatsApp?: () => void; customData?: ClientInvitationData }

const DATA_SCRIPT = createStandardSourceDataScript({
  replaceDateText: true,
  replacements: [
    { from: 'Clarissa Kinanti, M.Ars.', field: 'brideFullName' },
    { from: 'Narendra Maheswara, S.T.', field: 'groomFullName' },
    { from: 'Clarissa Kinanti', field: 'brideFullName' },
    { from: 'Narendra Maheswara', field: 'groomFullName' },
    { from: 'Clarissa', field: 'brideName' },
    { from: 'Glasshouse Paviliun — Hutan Kota by Plataran', field: 'resepsiVenue' },
    { from: 'Hutan Kota by Plataran', field: 'resepsiVenue' },
    { from: '8420 5193 77', field: 'accountNumber' },
    { from: '1240 0983 6152 4', field: 'secondaryAccountNumber' },
    { from: 'Narendra', field: 'groomName' },
  ],
  mapTargets: ['a[href*="maps.google"]', 'a[href*="google.com/maps"]'],
  imageTargets: [
    { selector: '#cover-overlay img, #cover-curtain img, #silk-gate-cover img', slot: 'mediaSlots.heroImage' },
  ],
  attributeTargets: [
    { selector: '.copy-rekening-btn', field: 'accountNumber', attribute: 'data-copy-val', transform: 'digits', index: 0 },
    { selector: '.copy-rekening-btn', field: 'secondaryAccountNumber', hideParentWhenEmpty: true, attribute: 'data-copy-val', transform: 'digits', index: 1 },
  ],
});

const FEEDBACK_SCRIPT = createStandardSourceFeedbackScript({
  formSelector: '#atelier-rsvp-form',
  nameSelector: '#field-guest-name',
  attendanceSelector: '#field-attendance',
  countSelector: '#field-guest-qty',
  messageSelector: '#field-wish-text',
  alertSelector: '#form-error-note',
  listSelector: '#guestbook-feed',
  countBadgeSelector: '#wishes-count-badge',
  statusCounts: [
    { attendance: 'Hadir', selector: '#rsvp-cnt-hadir' },
    { attendance: 'Ragu', selector: '#rsvp-cnt-ragu' },
    { attendance: 'Tidak Hadir', selector: '#rsvp-cnt-tidak' },
  ],
  entryCardClass: 'wish-item-new',
  entryNameClass: 'font-display text-lg text-dawn-50',
  entryMessageClass: 'text-[11px] leading-relaxed text-dawn-100/85 whitespace-pre-line',
});

export const SimpulSutraTemplate: React.FC<Props> = ({ onBackToLanding, customData }) => (
  <StandardSourceTemplateFrame
    sourceHtml={sourceHtml}
    title={`Undangan ${customData?.brideName || 'Clarissa'} & ${customData?.groomName || 'Narendra'} — Simpul Sutra & Cahaya Fajar`}
    invitation={customData}
    onBackToLanding={onBackToLanding}
    dataScript={DATA_SCRIPT}
    feedbackScript={FEEDBACK_SCRIPT}
  />
);
