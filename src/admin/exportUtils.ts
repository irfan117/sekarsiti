import { ClientInvitationData } from '../types/clientInvitation';

function triggerBrowserDownload(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadOrdersJsonBackup(orders: ClientInvitationData[]): void {
  const jsonString = JSON.stringify(orders, null, 2);
  const dateSuffix = new Date().toISOString().slice(0, 10);
  triggerBrowserDownload(jsonString, 'application/json', `sekarsiti_studio_backup_${dateSuffix}.json`);
}

export function downloadRsvpCsv(invitation: ClientInvitationData): void {
  const rsvpList = invitation.rsvpList || [];
  const headers = ['No', 'Nama Tamu', 'Konfirmasi Kehadiran', 'Jumlah Tamu', 'Tanggal RSVP'];
  const rows = rsvpList.map((item, index) => [
    index + 1,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.attendance}"`,
    item.count,
    `"${item.date || '-'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateSuffix = new Date().toISOString().slice(0, 10);
  triggerBrowserDownload(
    csvContent,
    'text/csv;charset=utf-8;',
    `rsvp_${invitation.slug || invitation.id}_${dateSuffix}.csv`
  );
}

export function downloadGuestbookCsv(invitation: ClientInvitationData): void {
  const wishes = invitation.guestbookEntries || [];
  const headers = ['No', 'Nama Pengirim', 'Ucapan dan Doa Restu', 'Waktu'];
  const rows = wishes.map((item, index) => [
    index + 1,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.message.replace(/"/g, '""')}"`,
    `"${item.time || '-'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateSuffix = new Date().toISOString().slice(0, 10);
  triggerBrowserDownload(
    csvContent,
    'text/csv;charset=utf-8;',
    `ucapan_${invitation.slug || invitation.id}_${dateSuffix}.csv`
  );
}
