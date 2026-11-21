import React, { useMemo } from 'react';
import { ClientInvitationData } from '../../types/clientInvitation';
import royalClassicSource from '../../../templstandar/royal_classic_ivory_champagne_undangan_pernikahan_tari_bima.html?raw';
import { StandardSourceTemplateFrame } from './StandardSourceTemplateFrame';

interface Props {
  onBackToLanding?: () => void;
  onOrderViaWhatsApp?: () => void;
  customData?: ClientInvitationData;
}

const ROYAL_CLASSIC_DATA_SCRIPT = String.raw`
if (invitation) {
  const data = invitation;
  const date = data.eventDateFormatted || '';
  const dateUpper = date.toLocaleUpperCase('id-ID');
  const city = data.city || '';
  const bride = data.brideName || '';
  const groom = data.groomName || '';
  const fullDateParts = (data.countdownIsoDate || '').slice(0, 10).split('-');
  const dottedDate = fullDateParts.length === 3 ? fullDateParts[2] + ' . ' + fullDateParts[1] + ' . ' + fullDateParts[0] : dateUpper;
  const replacements = [
    ['Tari Anandita Putri, S.E.', data.brideFullName],
    ['Tari Anandita Putri', data.brideFullName],
    ['Bima Sakti Prakoso, M.M.', data.groomFullName],
    ['Bima Sakti Prakoso', data.groomFullName],
    ['25 APRIL 2027 • BANDUNG', dateUpper + ' • ' + city.toLocaleUpperCase('id-ID')],
    ['MINGGU, 25 APRIL 2027', dateUpper],
    ['Minggu, 25 April 2027', date],
    ['25 . 04 . 2027', dottedDate],
    ['25 APRIL 2027 • 08.00 WIB', dateUpper + ' • ' + (data.akadTime || '')],
    ['Gedung Sate Heritage & Taman Parahyangan, Bandung', data.resepsiVenue || ''],
    ['Masjid Agung & Pendopo Parahyangan', data.akadVenue || ''],
    ['Ballroom & Taman Parahyangan', data.resepsiVenue || ''],
    ['Kota Bandung', city],
    ['BANDUNG • JAWA BARAT', city.toLocaleUpperCase('id-ID')],
    ['BANDUNG', city.toLocaleUpperCase('id-ID')],
    ['Bandung', city],
    ['08.00 – 10.00 WIB', data.akadTime],
    ['11.00 – 14.00 WIB', data.resepsiTime],
    ['Tari', bride],
    ['Bima', groom],
  ].filter((entry) => typeof entry[1] === 'string' && entry[1]);

  const alternatives = replacements.map((entry) => entry[0]).sort((a, b) => b.length - a.length);
  const replacementByText = new Map(replacements);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode;
  while ((textNode = walker.nextNode())) {
    const original = textNode.nodeValue;
    let cursor = 0;
    let next = '';
    while (cursor < original.length) {
      const match = alternatives.find((value) => original.startsWith(value, cursor));
      if (match) {
        next += replacementByText.get(match) || match;
        cursor += match.length;
      } else {
        next += original[cursor];
        cursor += 1;
      }
    }
    textNode.nodeValue = next;
  }

  const coupleCards = Array.from(document.querySelectorAll('#room-03 article'));
  const setParents = (card, value) => {
    if (!card || !value) return;
    const paragraph = card.querySelector('p');
    if (paragraph) {
      paragraph.textContent = value;
      paragraph.style.whiteSpace = 'pre-line';
    }
  };
  setParents(coupleCards[0], data.brideParents);
  setParents(coupleCards[1], data.groomParents);

  const eventCards = Array.from(document.querySelectorAll('#room-05 article'));
  eventCards.forEach((card, index) => {
    const venue = index === 0 ? data.akadVenue : data.resepsiVenue;
    const time = index === 0 ? data.akadTime : data.resepsiTime;
    const details = card.querySelector('p');
    if (details && (date || venue || city)) {
      details.innerHTML = (date ? date : '') + '<br><strong class="font-semibold">' + (venue || '') + '</strong><br>' + (city || '');
    }
    const timeLine = card.querySelector('.flex.items-center.justify-between span:first-child');
    const timeRight = card.querySelector('.flex.items-center.justify-between span:last-child');
    if (index === 0 && timeRight && time) timeRight.textContent = time;
    if (index === 1 && timeLine && time) timeLine.textContent = time;
    card.querySelectorAll('a[href*="maps.google.com"]').forEach((link) => {
      if (data.mapsUrl) link.href = data.mapsUrl;
    });
  });

  const verse = document.querySelector('#room-02 blockquote');
  if (verse && data.quoteText) verse.textContent = data.quoteText;
  const quoteSource = document.querySelector('#room-02 cite');
  if (quoteSource && data.quoteSource) quoteSource.textContent = '— ' + data.quoteSource.toLocaleUpperCase('id-ID');

  const bankCards = Array.from(document.querySelectorAll('#room-07 .copy-rek-btn'));
  const bankValues = [
    { bank: data.bankName, account: data.accountNumber, holder: data.accountHolder },
    { bank: data.secondaryBankName, account: data.secondaryAccountNumber, holder: data.secondaryAccountHolder },
  ];
  bankCards.forEach((button, index) => {
    const values = bankValues[index];
    const card = button.parentElement;
    if (!card || !values) return;
    const labels = card.querySelectorAll('.flex.items-center.justify-between span');
    const account = card.querySelector('p.font-display');
    const holder = card.querySelector('p strong');
    if (labels[0] && values.bank) labels[0].textContent = values.bank.toLocaleUpperCase('id-ID');
    if (account && values.account) account.textContent = values.account;
    if (holder && values.holder) holder.textContent = values.holder;
    if (values.account) button.dataset.rek = values.account.replace(/\s/g, '');
    if (values.bank) button.dataset.bank = 'Rekening ' + values.bank;
  });

  const coverGuest = document.getElementById('cover-guest-name');
  const rsvpName = document.getElementById('rsvp-name-input');
  const guestQuery = new URL(window.parent.location.href).searchParams.get('to') || new URL(window.parent.location.href).searchParams.get('u');
  if (guestQuery && coverGuest) coverGuest.textContent = guestQuery.replace(/[<>]/g, '').trim().slice(0, 64);
  if (guestQuery && rsvpName) rsvpName.value = guestQuery.replace(/[<>]/g, '').trim().slice(0, 64);
}
`;

const ROYAL_CLASSIC_FEEDBACK_SCRIPT = String.raw`
const feedbackList = document.getElementById('guestbook-list-box');
const feedbackAlert = document.getElementById('rsvp-error-alert');
const feedbackName = document.getElementById('rsvp-name-input');
const feedbackMessage = document.getElementById('rsvp-wish-textarea');
const publishedInvitation = invitation && invitation.status === 'published' && invitation.id;

const appendGuestbookEntry = (entry) => {
  if (!feedbackList || !entry) return;
  const card = document.createElement('article');
  card.className = 'wish-item-new bg-espresso-950/90 border-l-2 border-champagne-400 p-2.5';
  const title = document.createElement('h4');
  title.className = 'font-display text-lg text-ivory-50';
  title.textContent = entry.name || '';
  const message = document.createElement('p');
  message.className = 'mt-0.5 text-[11px] leading-relaxed text-ivory-100/85 whitespace-pre-line';
  message.textContent = entry.message || '';
  card.append(title, message);
  feedbackList.prepend(card);
};

if (publishedInvitation) {
  if (feedbackList) feedbackList.replaceChildren();
  ['stat-hadir', 'stat-ragu', 'stat-tidak'].forEach((id) => {
    const counter = document.getElementById(id);
    if (counter) counter.textContent = '0';
  });
  const countBadge = document.getElementById('wishes-count-badge');
  if (countBadge) countBadge.textContent = '0 UCAPAN';

  document.addEventListener('submit', (event) => {
    if (!event.target || event.target.id !== 'classic-rsvp-form') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const form = event.target;
    const name = form.querySelector('#rsvp-name-input').value.trim();
    const attendance = form.querySelector('#rsvp-status-select').value;
    const count = form.querySelector('#rsvp-qty-select').value;
    const message = form.querySelector('#rsvp-wish-textarea').value.trim();
    if (!name || !message) {
      if (feedbackAlert) {
        feedbackAlert.textContent = 'Mohon lengkapi nama dan ucapan doa Anda terlebih dahulu.';
        feedbackAlert.classList.remove('hidden');
      }
      return;
    }
    if (feedbackAlert) feedbackAlert.classList.add('hidden');
    window.parent.postMessage({ type: 'standard-template-feedback-submit', name, attendance, count, message }, '*');
  }, true);

  window.addEventListener('message', (event) => {
    const payload = event.data;
    if (!payload || typeof payload !== 'object') return;
    if (payload.type === 'standard-template-feedback-feed') {
      if (feedbackList) feedbackList.replaceChildren();
      (payload.entries || []).forEach(appendGuestbookEntry);
      const countBadge = document.getElementById('wishes-count-badge');
      if (countBadge) countBadge.textContent = String((payload.entries || []).length) + ' UCAPAN';
    }
    if (payload.type === 'standard-template-feedback-result') {
      if (feedbackAlert) {
        feedbackAlert.textContent = payload.message || '';
        feedbackAlert.classList.remove('hidden');
      }
      if (payload.entry) {
        appendGuestbookEntry(payload.entry);
        const countBadge = document.getElementById('wishes-count-badge');
        if (countBadge) countBadge.textContent = String(feedbackList.children.length) + ' UCAPAN';
        if (feedbackName) feedbackName.value = '';
        if (feedbackMessage) feedbackMessage.value = '';
      }
    }
  });
}
`;

export const RoyalClassicTemplate: React.FC<Props> = ({ onBackToLanding, onOrderViaWhatsApp, customData }) => {
  const sourceHtml = useMemo(() => {
    let html = royalClassicSource;
    if (customData?.countdownIsoDate) {
      html = html.replace(/(const WEDDING_DATE_ISO = ')[^']+(';)/, (_match, prefix, suffix) => prefix + customData.countdownIsoDate + suffix);
    }
    return html;
  }, [customData]);

  return (
    <StandardSourceTemplateFrame
      sourceHtml={sourceHtml}
      title={`Undangan ${customData?.brideName || 'Tari'} & ${customData?.groomName || 'Bima'} — Royal Classic Ivory`}
      invitation={customData}
      onBackToLanding={onBackToLanding}
      onOrder={onOrderViaWhatsApp}
      orderPrice={49000}
      dataScript={ROYAL_CLASSIC_DATA_SCRIPT}
      feedbackScript={ROYAL_CLASSIC_FEEDBACK_SCRIPT}
    />
  );
};
