import * as XLSX from 'xlsx';
import type { ExtractionResult } from './csv';

export async function extractFromExcel(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let text = '';

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];

      if (jsonData.length === 0) return;

      text += `Sheet: ${sheetName}\n`;

      // First row as headers
      const headers = jsonData[0]?.map(String) || [];
      const dataRows = jsonData.slice(1);

      if (headers.length > 0) {
        text += `Columns: ${headers.join(', ')}\n\n`;
      }

      dataRows.forEach((row, index) => {
        if (row.length === 0) return;
        const rowText = headers.length > 0
          ? headers.map((h, i) => `${h}: ${row[i] ?? ''}`).join(', ')
          : row.map(String).join(', ');
        text += `Record ${index + 1}: ${rowText}\n`;
      });

      text += '\n';
    });

    const trimmed = text.trim().slice(0, 50000);

    return {
      text: trimmed,
      success: true,
      char_count: trimmed.length,
    };
  } catch (err) {
    return {
      text: '',
      success: false,
      error: err instanceof Error ? err.message : 'Excel extraction failed',
      char_count: 0,
    };
  }
}
