import type { ExtractionResult } from './csv';

const OCR_TIMEOUT_MS = 30000;

export async function extractFromImage(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');

    const timeoutPromise = new Promise<ExtractionResult>((resolve) => {
      setTimeout(() => {
        resolve({
          text: '',
          success: false,
          error: 'Image processing timed out. Please try a smaller or clearer image.',
          char_count: 0,
        });
      }, OCR_TIMEOUT_MS);
    });

    const ocrPromise = (async (): Promise<ExtractionResult> => {
      try {
        const { data } = await worker.recognize(buffer);
        await worker.terminate();

        const text = data.text.trim().slice(0, 50000);

        if (!text) {
          return {
            text: '',
            success: false,
            error: 'No readable text found in this image. Try a clearer or higher-resolution image.',
            char_count: 0,
          };
        }

        return {
          text,
          success: true,
          char_count: text.length,
        };
      } catch (err) {
        await worker.terminate().catch(() => {});
        return {
          text: '',
          success: false,
          error: err instanceof Error ? err.message : 'OCR extraction failed',
          char_count: 0,
        };
      }
    })();

    return Promise.race([ocrPromise, timeoutPromise]);
  } catch (err) {
    return {
      text: '',
      success: false,
      error: err instanceof Error ? err.message : 'Image extraction failed',
      char_count: 0,
    };
  }
}
