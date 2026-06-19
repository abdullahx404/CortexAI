import Papa from 'papaparse';

export interface ExtractionResult {
  text: string;
  success: boolean;
  error?: string;
  char_count: number;
}

export async function extractFromCsv(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const content = buffer.toString('utf-8');
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      return {
        text: '',
        success: false,
        error: 'CSV parsing failed: ' + result.errors[0].message,
        char_count: 0,
      };
    }

    // Convert to a readable text representation
    const headers = result.meta.fields || [];
    const rows = result.data as Record<string, string>[];

    let text = `CSV Data with ${rows.length} records\nColumns: ${headers.join(', ')}\n\n`;

    rows.forEach((row, index) => {
      const rowText = headers
        .map((h) => `${h}: ${row[h] ?? ''}`)
        .join(', ');
      text += `Record ${index + 1}: ${rowText}\n`;
    });

    return {
      text: text.slice(0, 50000), // cap at 50k chars
      success: true,
      char_count: text.length,
    };
  } catch (err) {
    return {
      text: '',
      success: false,
      error: err instanceof Error ? err.message : 'CSV extraction failed',
      char_count: 0,
    };
  }
}
