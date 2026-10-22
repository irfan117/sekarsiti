import { ClientInvitationData } from '../types/clientInvitation';

export interface ImportedGuestRow {
  guestName: string;
  category: string;
  phone: string;
}

type SheetRow = Record<string, string | number>;

interface SheetSpec {
  name: string;
  rows: SheetRow[];
  colWidths?: number[];
}

const SAMPLE_TEMPLATE_ROWS: SheetRow[] = [
  {
    No: 1,
    'Nama Tamu': 'Bpk. Ir. Hendra Wijaya & Keluarga',
    Kategori: 'Keluarga',
    'No WhatsApp': '081234567890',
  },
  {
    No: 2,
    'Nama Tamu': 'Ibu Hj. Siti Aminah & Suami',
    Kategori: 'VIP',
    'No WhatsApp': '081398765432',
  },
  {
    No: 3,
    'Nama Tamu': 'dr. Danang Triputra, Sp.A',
    Kategori: 'Sahabat',
    'No WhatsApp': '085611223344',
  },
  {
    No: 4,
    'Nama Tamu': 'Rekan Divisi Kreatif Studio',
    Kategori: 'Rekan Kerja',
    'No WhatsApp': '',
  },
  {
    No: 5,
    'Nama Tamu': 'Keluarga Besar Alm. H. Abdullah',
    Kategori: 'Keluarga',
    'No WhatsApp': '',
  },
];

const TEMPLATE_GUIDE_ROWS: SheetRow[] = [
  {
    Kolom: 'Nama Tamu (Wajib)',
    Keterangan:
      'Nama lengkap tamu atau grup yang akan ditampilkan pada sampul undangan. Contoh: Bpk. Budi & Istri',
  },
  {
    Kolom: 'Kategori (Opsional)',
    Keterangan:
      'Pilih atau ketik kategori seperti: Keluarga, VIP, Sahabat, Rekan Kerja, atau Umum.',
  },
  {
    Kolom: 'No WhatsApp (Opsional)',
    Keterangan:
      'Nomor WA aktif (contoh: 0812xxxx atau 62812xxxx) agar bisa langsung klik kirim tanpa simpan nomor.',
  },
  {
    Kolom: 'Catatan Penting',
    Keterangan:
      'Hapus atau ganti baris contoh pada sheet "Daftar Tamu" sebelum mengunggah file Excel ini.',
  },
];

// ============================================================================
// OPENXML (.XLSX) BUILDER & PARSER TANPA DEPENDENSI RENTAN
// ============================================================================

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnIndexToLetter(index: number): string {
  let col = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    n = Math.floor((n - 1) / 26);
  }
  return col;
}

function columnLetterToIndex(letters: string): number {
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

function buildWorksheetXml(rows: SheetRow[], colWidths?: number[]): string {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const colsXml =
    colWidths && colWidths.length > 0
      ? `<cols>${colWidths
          .map(
            (w, idx) =>
              `<col min="${idx + 1}" max="${idx + 1}" width="${w}" customWidth="1"/>`
          )
          .join('')}</cols>`
      : '';

  const allMatrix: Array<Array<string | number>> = [];
  if (headers.length > 0) {
    allMatrix.push(headers);
    for (const row of rows) {
      allMatrix.push(headers.map((h) => row[h] ?? ''));
    }
  }

  const rowsXml = allMatrix
    .map((cells, rIdx) => {
      const rowNum = rIdx + 1;
      const cellsXml = cells
        .map((val, cIdx) => {
          const ref = `${columnIndexToLetter(cIdx)}${rowNum}`;
          if (typeof val === 'number' && Number.isFinite(val)) {
            return `<c r="${ref}"><v>${val}</v></c>`;
          }
          const text = escapeXml(String(val ?? ''));
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
        })
        .join('');
      return `<row r="${rowNum}">${cellsXml}</row>`;
    })
    .join('');

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    colsXml +
    `<sheetData>${rowsXml}</sheetData>` +
    `</worksheet>`
  );
}

function createZipArchive(files: Array<{ name: string; content: string }>): Uint8Array {
  const encoder = new TextEncoder();
  const entries = files.map((f) => {
    const nameBytes = encoder.encode(f.name);
    const dataBytes = encoder.encode(f.content);
    const crc = crc32(dataBytes);
    return { nameBytes, dataBytes, crc, offset: 0 };
  });

  let localSize = 0;
  let centralSize = 0;
  for (const entry of entries) {
    entry.offset = localSize;
    localSize += 30 + entry.nameBytes.length + entry.dataBytes.length;
    centralSize += 46 + entry.nameBytes.length;
  }

  const totalSize = localSize + centralSize + 22;
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);
  let pos = 0;

  for (const entry of entries) {
    view.setUint32(pos, 0x04034b50, true);
    view.setUint16(pos + 4, 20, true);
    view.setUint16(pos + 6, 0x0800, true); // UTF-8 flag
    view.setUint16(pos + 8, 0, true); // STORE
    view.setUint16(pos + 10, 0, true);
    view.setUint16(pos + 12, 0, true);
    view.setUint32(pos + 14, entry.crc, true);
    view.setUint32(pos + 18, entry.dataBytes.length, true);
    view.setUint32(pos + 22, entry.dataBytes.length, true);
    view.setUint16(pos + 26, entry.nameBytes.length, true);
    view.setUint16(pos + 28, 0, true);
    pos += 30;
    out.set(entry.nameBytes, pos);
    pos += entry.nameBytes.length;
    out.set(entry.dataBytes, pos);
    pos += entry.dataBytes.length;
  }

  const centralStart = pos;
  for (const entry of entries) {
    view.setUint32(pos, 0x02014b50, true);
    view.setUint16(pos + 4, 20, true);
    view.setUint16(pos + 6, 20, true);
    view.setUint16(pos + 8, 0x0800, true);
    view.setUint16(pos + 10, 0, true);
    view.setUint16(pos + 12, 0, true);
    view.setUint16(pos + 14, 0, true);
    view.setUint32(pos + 16, entry.crc, true);
    view.setUint32(pos + 20, entry.dataBytes.length, true);
    view.setUint32(pos + 24, entry.dataBytes.length, true);
    view.setUint16(pos + 28, entry.nameBytes.length, true);
    view.setUint16(pos + 30, 0, true);
    view.setUint16(pos + 32, 0, true);
    view.setUint16(pos + 34, 0, true);
    view.setUint16(pos + 36, 0, true);
    view.setUint32(pos + 38, 0, true);
    view.setUint32(pos + 42, entry.offset, true);
    pos += 46;
    out.set(entry.nameBytes, pos);
    pos += entry.nameBytes.length;
  }

  view.setUint32(pos, 0x06054b50, true);
  view.setUint16(pos + 4, 0, true);
  view.setUint16(pos + 6, 0, true);
  view.setUint16(pos + 8, entries.length, true);
  view.setUint16(pos + 10, entries.length, true);
  view.setUint32(pos + 12, centralSize, true);
  view.setUint32(pos + 16, centralStart, true);
  view.setUint16(pos + 20, 0, true);

  return out;
}

function downloadWorkbookAsXlsx(sheets: SheetSpec[], filename: string): void {
  const contentTypesOverrides = sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('');

  const contentTypesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    contentTypesOverrides +
    `</Types>`;

  const rootRelsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;

  const workbookSheetsXml = sheets
    .map(
      (s, i) =>
        `<sheet name="${escapeXml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
    )
    .join('');

  const workbookXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets>${workbookSheetsXml}</sheets>` +
    `</workbook>`;

  const workbookRelsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    sheets
      .map(
        (_, i) =>
          `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
      )
      .join('') +
    `</Relationships>`;

  const files: Array<{ name: string; content: string }> = [
    { name: '[Content_Types].xml', content: contentTypesXml },
    { name: '_rels/.rels', content: rootRelsXml },
    { name: 'xl/workbook.xml', content: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
    ...sheets.map((s, i) => ({
      name: `xl/worksheets/sheet${i + 1}.xml`,
      content: buildWorksheetXml(s.rows, s.colWidths),
    })),
  ];

  const zipBytes = createZipArchive(files);
  const blob = new Blob([zipBytes.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Mengunduh file template Excel (.xlsx) resmi untuk pengisian daftar tamu undangan
 */
export function downloadGuestExcelTemplate(clientSlug?: string): void {
  const filename = clientSlug
    ? `template_daftar_tamu_${clientSlug}.xlsx`
    : 'template_daftar_tamu_sekarsiti.xlsx';

  downloadWorkbookAsXlsx(
    [
      {
        name: 'Daftar Tamu',
        rows: SAMPLE_TEMPLATE_ROWS,
        colWidths: [6, 38, 18, 20],
      },
      {
        name: 'Panduan Pengisian',
        rows: TEMPLATE_GUIDE_ROWS,
        colWidths: [24, 85],
      },
    ],
    filename
  );
}

/**
 * Mengekspor daftar tautan undangan beserta teks WhatsApp ke file Excel (.xlsx)
 */
export function exportGuestLinksToExcel(
  invitation: ClientInvitationData,
  rows: Array<{
    guestName: string;
    category?: string;
    phone?: string;
    link: string;
    message: string;
  }>
): void {
  const sheetData: SheetRow[] = rows.map((item, idx) => ({
    No: idx + 1,
    'Nama Tamu': item.guestName,
    Kategori: item.category || 'Tamu Undangan',
    'No WhatsApp': item.phone || '-',
    'Tautan Undangan Personal': item.link,
    'Pesan WhatsApp Siap Kirim': item.message,
  }));

  const filename = `tautan_undangan_${invitation.slug || invitation.id}.xlsx`;
  downloadWorkbookAsXlsx(
    [
      {
        name: 'Tautan Undangan',
        rows: sheetData,
        colWidths: [6, 34, 16, 18, 52, 65],
      },
    ],
    filename
  );
}

// ============================================================================
// EKSTRAKTOR ZIP & PARSER XLSX / CSV
// ============================================================================

async function inflateRawBytes(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressed as unknown as BufferSource);
  writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
    }
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function extractZipTextEntries(buffer: ArrayBuffer): Promise<Map<string, string>> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const decoder = new TextDecoder('utf-8');
  const entries = new Map<string, string>();

  // Cari End of Central Directory (EOCD) dari belakang
  let eocdPos = -1;
  const minEocdOffset = Math.max(0, bytes.length - 65557);
  for (let i = bytes.length - 22; i >= minEocdOffset; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdPos = i;
      break;
    }
  }

  if (eocdPos === -1) {
    throw new Error('Format file Excel (.xlsx) tidak valid atau rusak.');
  }

  const totalEntries = view.getUint16(eocdPos + 10, true);
  let cdPos = view.getUint32(eocdPos + 16, true);

  for (let i = 0; i < totalEntries && cdPos + 46 <= bytes.length; i++) {
    if (view.getUint32(cdPos, true) !== 0x02014b50) break;
    const method = view.getUint16(cdPos + 10, true);
    const compSize = view.getUint32(cdPos + 20, true);
    const nameLen = view.getUint16(cdPos + 28, true);
    const extraLen = view.getUint16(cdPos + 30, true);
    const commentLen = view.getUint16(cdPos + 32, true);
    const localHeaderOffset = view.getUint32(cdPos + 42, true);

    const fileName = decoder.decode(bytes.subarray(cdPos + 46, cdPos + 46 + nameLen));
    cdPos += 46 + nameLen + extraLen + commentLen;

    if (
      fileName === 'xl/sharedStrings.xml' ||
      fileName.startsWith('xl/worksheets/sheet')
    ) {
      const localNameLen = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
      const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
      const rawSlice = bytes.subarray(dataStart, dataStart + compSize);

      if (method === 0) {
        entries.set(fileName, decoder.decode(rawSlice));
      } else if (method === 8) {
        const inflated = await inflateRawBytes(rawSlice);
        entries.set(fileName, decoder.decode(inflated));
      }
    }
  }

  return entries;
}

function parseSharedStringsXml(xmlText?: string): string[] {
  if (!xmlText) return [];
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const siNodes = Array.from(doc.getElementsByTagName('si'));
  return siNodes.map((si) => {
    const tNodes = Array.from(si.getElementsByTagName('t'));
    return tNodes.map((t) => t.textContent ?? '').join('');
  });
}

function parseWorksheetXmlToRows(
  sheetXml: string,
  sharedStrings: string[]
): Array<Record<string, string>> {
  const doc = new DOMParser().parseFromString(sheetXml, 'application/xml');
  const rowNodes = Array.from(doc.getElementsByTagName('row'));
  if (rowNodes.length === 0) return [];

  const matrix: string[][] = [];

  for (const rowNode of rowNodes) {
    const cellNodes = Array.from(rowNode.getElementsByTagName('c'));
    const rowValues: string[] = [];

    for (let cIdx = 0; cIdx < cellNodes.length; cIdx++) {
      const cell = cellNodes[cIdx];
      const refAttr = cell.getAttribute('r') || '';
      const colMatch = refAttr.match(/^[A-Z]+/i);
      const targetCol = colMatch
        ? columnLetterToIndex(colMatch[0].toUpperCase())
        : rowValues.length;

      while (rowValues.length < targetCol) {
        rowValues.push('');
      }

      const cellType = cell.getAttribute('t');
      let cellText = '';

      if (cellType === 'inlineStr') {
        const tNodes = Array.from(cell.getElementsByTagName('t'));
        cellText = tNodes.map((t) => t.textContent ?? '').join('');
      } else {
        const vNode = cell.getElementsByTagName('v')[0];
        const rawVal = vNode?.textContent ?? '';
        if (cellType === 's') {
          const sIdx = Number.parseInt(rawVal, 10);
          cellText = Number.isInteger(sIdx) ? sharedStrings[sIdx] ?? '' : '';
        } else {
          cellText = rawVal;
        }
      }

      rowValues[targetCol] = cellText;
    }

    if (rowValues.some((v) => v.trim() !== '')) {
      matrix.push(rowValues);
    }
  }

  return matrixToObjects(matrix);
}

function parseCsvToRows(csvText: string): Array<Record<string, string>> {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const firstLine = cleanText.split(/\r?\n/)[0] || '';
  const delimiter = firstLine.includes(';')
    ? ';'
    : firstLine.includes('\t')
      ? '\t'
      : ',';

  const matrix: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    if (inQuotes) {
      if (ch === '"') {
        if (cleanText[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && cleanText[i + 1] === '\n') i++;
      currentRow.push(currentCell);
      if (currentRow.some((v) => v.trim() !== '')) {
        matrix.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += ch;
    }
  }

  currentRow.push(currentCell);
  if (currentRow.some((v) => v.trim() !== '')) {
    matrix.push(currentRow);
  }

  return matrixToObjects(matrix);
}

function matrixToObjects(matrix: string[][]): Array<Record<string, string>> {
  if (matrix.length === 0) return [];
  const headerRow = matrix[0];

  // Cek apakah baris pertama adalah judul kolom atau langsung data
  const looksLikeHeader = headerRow.some((cell) => {
    const lower = cell.trim().toLowerCase();
    return (
      lower === 'no' ||
      lower === 'no.' ||
      lower.includes('nama') ||
      lower.includes('tamu') ||
      lower.includes('guest') ||
      lower.includes('kategori') ||
      lower.includes('wa') ||
      lower.includes('whatsapp') ||
      lower.includes('telepon') ||
      lower.includes('phone')
    );
  });

  const headers = looksLikeHeader
    ? headerRow.map((h, idx) => h.trim() || `Kolom_${idx + 1}`)
    : headerRow.map((_, idx) => (idx === 0 ? 'Nama Tamu' : `Kolom_${idx + 1}`));

  const startRow = looksLikeHeader ? 1 : 0;
  const objects: Array<Record<string, string>> = [];

  for (let r = startRow; r < matrix.length; r++) {
    const row = matrix[r];
    const obj: Record<string, string> = Object.create(null);
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c] ?? '';
    }
    objects.push(obj);
  }

  return objects;
}

/**
 * Membaca file Excel (.xlsx) atau CSV dan mengekstrak daftar tamu
 */
export async function parseGuestExcelFile(file: File): Promise<ImportedGuestRow[]> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04;

  let rawObjects: Array<Record<string, string>> = [];

  if (isZip) {
    const entries = await extractZipTextEntries(buffer);
    const sharedStrings = parseSharedStringsXml(entries.get('xl/sharedStrings.xml'));
    const firstSheetKey =
      entries.has('xl/worksheets/sheet1.xml')
        ? 'xl/worksheets/sheet1.xml'
        : Array.from(entries.keys())
            .filter((k) => k.startsWith('xl/worksheets/sheet'))
            .sort()[0];

    if (!firstSheetKey) {
      throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
    }

    rawObjects = parseWorksheetXmlToRows(entries.get(firstSheetKey)!, sharedStrings);
  } else {
    const text = new TextDecoder('utf-8').decode(bytes);
    rawObjects = parseCsvToRows(text);
  }

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

    // Fallback jika pengguna memakai Excel tanpa judul kolom standar
    if (!guestName) {
      for (const [rawKey, rawVal] of entries) {
        const key = rawKey.trim().toLowerCase();
        const val = String(rawVal ?? '').trim();
        if (!val) continue;
        if (key === 'no' || key === 'no.' || /^\d+$/.test(val)) continue;
        guestName = val;
        break;
      }
    }

    if (guestName) {
      results.push({
        guestName,
        category: category || 'Tamu Undangan',
        phone,
      });
    }
  }

  if (results.length === 0) {
    throw new Error(
      'Tidak ditemukan kolom "Nama Tamu" yang valid. Gunakan template Excel yang tersedia.'
    );
  }

  return results;
}
