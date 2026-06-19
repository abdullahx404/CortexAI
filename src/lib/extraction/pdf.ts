import type { ExtractionResult } from './csv';

export async function extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Dynamic import to avoid edge runtime issues
    // pdf-parse exports as CJS default export
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      return {
        text: '',
        success: false,
        error: 'This PDF appears to be image-based. Try uploading the image directly as JPG/PNG.',
        char_count: 0,
      };
    }

    const text = data.text.trim().slice(0, 50000);
    return {
      text,
      success: true,
      char_count: text.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PDF extraction failed';
    const isEncrypted = message.toLowerCase().includes('encrypt') || message.toLowerCase().includes('password');
    return {
      text: '',
      success: false,
      error: isEncrypted
        ? 'This PDF is password-protected and cannot be read.'
        : 'PDF parsing failed. Try a different file.',
      char_count: 0,
    };
  }
}
