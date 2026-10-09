import React, { useState, useRef } from 'react';
import {
  Sparkles,
  X,
  Check,
  ArrowRight,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  Upload,
  Copy,
  ClipboardCheck,
} from 'lucide-react';
import {
  parseInvitationWithAi,
  ParsedInvitationAiResult,
} from '../../../services/aiSetupAssistant';
import {
  SAMPLE_GFORM_RESPONSE,
  SAMPLE_SPREADSHEET_ROW,
  GFORM_STANDARD_QUESTIONS,
  CLIENT_WHATSAPP_GFORM_PROMPT,
} from '../../../data/gformOperationalTemplates';
import { AiSetupReviewPanel } from './AiSetupReviewPanel';

export interface ApplyAiSetupOptions {
  applyMedia: boolean;
}

import { safeCopyToClipboard } from '../../../utils/clipboardUtils';

interface AiSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (data: ParsedInvitationAiResult, options?: ApplyAiSetupOptions) => void;
}

type InputMode = 'paste_gform' | 'upload_csv' | 'gform_guide';

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export const AiSetupModal: React.FC<AiSetupModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('paste_gform');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedInvitationAiResult | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [applyMedia, setApplyMedia] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [selectedRowIdx, setSelectedRowIdx] = useState<number>(0);

  if (!isOpen) return null;

  const handleCopyText = (key: string, textToCopy: string) => {
    safeCopyToClipboard(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setErrorMsg('File CSV/TSV harus memiliki minimal baris header dan 1 baris respons klien.');
        return;
      }

      const delimiter = lines[0].includes('\t') ? '\t' : ',';
      const headers = splitDelimitedLine(lines[0], delimiter);
      const dataRows = lines.slice(1).map((line) => splitDelimitedLine(line, delimiter));

      setCsvHeaders(headers);
      setCsvRows(dataRows);
      const lastIdx = dataRows.length - 1;
      setSelectedRowIdx(lastIdx);

      const targetRow = dataRows[lastIdx];
      const formattedPairs = headers
        .map((h, idx) => `${h}: ${targetRow[idx] || '-'}`)
        .join('\n');
      setRawText(formattedPairs);
      setErrorMsg('');
    };
    reader.readAsText(file);
  };

  const handleSelectCsvRow = (rowIdx: number) => {
    setSelectedRowIdx(rowIdx);
    const targetRow = csvRows[rowIdx];
    if (!targetRow) return;
    const formattedPairs = csvHeaders
      .map((h, idx) => `${h}: ${targetRow[idx] || '-'}`)
      .join('\n');
    setRawText(formattedPairs);
  };

  const handleExtract = async () => {
    if (!rawText.trim()) {
      setErrorMsg('Silakan tempelkan respons Google Form / baris Google Sheets atau unggah file CSV terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setStatusMessage('');

    try {
      let textToProcess = rawText.trim();
      const lines = textToProcess.split(/\r?\n/).filter(Boolean);
      if (lines.length === 2 && lines[0].includes('\t') && lines[1].includes('\t')) {
        const headers = lines[0].split('\t');
        const values = lines[1].split('\t');
        const paired = headers
          .map((h, i) => `${h.trim()}: ${(values[i] || '').trim()}`)
          .join('\n');
        textToProcess = `${paired}\n\nRaw:\n${textToProcess}`;
      }

      const res = await parseInvitationWithAi(textToProcess);
      if (res.success && res.data) {
        setParsedResult(res.data);
        setStatusMessage(res.message || 'Data & media Google Form berhasil diekstrak.');
      } else {
        setErrorMsg('Tidak dapat mengekstrak data dari respons GForm yang diberikan.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat memproses data Google Form dengan AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (parsedResult) {
      onApplyParsedData(parsedResult, { applyMedia });
      onClose();
    }
  };

  const detectedMediaCount = parsedResult?.media
    ? (parsedResult.media.heroImage ? 1 : 0) +
      (parsedResult.media.bridePortrait ? 1 : 0) +
      (parsedResult.media.groomPortrait ? 1 : 0) +
      (parsedResult.media.qrisImageUrl ? 1 : 0) +
      (parsedResult.media.galleryImages?.length || 0) +
      (parsedResult.media.filmstripImages?.length || 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141413] flex items-center justify-center text-[#C5A880] shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-stone-900">
                AI Setup Operasional — Impor Data &amp; Media Google Form (GForm)
              </h3>
              <p className="text-[11px] text-stone-500">
                Ekstrak otomatis seluruh isian Google Form klien beserta link upload foto Google Drive langsung ke slot template.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {!parsedResult && (
          <div className="px-6 pt-3 pb-2 bg-[#FAF7F2]/60 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setInputMode('paste_gform')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                inputMode === 'paste_gform'
                  ? 'bg-[#141413] text-[#FAF8F3]'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              1. Tempel Respons GForm / Baris Sheets
            </button>
            <button
              type="button"
              onClick={() => setInputMode('upload_csv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                inputMode === 'upload_csv'
                  ? 'bg-[#141413] text-[#FAF8F3]'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              2. Unggah File CSV / TSV GForm
            </button>
            <button
              type="button"
              onClick={() => setInputMode('gform_guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                inputMode === 'gform_guide'
                  ? 'bg-[#141413] text-[#FAF8F3]'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              3. Standar Pertanyaan GForm &amp; Pesan Klien
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-left">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!parsedResult ? (
            <>
              {inputMode === 'paste_gform' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Tempel Ringkasan Respons Google Form atau Baris Google Sheets:</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRawText(SAMPLE_GFORM_RESPONSE);
                          setErrorMsg('');
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#C5A880]/50 text-stone-800 hover:bg-[#F3EAD9] font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Contoh Respons GForm + Media
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRawText(SAMPLE_SPREADSHEET_ROW);
                          setErrorMsg('');
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Contoh Baris Spreadsheet
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={9}
                    placeholder="Tempel seluruh isi respons Google Form klien (termasuk link upload foto Google Drive) atau salin langsung Header + Baris dari Google Sheets..."
                    className="w-full p-3.5 rounded-xl border border-stone-200 font-mono text-xs focus:ring-2 focus:ring-[#C5A880]/50 outline-none bg-stone-50/60 resize-y leading-relaxed text-stone-800"
                  />

                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl text-[11px] text-stone-600 space-y-1.5">
                    <p className="font-bold text-stone-900">
                      Alur Kerja Operasional Google Form + Media:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong>Data Teks Lengkap:</strong> AI otomatis memetakan Nama Panggilan, Nama Lengkap &amp; Gelar, Orang Tua, Instagram, Jadwal Akad &amp; Resepsi, Google Maps, Rekening 1 &amp; 2, Lagu, hingga Kutipan.
                      </li>
                      <li>
                        <strong>Otomatisasi Link Upload Foto GForm:</strong> Tautan file Google Drive dari pertanyaan <em>File Upload</em> di GForm (<span className="font-mono text-[10px]">drive.google.com/open?id=...</span>) otomatis dikonversi menjadi gambar langsung untuk <strong>Foto Hero, Potret Wanita, Potret Pria, Galeri Multi-Foto, Filmstrip, &amp; QRIS</strong>.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {inputMode === 'upload_csv' && (
                <div className="space-y-4">
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv,.tsv,text/csv,text/tab-separated-values"
                    onChange={handleCsvFileUpload}
                    className="hidden"
                  />

                  <div className="p-6 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50/70 text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#C5A880]/40 flex items-center justify-center mx-auto text-[#C5A880]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        Unggah File CSV / TSV dari Google Form atau Google Sheets
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Unduh respons dari Google Sheets (File &rarr; Download &rarr; Comma Separated Values .csv) lalu pilih klien yang ingin diproses.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => csvInputRef.current?.click()}
                      className="px-4 py-2 bg-[#141413] hover:bg-stone-800 text-[#FAF8F3] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Pilih File .CSV / .TSV</span>
                    </button>
                  </div>

                  {csvRows.length > 0 && (
                    <div className="space-y-2 p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl">
                      <label className="block text-xs font-bold text-stone-800">
                        Pilih Baris Respons Klien dari CSV ({csvRows.length} data ditemukan):
                      </label>
                      <select
                        value={selectedRowIdx}
                        onChange={(e) => handleSelectCsvRow(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900"
                      >
                        {csvRows.map((row, idx) => (
                          <option key={idx} value={idx}>
                            Baris #{idx + 1} — {row.slice(0, 4).filter(Boolean).join(' · ')}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-stone-500">
                        Data baris terpilih telah dimuat. Klik tombol <strong>Ekstrak Data &amp; Media GForm</strong> di kanan bawah untuk memproses.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {inputMode === 'gform_guide' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">
                          A. Pesan Pengantar Link Google Form untuk WhatsApp Klien
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Kirimkan pesan ini ke klien setelah pemesanan agar klien mengisi seluruh data &amp; mengunggah foto di GForm.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText('wa_prompt', CLIENT_WHATSAPP_GFORM_PROMPT)}
                        className="px-3 py-1.5 bg-[#141413] hover:bg-stone-800 text-[#FAF8F3] rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {copiedKey === 'wa_prompt' ? (
                          <>
                            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Salin Pesan WA</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-white border border-stone-200 rounded-lg text-[11px] font-mono text-stone-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {CLIENT_WHATSAPP_GFORM_PROMPT}
                    </pre>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">
                          B. Daftar Kolom &amp; Pertanyaan Standar Google Form (Termasuk Upload Media)
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Struktur pertanyaan GForm yang direkomendasikan agar AI langsung mengenali setiap kolom teks dan slot foto.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText('gform_questions', GFORM_STANDARD_QUESTIONS)}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {copiedKey === 'gform_questions' ? (
                          <>
                            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Salin Struktur GForm</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-white border border-stone-200 rounded-lg text-[11px] font-mono text-stone-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {GFORM_STANDARD_QUESTIONS}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <AiSetupReviewPanel
              parsedResult={parsedResult}
              statusMessage={statusMessage}
              detectedMediaCount={detectedMediaCount}
              applyMedia={applyMedia}
              onToggleApplyMedia={setApplyMedia}
              onResetResult={() => setParsedResult(null)}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {!parsedResult ? (
            inputMode !== 'gform_guide' && (
              <button
                type="button"
                onClick={handleExtract}
                disabled={isLoading || !rawText.trim()}
                className="bg-[#141413] hover:bg-[#2C2E28] disabled:opacity-50 text-[#FAF8F3] px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                    <span>Mengekstrak Data &amp; Media GForm...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Ekstrak Data &amp; Media GForm</span>
                  </>
                )}
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="bg-[#C5A880] hover:bg-[#B39369] text-[#141413] px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
              <span>
                Terapkan Data {applyMedia && detectedMediaCount > 0 ? `& ${detectedMediaCount} Media ` : ''}ke Undangan
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
