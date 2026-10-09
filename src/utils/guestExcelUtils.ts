import * as XLSX from 'xlsx';
import { ClientInvitationData } from '../types/clientInvitation';

export interface ImportedGuestRow {
  guestName: string;
  category: string;
  phone: string;
}

const SAMPLE_TEMPLATE_ROWS = [
  {
    No: 1,
    'Nama Tamu': 'Bpk. Ir. Hendra Wijaya & Keluarga',
    Kategori: 'Keluarga',
    'No WhatsApp': '081234567890'
  },
  {
    No: 2,
    'Nama Tamu': 'Ibu Hj. Siti Aminah & Suami',
    Kategori: 'VIP',
    'No WhatsApp': '081398765432'
  },
  {
    No: 3,
    'Nama Tamu': 'dr. Danang Triputra, Sp.A',
    Kategori: 'Sahabat',
    'No WhatsApp': '085611223344'
  },
  {
    No: 4,
    'Nama Tamu': 'Rekan Divisi Kreatif Studio',
    Kategori: 'Rekan Kerja',
    'No WhatsApp': ''
  },
  {
    No: 5,
    'Nama Tamu': 'Keluarga Besar Alm. H. Abdullah',
    Kategori: 'Keluarga',
    'No WhatsApp': ''
  }
];

const TEMPLATE_GUIDE_ROWS = [
  { Kolom: 'Nama Tamu (Wajib)', Keterangan: 'Nama lengkap tamu atau grup yang akan ditampilkan pada sampul undangan. Contoh: Bpk. Budi & Istri' },
  { Kolom: 'Kategori (Opsional)', Keterangan: 'Pilih atau ketik kategori seperti: Keluarga, VIP, Sahabat, Rekan Kerja, atau Umum.' },
  { Kolom: 'No WhatsApp (Opsional)', Keterangan: 'Nomor WA aktif (contoh: 0812xxxx atau 62812xxxx) agar bisa langsung klik kirim tanpa simpan nomor.' },
  { Kolom: 'Catatan Penting', Keterangan: 'Hapus atau ganti baris contoh pada sheet "Daftar Tamu" sebelum mengunggah file Excel ini.' }
];

/**
 * Mengunduh file template Excel (.xlsx) resmi untuk pengisian daftar tamu undangan
 */
export function downloadGuestExcelTemplate(clientSlug?: string): void {
  const wb = XLSX.utils.book_new();

  const wsGuests = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);
  wsGuests['!cols'] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 18 },
    { wch: 20 }
  ];

  const wsGuide = XLSX.utils.json_to_sheet(TEMPLATE_GUIDE_ROWS);
  wsGuide['!cols'] = [
    { wch: 24 },
    { wch: 85 }
  ];

  XLSX.utils.book_append_sheet(wb, wsGuests, 'Daftar Tamu');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan Pengisian');

  const filename = clientSlug
    ? `template_daftar_tamu_${clientSlug}.xlsx`
    : 'template_daftar_tamu_sekarsiti.xlsx';

  XLSX.writeFile(wb, filename);
}

/**
 * Mengekspor daftar tautan undangan beserta teks WhatsApp ke file Excel (.xlsx)
 */
export function exportGuestLinksToExcel(
  invitation: ClientInvitationData,
  rows: Array<{ guestName: string; category?: string; phone?: string; link: string; message: string }>
): void {
  const wb = XLSX.utils.book_new();

  const sheetData = rows.map((item, idx) => ({
    No: idx + 1,
    'Nama Tamu': item.guestName,
    Kategori: item.category || 'Tamu Undangan',
    'No WhatsApp': item.phone || '-',
    'Tautan Undangan Personal': item.link,
    'Pesan WhatsApp Siap Kirim': item.message
  }));

  const ws = XLSX.utils.json_to_sheet(sheetData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 34 },
    { wch: 16 },
    { wch: 18 },
    { wch: 52 },
    { wch: 65 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Tautan Undangan');
  const filename = `tautan_undangan_${invitation.slug || invitation.id}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Membaca file Excel (.xlsx, .xls) atau CSV dan mengekstrak daftar tamu
 */
export async function parseGuestExcelFile(file: File): Promise<ImportedGuestRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawObjects = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (rawObjects.length === 0) {
    throw new Error('Data tamu kosong di dalam file Excel.');
  }

  const results: ImportedGuestRow[] = [];

  for (const row of rawObjects) {
    const entries = Object.entries(row);
    let guestName = '';
    let category = 'Tamu Undangan';
    let phone = '';

    for (const [rawKey, rawVal] of entries) {
      const key = rawKey.trim().toLowerCase();
      const val = String(rawVal ?? '').trim();
      if (!val) continue;

      if (
        key.includes('nama') ||
        key.includes('tamu') ||
        key.includes('guest') ||
        key.includes('penerima') ||
        key.includes('kepada')
      ) {
        if (!guestName) guestName = val;
      } else if (
        key.includes('kategori') ||
        key.includes('category') ||
        key.includes('grup') ||
        key.includes('group') ||
        key.includes('relasi')
      ) {
        category = val;
      } else if (
        key.includes('wa') ||
        key.includes('whatsapp') ||
        key.includes('hp') ||
        key.includes('telp') ||
        key.includes('telepon') ||
        key.includes('phone') ||
        key.includes('nomor')
      ) {
        phone = val;
      }
    }

    // Fallback jika pengguna memakai Excel tanpa judul kolom standar (mis. langsung daftar nama di kolom pertama)
    if (!guestName) {
      for (const [rawKey, rawVal] of entries) {
        const key = rawKey.trim().toLowerCase();
        const val = String(rawVal ?? '').trim();
        if (!val) continue;
        // Abaikan kolom nomor urut murni
        if (key === 'no' || key === 'no.' || /^\d+$/.test(val)) continue;
        guestName = val;
        break;
      }
    }

    if (guestName) {
      results.push({
        guestName,
        category: category || 'Tamu Undangan',
        phone
      });
    }
  }

  if (results.length === 0) {
    throw new Error('Tidak ditemukan kolom "Nama Tamu" yang valid. Gunakan template Excel yang tersedia.');
  }

  return results;
}
