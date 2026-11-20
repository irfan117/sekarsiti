import React from 'react';
import { ClientInvitationData } from '../../types/clientInvitation';
import sourceHtml from '../../../templstandar/l_clipse_d_amour_editorial_wedding_invitation.html?raw';
import { createStandardSourceDataScript, createStandardSourceFeedbackScript, StandardSourceTemplateFrame } from './StandardSourceTemplateFrame';

interface Props { onBackToLanding?: () => void; onOrderViaWhatsApp?: () => void; customData?: ClientInvitationData }

const DATA_SCRIPT = createStandardSourceDataScript({
  replaceDateText: true,
  replacements: [
    { from: 'Rayhan Pradipta, IAI.', field: 'brideFullName' },
    { from: 'Kalila Nareswari, M.Sn.', field: 'groomFullName' },
    { from: 'Rayhan Pradipta', field: 'brideFullName' },
    { from: 'Kalila Nareswari', field: 'groomFullName' },
    { from: 'Rayhan', field: 'brideName' },
    { from: 'Observatorium Lembang, Bandung', field: 'city' },
    { from: 'Glasshouse Amphitheater — Gedong Putih', field: 'resepsiVenue' },
    { from: 'Grand Hall — Gedong Putih', field: 'akadVenue' },
    { from: '4372 8910 44', field: 'accountNumber' },
    { from: '1310 0984 5512 0', field: 'secondaryAccountNumber' },
    { from: 'Kalila', field: 'groomName' },
  ],
  mapTargets: ['a[href*="maps.google"]', 'a[href*="google.com/maps"]'],
  imageTargets: [
    { selector: '#cover-overlay img, #cover-curtain img, #silk-gate-cover img', slot: 'mediaSlots.heroImage' },
  ],
  attributeTargets: [
    { selector: '.copy-account-btn', field: 'accountNumber', attribute: 'data-copy', transform: 'digits', index: 0 },
    { selector: '.copy-account-btn', field: 'secondaryAccountNumber', hideParentWhenEmpty: true, attribute: 'data-copy', transform: 'digits', index: 1 },
  ],
});

const FEEDBACK_SCRIPT = createStandardSourceFeedbackScript({
  formSelector: '#rsvp-wish-form',
  nameSelector: '#input-guest-name',
  attendanceSelector: '#input-attendance',
  countSelector: '#input-pax',
  messageSelector: '#input-message',
  alertSelector: '#rsvp-error-msg',
  listSelector: '#wishes-list-container',
  countBadgeSelector: '#wishes-count-badge',
  entryCardClass: 'wish-card',
  entryNameClass: 'font-serif text-lg',
  entryMessageClass: 'text-sm',
});

export const LEclipseDamourTemplate: React.FC<Props> = ({ onBackToLanding, customData }) => (
  <StandardSourceTemplateFrame
    sourceHtml={sourceHtml}
    title={`Undangan ${customData?.brideName || 'Rayhan'} & ${customData?.groomName || 'Kalila'} — L'Éclipse d'Amour`}
    invitation={customData}
    onBackToLanding={onBackToLanding}
    dataScript={DATA_SCRIPT}
    feedbackScript={FEEDBACK_SCRIPT}
  />
);
