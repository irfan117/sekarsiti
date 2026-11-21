import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { ClientInvitationData } from '../../types/clientInvitation';
import { AdminStore } from '../../admin/adminStore';

interface GuestbookEntry {
  name: string;
  message: string;
  time?: string;
}

interface Props {
  sourceHtml: string;
  title: string;
  invitation?: ClientInvitationData;
  onBackToLanding?: () => void;
  onOrder?: () => void;
  orderPrice?: number;
  dataScript?: string;
  feedbackScript?: string;
}

export interface StandardSourceDataBindings {
  replacements?: Array<{ from: string; field: string; transform?: 'uppercase' | 'digits' }>;
  replaceDateText?: boolean;
  textTargets?: Array<{ selector: string; field: string; index?: number }>;
  imageTargets?: Array<{ selector: string; slot: string }>;
  gallerySelector?: string;
  mapTargets?: string[];
  attributeTargets?: Array<{ selector: string; field: string; attribute: string; transform?: 'digits'; index?: number; hideParentWhenEmpty?: boolean }>;
}

export interface StandardSourceFeedbackBindings {
  formSelector: string;
  nameSelector: string;
  attendanceSelector?: string;
  countSelector?: string;
  messageSelector?: string;
  alertSelector: string;
  listSelector: string;
  countBadgeSelector?: string;
  statusCounts?: { attendance: string; selector: string }[];
  entryCardClass: string;
  entryNameClass: string;
  entryMessageClass: string;
  secondaryForm?: {
    formSelector: string;
    nameSelector: string;
    attendanceSelector?: string;
    countSelector?: string;
    messageSelector?: string;
  };
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export const buildStandardSourceDocument = (
  sourceHtml: string,
  invitation: ClientInvitationData | undefined,
  dataScript = '',
  feedbackScript = ''
) => {
  const rsvpCounts = invitation?.rsvpList?.reduce((counts, entry) => {
    const attendance = entry.attendance.toLocaleLowerCase('id-ID');
    if (attendance.includes('ragu')) counts.ragu += 1;
    else if (attendance.includes('tidak') || attendance.includes('berhalangan')) counts.tidak_hadir += 1;
    else counts.hadir += 1;
    return counts;
  }, { hadir: 0, ragu: 0, tidak_hadir: 0 });
  const publicInvitationData = invitation ? {
    id: invitation.id,
    status: invitation.status,
    brideName: invitation.brideName,
    brideFullName: invitation.brideFullName,
    brideParents: invitation.brideParents,
    groomName: invitation.groomName,
    groomFullName: invitation.groomFullName,
    groomParents: invitation.groomParents,
    eventDateFormatted: invitation.eventDateFormatted,
    countdownIsoDate: invitation.countdownIsoDate,
    akadTime: invitation.akadTime,
    akadVenue: invitation.akadVenue,
    resepsiTime: invitation.resepsiTime,
    resepsiVenue: invitation.resepsiVenue,
    city: invitation.city,
    mapsUrl: invitation.mapsUrl,
    quoteText: invitation.quoteText,
    quoteSource: invitation.quoteSource,
    bankName: invitation.bankName,
    accountNumber: invitation.accountNumber,
    accountHolder: invitation.accountHolder,
    secondaryBankName: invitation.secondaryBankName,
    secondaryAccountNumber: invitation.secondaryAccountNumber,
    secondaryAccountHolder: invitation.secondaryAccountHolder,
    rsvpCounts,
    guestbookEntries: invitation.guestbookEntries?.map(({ name, message, time }) => ({ name, message, time })),
    songTitle: invitation.songTitle,
    audioUrl: invitation.audioUrl,
    mediaSlots: invitation.mediaSlots,
  } : null;
  const sourceWithDate = invitation?.countdownIsoDate
    ? sourceHtml.replace(/((?:const|let)\s+[A-Z0-9_]*(?:DATE|TARGET)[A-Z0-9_]*\s*=\s*')[^']+(';)/gi, (_match, prefix, suffix) => prefix + invitation.countdownIsoDate + suffix)
    : sourceHtml;
  const sourceWithCountdown = invitation?.countdownIsoDate
    ? sourceWithDate.replace(/new Date\((['"])20\d{2}-[^'"]+\1\)\.getTime\(\)/g, () => `new Date('${invitation.countdownIsoDate}').getTime()`)
    : sourceWithDate;
  const bootScript = `(() => { const invitation = ${safeJson(publicInvitationData)}; ${dataScript}\n${feedbackScript} })();`;
  const scriptTag = `<script data-standard-template-bridge>${bootScript}</script>`;
  const closingBody = /<\/body\s*>/i;
  return closingBody.test(sourceHtml)
    ? sourceWithCountdown.replace(closingBody, `${scriptTag}</body>`)
    : `${sourceWithCountdown}${scriptTag}`;
};

export const createStandardSourceDataScript = (bindings: StandardSourceDataBindings) => {
  const config = safeJson(bindings);
  return `
if (invitation) {
  const config = ${config};
  const valueFor = (field) => field === 'countdownIsoDate' ? invitation.countdownIsoDate :
    field.startsWith('mediaSlots.') ? field.split('.').slice(1).reduce((value, key) => value && value[key], invitation.mediaSlots) : invitation[field];
  const replacements = (config.replacements || []).map((entry) => {
    let value = valueFor(entry.field);
    if (entry.transform === 'uppercase' && typeof value === 'string') value = value.toLocaleUpperCase('id-ID');
    if (entry.transform === 'digits' && typeof value === 'string') value = value.replace(/\\s/g, '');
    return [entry.from, value];
  }).filter((entry) => typeof entry[1] === 'string' && entry[1]);
  const alternatives = replacements.map((entry) => entry[0]).sort((a, b) => b.length - a.length);
  const replacementByText = new Map(replacements);
  const datePattern = /(?:(?:Minggu|Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[, ]+\\d{1,2}\\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}|(?:\\d{1,2}\\s*[.]\\s*){2}\\d{4})/gi;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode;
  while ((textNode = walker.nextNode())) {
    if (textNode.parentElement?.closest('script, style')) continue;
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
    textNode.nodeValue = config.replaceDateText && invitation.eventDateFormatted
      ? next.replace(datePattern, invitation.eventDateFormatted)
      : next;
  }
  (config.textTargets || []).forEach((target) => {
    const value = valueFor(target.field);
    if (!value) return;
    const elements = Array.from(document.querySelectorAll(target.selector));
    const selected = typeof target.index === 'number' ? elements.slice(target.index, target.index + 1) : elements;
    selected.forEach((element) => { element.textContent = value; });
  });
  (config.imageTargets || []).forEach((target) => {
    const value = valueFor(target.slot);
    if (typeof value !== 'string' || !value) return;
    document.querySelectorAll(target.selector).forEach((element) => { element.src = value; });
  });
  if (config.gallerySelector && invitation.mediaSlots && Array.isArray(invitation.mediaSlots.galleryImages)) {
    const images = invitation.mediaSlots.galleryImages.filter(Boolean);
    if (images.length) document.querySelectorAll(config.gallerySelector).forEach((image, index) => { image.src = images[index % images.length]; });
  }
  (config.mapTargets || []).forEach((selector) => {
    if (!invitation.mapsUrl) return;
    document.querySelectorAll(selector).forEach((link) => { link.href = invitation.mapsUrl; });
  });
  (config.attributeTargets || []).forEach((target) => {
    let value = valueFor(target.field);
    const elements = Array.from(document.querySelectorAll(target.selector));
    const selected = typeof target.index === 'number' ? elements.slice(target.index, target.index + 1) : elements;
    if (typeof value !== 'string' || !value) {
      if (target.hideParentWhenEmpty) selected.forEach((element) => { if (element.parentElement) element.parentElement.style.display = 'none'; });
      return;
    }
    if (target.transform === 'digits') value = value.replace(/\\s/g, '');
    selected.forEach((element) => { element.setAttribute(target.attribute, value); });
  });
}
`;
};

export const createStandardSourceFeedbackScript = (bindings: StandardSourceFeedbackBindings) => {
  const config = safeJson(bindings);
  return `
const feedbackConfig = ${config};
const isPublishedInvitation = invitation && invitation.status === 'published' && invitation.id;
const list = invitation && document.querySelector(feedbackConfig.listSelector);
let alert = invitation && document.querySelector(feedbackConfig.alertSelector);
if (invitation) {
  if (!alert) {
    const form = document.querySelector(feedbackConfig.formSelector);
    if (form) {
      alert = document.createElement('p');
      alert.className = 'hidden mt-2 rounded border border-red-400/40 bg-red-950/30 px-3 py-2 text-xs text-red-200';
      alert.setAttribute('role', 'status');
      form.append(alert);
    }
  }
  if (list) list.replaceChildren();
  (feedbackConfig.statusCounts || []).forEach((counter) => {
    const element = document.querySelector(counter.selector);
    const attendance = counter.attendance.toLocaleLowerCase('id-ID');
    const countKey = attendance.includes('ragu') ? 'ragu' : attendance.includes('tidak') ? 'tidak_hadir' : 'hadir';
    if (element) element.textContent = String(invitation.rsvpCounts && invitation.rsvpCounts[countKey] || 0);
  });
  const countBadge = feedbackConfig.countBadgeSelector && document.querySelector(feedbackConfig.countBadgeSelector);
  if (countBadge) countBadge.textContent = String(invitation.guestbookEntries && invitation.guestbookEntries.length || 0);
}
if (isPublishedInvitation) {
  const countBadge = feedbackConfig.countBadgeSelector && document.querySelector(feedbackConfig.countBadgeSelector);

  const appendEntry = (entry) => {
    if (!list || !entry) return;
    const card = document.createElement('article');
    card.className = feedbackConfig.entryCardClass;
    const name = document.createElement('h4');
    name.className = feedbackConfig.entryNameClass;
    name.textContent = entry.name || '';
    const message = document.createElement('p');
    message.className = feedbackConfig.entryMessageClass;
    message.textContent = entry.message || '';
    card.append(name, message);
    list.prepend(card);
  };

  (invitation.guestbookEntries || []).slice().reverse().forEach(appendEntry);

  document.addEventListener('submit', (event) => {
    if (!event.target) return;
    const secondary = feedbackConfig.secondaryForm && event.target.matches(feedbackConfig.secondaryForm.formSelector);
    if (!secondary && !event.target.matches(feedbackConfig.formSelector)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const form = event.target;
    const fields = secondary ? feedbackConfig.secondaryForm : feedbackConfig;
    const name = form.querySelector(fields.nameSelector);
    const attendance = fields.attendanceSelector ? form.querySelector(fields.attendanceSelector) : null;
    const count = fields.countSelector ? form.querySelector(fields.countSelector) : null;
    const message = fields.messageSelector ? form.querySelector(fields.messageSelector) : null;
    if (!name || !name.value.trim() || (!attendance && !(message && message.value.trim()))) {
      if (alert) {
        alert.textContent = 'Mohon lengkapi nama dan ucapan doa Anda terlebih dahulu.';
        alert.classList.remove('hidden');
      }
      return;
    }
    if (alert) alert.classList.add('hidden');
    window.parent.postMessage({
      type: 'standard-template-feedback-submit',
      name: name.value.trim(),
      attendance: attendance ? attendance.value : '',
      count: count ? count.value : '1',
      message: message ? message.value.trim() : '',
    }, '*');
  }, true);

  window.addEventListener('message', (event) => {
    const payload = event.data;
    if (!payload || typeof payload !== 'object') return;
    if (payload.type === 'standard-template-feedback-feed') {
      if (list) list.replaceChildren();
      (payload.entries || []).forEach(appendEntry);
      if (countBadge) countBadge.textContent = String((payload.entries || []).length);
    }
    if (payload.type === 'standard-template-feedback-result') {
      if (alert) {
        alert.textContent = payload.message || '';
        alert.classList.remove('hidden');
      }
      if (payload.entry) {
        appendEntry(payload.entry);
        if (countBadge && list) countBadge.textContent = String(list.children.length);
        const name = document.querySelector(feedbackConfig.nameSelector);
        const message = document.querySelector(feedbackConfig.messageSelector);
        if (name) name.value = '';
        if (message) message.value = '';
        const secondaryName = feedbackConfig.secondaryForm && document.querySelector(feedbackConfig.secondaryForm.nameSelector);
        const secondaryMessage = feedbackConfig.secondaryForm?.messageSelector && document.querySelector(feedbackConfig.secondaryForm.messageSelector);
        if (secondaryName) secondaryName.value = '';
        if (secondaryMessage) secondaryMessage.value = '';
      }
      if (payload.attendance) {
          const submitted = String(payload.attendance).toLocaleLowerCase('id-ID').replace(/_/g, ' ');
        (feedbackConfig.statusCounts || []).forEach((counter) => {
          const expected = counter.attendance.toLocaleLowerCase('id-ID');
          const matches = submitted === expected || (expected === 'ragu' && submitted === 'ragu-ragu') || (expected === 'tidak hadir' && submitted === 'tidak hadir');
          if (matches) {
            const element = document.querySelector(counter.selector);
            if (element) element.textContent = String((Number.parseInt(element.textContent || '0', 10) || 0) + 1);
          }
        });
      }
    }
  });
}
`;
};

export const StandardSourceTemplateFrame: React.FC<Props> = ({
  sourceHtml,
  title,
  invitation,
  onBackToLanding,
  onOrder,
  orderPrice,
  dataScript,
  feedbackScript,
}) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(
    () => buildStandardSourceDocument(sourceHtml, invitation, dataScript, feedbackScript),
    [sourceHtml, invitation, dataScript, feedbackScript]
  );

  useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow || !invitation?.id || invitation.status !== 'published') return;
      const payload = event.data;
      if (!payload || payload.type !== 'standard-template-feedback-submit') return;
      const reply = (message: string, entry?: GuestbookEntry, rsvp?: { attendance: string; count: number }) => {
        frameRef.current?.contentWindow?.postMessage({ type: 'standard-template-feedback-result', message, entry, attendance: rsvp?.attendance, count: rsvp?.count }, '*');
      };

      try {
        const attendance = ['Ragu', 'Belum Pasti'].includes(payload.attendance)
          ? 'ragu'
          : ['Tidak Hadir', 'Berhalangan'].includes(payload.attendance) ? 'tidak_hadir' : 'hadir';
        const count = payload.count === 'Keluarga' ? 5 : Number.parseInt(String(payload.count), 10) || 1;
        const rsvp = payload.attendance ? { attendance, count } : undefined;
        if (rsvp) AdminStore.addRsvp(invitation.id, { name: String(payload.name || ''), attendance, count });
        const cleanMessage = String(payload.message || '').trim();
        if (cleanMessage) {
          AdminStore.addGuestbook(invitation.id, { name: String(payload.name || ''), message: cleanMessage });
          const entry = { name: String(payload.name || ''), message: cleanMessage, time: 'Baru saja' };
          reply(rsvp ? `Konfirmasi ${attendance.replace('_', ' ')} dan ucapan berhasil dikirim.` : 'Ucapan berhasil dikirim.', entry, rsvp);
        } else {
          reply(rsvp ? `Konfirmasi ${attendance.replace('_', ' ')} berhasil dikirim.` : 'Konfirmasi berhasil dikirim.', undefined, rsvp);
        }
      } catch (error) {
        reply(error instanceof Error ? error.message : 'Kiriman belum dapat disimpan. Silakan coba kembali.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [invitation]);

  return (
    <div className="fixed inset-0 z-[70] h-[100dvh] w-screen overflow-hidden bg-[#FAF6F0]">
      <iframe
        ref={frameRef}
        title={title}
        srcDoc={srcDoc}
        allow="autoplay; clipboard-read; clipboard-write"
        referrerPolicy="no-referrer"
        className="block h-full w-full border-0"
      />
      {onBackToLanding && (
        <button
          type="button"
          onClick={onBackToLanding}
          className="fixed left-4 top-4 z-[80] inline-flex items-center gap-2 rounded-full border border-[#B8895A]/40 bg-[#FAF6F0]/90 px-3.5 py-2 text-xs font-semibold text-[#473831] shadow-md backdrop-blur hover:bg-[#FAF6F0] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
      )}
      {onOrder && !invitation && (
        <button
          type="button"
          onClick={onOrder}
          className="fixed right-4 top-4 z-[80] inline-flex items-center gap-1.5 rounded-full bg-[#181816] hover:bg-[#C6A679] hover:text-[#181816] text-[#FAF9F6] px-4 py-2 text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur"
        >
          <Zap size={14} className="text-[#C6A679]" />
          <span>Pesan Template Ini (Rp{orderPrice ? orderPrice.toLocaleString('id-ID') : '49.000'})</span>
        </button>
      )}
    </div>
  );
};
