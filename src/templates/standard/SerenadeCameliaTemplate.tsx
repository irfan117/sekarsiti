import React from 'react';
import { ClientInvitationData } from '../../types/clientInvitation';
import sourceHtml from '../../../templstandar/the_wedding_of_nadia_arkan_fullscreen_storyboard_invitation.html?raw';
import { createStandardSourceDataScript, createStandardSourceFeedbackScript, StandardSourceTemplateFrame } from './StandardSourceTemplateFrame';

interface Props { onBackToLanding?: () => void; onOrderViaWhatsApp?: () => void; customData?: ClientInvitationData }

const DATA_SCRIPT = createStandardSourceDataScript({
  replaceDateText: true,
  replacements: [
    { from: 'Nadia Puspita Salsabila, S.Ars.', field: 'brideFullName' },
    { from: 'Arkananta Mahendra, M.B.A.', field: 'groomFullName' },
    { from: 'Nadia Puspita Salsabila', field: 'brideFullName' },
    { from: 'Arkananta Mahendra', field: 'groomFullName' },
    { from: 'Nadia', field: 'brideName' },
    { from: 'The Dharmawangsa Jakarta', field: 'resepsiVenue' },
    { from: 'Majapahit Lounge — The Dharmawangsa', field: 'akadVenue' },
    { from: 'The Grand Ballroom — The Dharmawangsa', field: 'resepsiVenue' },
    { from: '8830 1928 34', field: 'accountNumber' },
    { from: '1240 0098 7654 3', field: 'secondaryAccountNumber' },
    { from: 'Arkan', field: 'groomName' },
  ],
  mapTargets: ['a[href*="maps.google"]', 'a[href*="google.com/maps"]'],
  imageTargets: [
    { selector: '#cover-overlay img', slot: 'mediaSlots.heroImage' },
    { selector: '#page-1 img', slot: 'mediaSlots.bridePortrait' },
  ],
  gallerySelector: '#page-5 img',
  attributeTargets: [
    { selector: '.copy-btn', field: 'accountNumber', attribute: 'data-copy', transform: 'digits', index: 0 },
    { selector: '.copy-btn', field: 'secondaryAccountNumber', hideParentWhenEmpty: true, attribute: 'data-copy', transform: 'digits', index: 1 },
  ],
});

const FEEDBACK_SCRIPT = createStandardSourceFeedbackScript({
  formSelector: '#rsvp-form',
  nameSelector: '#in-name',
  attendanceSelector: '#in-attend',
  countSelector: '#in-guests',
  messageSelector: '#in-msg',
  alertSelector: '#rsvp-error-msg',
  listSelector: '#wishes-list',
  countBadgeSelector: '#wish-count',
  entryCardClass: 'wish-entry',
  entryNameClass: 'font-serif text-lg',
  entryMessageClass: 'text-sm',
});

export const SerenadeCameliaTemplate: React.FC<Props> = ({ onBackToLanding, customData }) => (
  <StandardSourceTemplateFrame
    sourceHtml={sourceHtml}
    title={`Undangan ${customData?.brideName || 'Nadia'} & ${customData?.groomName || 'Arkan'} — Serenade Camelia`}
    invitation={customData}
    onBackToLanding={onBackToLanding}
    dataScript={DATA_SCRIPT}
    feedbackScript={FEEDBACK_SCRIPT}
  />
);
