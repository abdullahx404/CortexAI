import type { ExtractionResult } from './csv';
import { extractFromCsv } from './csv';
import { extractFromExcel } from './excel';
import { extractFromTxt } from './txt';
import { extractFromPdf } from './pdf';
import { extractFromImage } from './image';

export type { ExtractionResult };

export type AllowedFileType = 'csv' | 'xlsx' | 'xls' | 'txt' | 'pdf' | 'jpg' | 'jpeg' | 'png';

export const ALLOWED_EXTENSIONS: AllowedFileType[] = [
  'csv', 'xlsx', 'xls', 'txt', 'pdf', 'jpg', 'jpeg', 'png',
];

export const ALLOWED_MIME_TYPES: Record<string, AllowedFileType> = {
  'text/csv': 'csv',
  'application/csv': 'csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_FILES = 5;

export function getFileType(filename: string, mimeType: string): AllowedFileType | null {
  // Check MIME first
  const mimeMatch = ALLOWED_MIME_TYPES[mimeType];
  if (mimeMatch) return mimeMatch;

  // Fallback to extension
  const ext = filename.split('.').pop()?.toLowerCase() as AllowedFileType;
  if (ALLOWED_EXTENSIONS.includes(ext)) return ext;

  return null;
}

export async function extractText(
  buffer: Buffer,
  fileType: AllowedFileType
): Promise<ExtractionResult> {
  switch (fileType) {
    case 'csv':
      return extractFromCsv(buffer);
    case 'xlsx':
    case 'xls':
      return extractFromExcel(buffer);
    case 'txt':
      return extractFromTxt(buffer);
    case 'pdf':
      return extractFromPdf(buffer);
    case 'jpg':
    case 'jpeg':
    case 'png':
      return extractFromImage(buffer);
    default:
      return {
        text: '',
        success: false,
        error: 'Unsupported file type',
        char_count: 0,
      };
  }
}
