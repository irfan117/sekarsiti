import React from 'react';
import { ClientInvitationData } from '../../types/clientInvitation';
import sourceHtml from '../../../templstandar/voilier_de_soie_haute_couture_interactive_wedding_invitation.html?raw';
import { createStandardSourceDataScript, createStandardSourceFeedbackScript, StandardSourceTemplateFrame } from './StandardSourceTemplateFrame';

interface Props { onBackToLanding?: () => void; onOrderViaWhatsApp?: () => void; customData?: ClientInvitationData }

const DATA_SCRIPT = createStandardSourceDataScript({
  replaceDateText: true,
  replacements: [
    { from: 'Nadia Puspita Salsabila, S.Ars.', field: 'brideFullName' },
    { from: 'Nadia Puspita Salsabila', field: 'brideFullName' },
    { from: 'Arkananta Mahendra, M.B.A.', field: 'groomFullName' },
    { from: 'Arkananta Mahendra', field: 'groomFullName' },
    { from: 'Nadia Puspita Salsabila', field: 'brideFullName' },
    { from: 'Arkananta Mahendra', field: 'groomFullName' },
    { from: 'Nadia', field: 'brideName' },
    { from: 'The Dharmawangsa Jakarta', field: 'resepsiVenue' },
    { from: 'Majapahit Lounge — The Dharmawangsa Jakarta', field: 'akadVenue' },
    { from: 'The Grand Ballroom — The Dharmawangsa Jakarta', field: 'resepsiVenue' },
    { from: '8830 1928 34', field: 'accountNumber' },
    { from: '1240 0098 7654 3', field: 'secondaryAccountNumber' },
    { from: 'Arkan', field: 'groomName' },
  ],
  imageTargets: [
    { selector: '#cover-overlay img', slot: 'mediaSlots.heroImage' },
    { selector: '#sec-hero #hero-parallax-img', slot: 'mediaSlots.heroImage' },
    { selector: '#sec-couple img', slot: 'mediaSlots.bridePortrait' },
  ],
  gallerySelector: '#sec-gallery img',
  mapTargets: ['a[href*="maps.google"]', 'a[href*="google.com/maps"]'],
  attributeTargets: [
    { selector: '.copy-btn', field: 'accountNumber', attribute: 'data-copy', transform: 'digits', index: 0 },
    { selector: '.copy-btn', field: 'secondaryAccountNumber', hideParentWhenEmpty: true, attribute: 'data-copy', transform: 'digits', index: 1 },
  ],
});

const FEEDBACK_SCRIPT = createStandardSourceFeedbackScript({
  formSelector: '#form-rsvp',
  nameSelector: '#rsvp-input-name',
  attendanceSelector: '#rsvp-input-status',
  countSelector: '#rsvp-input-pax',
  alertSelector: '#rsvp-error-text',
  listSelector: '#wishes-feed',
  countBadgeSelector: '#wishes-total-badge',
  entryCardClass: 'rounded-xl border border-gold/30 bg-white p-4 text-obsidian',
  entryNameClass: 'font-serif text-lg',
  entryMessageClass: 'mt-1 text-sm',
  secondaryForm: {
    formSelector: '#form-wishes',
    nameSelector: '#wish-input-name',
    messageSelector: '#wish-input-message',
  },
});

export const VoilierDeSoieTemplate: React.FC<Props> = ({ onBackToLanding, onOrderViaWhatsApp, customData }) => (
  <StandardSourceTemplateFrame
    sourceHtml={sourceHtml}
    title={`Undangan ${customData?.brideName || 'Nadia'} & ${customData?.groomName || 'Arkan'} — Voilier de Soie`}
    invitation={customData}
    onBackToLanding={onBackToLanding}
    onOrder={onOrderViaWhatsApp}
    orderPrice={49000}
    dataScript={DATA_SCRIPT}
    feedbackScript={FEEDBACK_SCRIPT}
  />
);
