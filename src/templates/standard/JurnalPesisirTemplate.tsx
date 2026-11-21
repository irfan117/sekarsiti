import React from 'react';
import { ClientInvitationData } from '../../types/clientInvitation';
import coastalJournalSource from '../../../templstandar/jurnal_pesisir_karang_senja_undangan_pernikahan_alina_rayhan.html?raw';
import { createStandardSourceDataScript, createStandardSourceFeedbackScript, StandardSourceTemplateFrame } from './StandardSourceTemplateFrame';

interface Props {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

const DATA_SCRIPT = createStandardSourceDataScript({
  replaceDateText: true,
  replacements: [
    { from: 'Alina Nareswari, S.Ds.', field: 'brideFullName' },
    { from: 'Alina Nareswari', field: 'brideFullName' },
    { from: 'Rayhan Adiputra, M.T.', field: 'groomFullName' },
    { from: 'Rayhan Adiputra', field: 'groomFullName' },
    { from: 'SABTU, 22 MEI 2027 • NUSA DUA, BALI', field: 'eventDateFormatted', transform: 'uppercase' },
    { from: 'SABTU, 22 MEI 2027 • 08.30 WITA', field: 'eventDateFormatted', transform: 'uppercase' },
    { from: 'SABTU, 22 MEI 2027', field: 'eventDateFormatted', transform: 'uppercase' },
    { from: 'Sabtu, 22 Mei 2027', field: 'eventDateFormatted' },
    { from: 'The Oceanfront Paviliun • Nusa Dua, Bali', field: 'resepsiVenue' },
    { from: 'Chapel Samudra — The Oceanfront Paviliun', field: 'akadVenue' },
    { from: 'Taman Karang & Teras Pesisir', field: 'resepsiVenue' },
    { from: '08.30 – 10.00 WITA', field: 'akadTime' },
    { from: '18.30 – 21.30 WITA', field: 'resepsiTime' },
    { from: 'BALI', field: 'city', transform: 'uppercase' },
    { from: 'Bali', field: 'city' },
    { from: 'NUSA DUA, BALI', field: 'city' },
    { from: 'BANK CENTRAL ASIA (BCA)', field: 'bankName', transform: 'uppercase' },
    { from: '7310 4829 15', field: 'accountNumber' },
    { from: 'Rayhan Adiputra', field: 'accountHolder' },
    { from: 'BANK MANDIRI', field: 'secondaryBankName', transform: 'uppercase' },
    { from: '1300 0847 2916 3', field: 'secondaryAccountNumber' },
    { from: 'Alina Nareswari', field: 'secondaryAccountHolder' },
    { from: 'Alina', field: 'brideName' },
    { from: 'Rayhan', field: 'groomName' },
  ],
  textTargets: [
    { selector: '#room-03 article h3', field: 'brideFullName', index: 0 },
    { selector: '#room-03 article h3', field: 'groomFullName', index: 1 },
    { selector: '#room-03 article p', field: 'brideParents', index: 0 },
    { selector: '#room-03 article p', field: 'groomParents', index: 1 },
    { selector: '#room-05 article strong', field: 'akadVenue', index: 0 },
    { selector: '#room-05 article strong', field: 'resepsiVenue', index: 1 },
    { selector: '#room-02 blockquote', field: 'quoteText' },
    { selector: '#room-02 cite', field: 'quoteSource' },
  ],
  attributeTargets: [
    { selector: '#room-07 .copy-account-btn', field: 'accountNumber', attribute: 'data-account', transform: 'digits', index: 0 },
    { selector: '#room-07 .copy-account-btn', field: 'secondaryAccountNumber', hideParentWhenEmpty: true, attribute: 'data-account', transform: 'digits', index: 1 },
  ],
  mapTargets: ['#room-05 article a'],
});

const FEEDBACK_SCRIPT = createStandardSourceFeedbackScript({
  formSelector: '#coastal-rsvp-form',
  nameSelector: '#input-guest-name',
  attendanceSelector: '#select-attendance',
  countSelector: '#select-guest-count',
  messageSelector: '#textarea-wish',
  alertSelector: '#rsvp-validation-msg',
  listSelector: '#wish-list-container',
  countBadgeSelector: '#wish-total-label',
  statusCounts: [
    { attendance: 'Hadir', selector: '#stat-hadir' },
    { attendance: 'Ragu', selector: '#stat-ragu' },
    { attendance: 'Tidak Hadir', selector: '#stat-tidak' },
  ],
  entryCardClass: 'wish-item-new bg-marine-950/90 border-l-2 border-coral-400 p-2.5',
  entryNameClass: 'font-display text-lg text-shell-50',
  entryMessageClass: 'mt-0.5 text-[11px] leading-relaxed text-shell-100/85 whitespace-pre-line',
});

export const JurnalPesisirTemplate: React.FC<Props> = ({ onBackToLanding, onOrderViaWhatsApp, customData }) => (
  <StandardSourceTemplateFrame
    sourceHtml={coastalJournalSource}
    title={`Undangan ${customData?.brideName || 'Alina'} & ${customData?.groomName || 'Rayhan'} — Jurnal Pesisir`}
    invitation={customData}
    onBackToLanding={onBackToLanding}
    onOrder={onOrderViaWhatsApp}
    orderPrice={49000}
    dataScript={DATA_SCRIPT}
    feedbackScript={FEEDBACK_SCRIPT}
  />
);
