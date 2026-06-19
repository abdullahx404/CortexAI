import { geminiFlash } from './client';
import { GeminiResponseSchema, type GeminiResponse } from '@/lib/validation/schemas';

const STRUCTURE_SYSTEM_PROMPT = `You are a business data extraction assistant for CortexAI.

Your job is to extract structured business data from extracted text of uploaded business files and return it as valid JSON.

DATABASE SCHEMA:
- customers: { name (text, required), phone (text, optional), amount_owed (number >= 0, default 0), last_order (date as YYYY-MM-DD, optional), status ("active" | "inactive" | "pending", default "active") }
- orders: { order_id (text, optional), customer_name (text, required), item (text, required), quantity (number >= 0, default 1), due_date (date as YYYY-MM-DD, optional), status ("pending" | "completed" | "overdue", default "pending") }
- suppliers: { supplier_name (text, required), item (text, required), unit_price (number >= 0, required), lead_time (text, optional) }
- follow_ups: { type ("payment" | "order" | "customer" | "supplier", required), title (text, required), description (text, optional), due_date (date as YYYY-MM-DD, optional), status ("pending" | "done", default "pending") }

RULES:
1. Extract ONLY data that is actually present in the provided text
2. Do NOT invent, guess, or hallucinate any values
3. If a field cannot be determined from the text, omit it or use null
4. Dates must be in YYYY-MM-DD format
5. Amounts must be numbers (no currency symbols, no commas — just the number)
6. Return ONLY valid JSON — no markdown code blocks, no explanations, no preamble text
7. If the text contains no recognizable business data, return all empty arrays
8. Handle non-standard column orders intelligently based on context clues
9. If status cannot be determined for an order, default to "pending"
10. If amount_owed cannot be determined for a customer, default to 0
11. For meeting notes/free text: extract any mentioned customers, orders, suppliers as structured data, and create follow_ups for action items mentioned

RETURN FORMAT (exact JSON, no other text):
{"customers":[],"orders":[],"suppliers":[],"follow_ups":[]}`;

function stripMarkdown(text: string): string {
  // Strip markdown code fences that Gemini sometimes adds
  return text
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim();
}

async function callGeminiWithRetry(prompt: string, maxRetries = 2): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await geminiFlash.generateContent([
        { text: STRUCTURE_SYSTEM_PROMPT },
        { text: `The following is extracted text from an uploaded business file. Extract business data from it:\n---\n${prompt}\n---` },
      ]);

      const response = result.response.text();
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Gemini call failed');

      const isRateLimit = lastError.message.includes('429') || lastError.message.includes('RESOURCE_EXHAUSTED');
      const isServerError = lastError.message.includes('500') || lastError.message.includes('503');

      if ((isRateLimit || isServerError) && attempt < maxRetries) {
        console.warn(`[gemini/structure] Attempt ${attempt + 1} failed, retrying in 2s...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      break;
    }
  }

  throw lastError || new Error('Gemini structuring failed after retries');
}

export interface StructureResult {
  success: boolean;
  data?: GeminiResponse;
  error?: string;
  raw_response?: string;
}

export async function structureText(rawText: string): Promise<StructureResult> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'not-configured' || process.env.GEMINI_API_KEY === 'placeholder-gemini-key') {
    return {
      success: false,
      error: 'AI structuring is not configured. Please add your GEMINI_API_KEY.',
    };
  }

  if (!rawText || rawText.trim().length === 0) {
    return {
      success: true,
      data: { customers: [], orders: [], suppliers: [], follow_ups: [] },
    };
  }

  try {
    const rawResponse = await callGeminiWithRetry(rawText);
    const cleaned = stripMarkdown(rawResponse);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[gemini/structure] JSON parse failed. Raw response snippet:', cleaned.slice(0, 200));
      return {
        success: false,
        error: 'AI returned invalid data format. Raw text has been saved.',
        raw_response: cleaned,
      };
    }

    const validated = GeminiResponseSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('[gemini/structure] Zod validation failed:', validated.error.issues.map(i => i.message).join(', '));
      return {
        success: false,
        error: 'AI returned unexpected data structure. Raw text has been saved.',
        raw_response: cleaned,
      };
    }

    return {
      success: true,
      data: validated.data,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isRateLimit = message.includes('429') || message.includes('RESOURCE_EXHAUSTED');

    return {
      success: false,
      error: isRateLimit
        ? 'The AI service is busy. Please wait a moment and try again.'
        : 'AI structuring failed. Raw text has been saved.',
    };
  }
}
