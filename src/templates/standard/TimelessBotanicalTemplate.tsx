import React from 'react';
import { ClientInvitationData } from '../../types/clientInvitation';
import sourceHtml from '../../../templstandar/the_wedding_of_nadia_arkan_timeless_floral_warm_ivory_invitation.html?raw';
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
    { selector: '#sec-hero #hero-parallax-img', slot: 'mediaSlots.heroImage' },
    { selector: '#sec-couple img', slot: 'mediaSlots.bridePortrait' },
  ],
  gallerySelector: '#sec-gallery img',
  attributeTargets: [
    { selector: '.copy-btn', field: 'accountNumber', attribute: 'data-copy', transform: 'digits', index: 0 },
    { selector: '.copy-btn', field: 'secondaryAccountNumber', hideParentWhenEmpty: true, attribute: 'data-copy', transform: 'digits', index: 1 },
  ],
});

const FEEDBACK_SCRIPT = createStandardSourceFeedbackScript({
  formSelector: '#guestbook-form',
  nameSelector: '#gb-name',
  attendanceSelector: '#gb-status',
  countSelector: '#gb-pax',
  messageSelector: '#gb-message',
  alertSelector: '#gb-error',
  listSelector: '#gb-list',
  countBadgeSelector: '#gb-count',
  entryCardClass: 'guestbook-entry',
  entryNameClass: 'font-serif text-lg',
  entryMessageClass: 'text-sm',
});

export const TimelessBotanicalTemplate: React.FC<Props> = ({ onBackToLanding, onOrderViaWhatsApp, customData }) => (
  <StandardSourceTemplateFrame
    sourceHtml={sourceHtml}
    title={`Undangan ${customData?.brideName || 'Nadia'} & ${customData?.groomName || 'Arkan'} — Timeless Botanical`}
    invitation={customData}
    onBackToLanding={onBackToLanding}
    onOrder={onOrderViaWhatsApp}
    orderPrice={49000}
    dataScript={DATA_SCRIPT}
    feedbackScript={FEEDBACK_SCRIPT}
  />
);
