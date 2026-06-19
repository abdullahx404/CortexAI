import type { ExtractionResult } from './csv';

export async function extractFromTxt(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const text = buffer.toString('utf-8').trim().slice(0, 50000);
    return {
      text,
      success: true,
      char_count: text.length,
    };
  } catch (err) {
    return {
      text: '',
      success: false,
      error: err instanceof Error ? err.message : 'TXT extraction failed',
      char_count: 0,
    };
  }
}
