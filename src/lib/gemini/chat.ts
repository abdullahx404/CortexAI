import { geminiFlash } from './client';
import { QueryIntentSchema, type QueryIntent } from '@/lib/validation/schemas';

const CHAT_SYSTEM_PROMPT = `You are a business data assistant for CortexAI. You answer questions ONLY about business data stored in the database.

DATABASE SCHEMA:
- customers: id, name, phone, amount_owed (number), last_order (date), status ("active"|"inactive"|"pending")
- orders: id, order_id, customer_name, item, quantity (number), due_date (date), status ("pending"|"completed"|"overdue")
- suppliers: id, supplier_name, item, unit_price (number), lead_time
- follow_ups: id, type ("payment"|"order"|"customer"|"supplier"), title, description, due_date (date), status ("pending"|"done")
- documents: id, file_name, file_type, structured (boolean)

RULES:
1. ONLY answer questions about data in the above tables
2. For ANY other question (general knowledge, jokes, unrelated topics), respond with EXACTLY: {"intent":"off_topic"}
3. Return a structured query intent as JSON — no other text, no markdown
4. Do not fabricate data — only query what exists
5. For "owe money" or "pending payments": customers WHERE amount_owed > 0
6. For "overdue": orders WHERE status = "overdue"
7. For "pending orders": orders WHERE status = "pending"
8. For "cheapest supplier": suppliers WHERE item contains the item name, ORDER BY unit_price ASC
9. For name searches (like "Ahmed"): filter by customer_name ILIKE or name ILIKE

QUERY INTENT FORMAT (return only this JSON, no other text):
{
  "intent": "query",
  "table": "customers" | "orders" | "suppliers" | "follow_ups" | "documents",
  "filters": {
    "column_eq": "value",
    "column_ilike": "%value%",
    "column_gt": 0,
    "column_lt": 0,
    "column_gte": 0
  },
  "order_by": "column_name",
  "direction": "asc" | "desc",
  "limit": 20
}

For off-topic:
{"intent":"off_topic"}`;

const FORMAT_SYSTEM_PROMPT = `You are a friendly business data assistant. Format the provided database query results into a clear, concise, human-readable answer.

Rules:
- Be direct and specific with numbers, names, and dates
- If the result is a list, format it as a numbered list
- If no data was found, say "No matching records found"
- Keep the answer under 200 words
- Do not add advice or recommendations — just present the data
- For amounts, format as currency (e.g., "$1,200")
- For dates, use readable format (e.g., "June 14, 2025")`;

function stripMarkdown(text: string): string {
  return text
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim();
}

async function callGeminiWithRetry(prompt: string, systemPrompt: string, maxRetries = 2): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await geminiFlash.generateContent([
        { text: systemPrompt },
        { text: prompt },
      ]);
      return result.response.text();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Gemini call failed');
      const isRetryable = lastError.message.includes('429') || lastError.message.includes('500') || lastError.message.includes('503');
      if (isRetryable && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      break;
    }
  }
  throw lastError || new Error('Gemini chat failed');
}

export interface ChatQueryResult {
  success: boolean;
  intent?: QueryIntent;
  error?: string;
  isOffTopic?: boolean;
}

export async function getQueryIntent(question: string): Promise<ChatQueryResult> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-gemini-key') {
    return { success: false, error: 'AI assistant is not configured. Please add your GEMINI_API_KEY.' };
  }

  try {
    const rawResponse = await callGeminiWithRetry(question, CHAT_SYSTEM_PROMPT);
    const cleaned = stripMarkdown(rawResponse);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return { success: false, error: 'Could not understand that question. Please try rephrasing.' };
    }

    const validated = QueryIntentSchema.safeParse(parsed);
    if (!validated.success) {
      return { success: false, error: 'Could not process that question. Please try a different phrasing.' };
    }

    if (validated.data.intent === 'off_topic') {
      return { success: true, isOffTopic: true };
    }

    return { success: true, intent: validated.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isRateLimit = message.includes('429') || message.includes('RESOURCE_EXHAUSTED');
    return {
      success: false,
      error: isRateLimit
        ? 'The AI service is busy. Please wait a moment and try again.'
        : 'Something went wrong. Please try again.',
    };
  }
}

export async function formatQueryResults(question: string, results: unknown[], tableName: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-gemini-key') {
    return JSON.stringify(results, null, 2);
  }

  if (results.length === 0) {
    return 'No matching records found for your question.';
  }

  try {
    const prompt = `User asked: "${question}"\n\nQuery was run on the "${tableName}" table.\n\nResults (${results.length} records):\n${JSON.stringify(results, null, 2)}\n\nFormat this as a clear, direct answer:`;
    const response = await callGeminiWithRetry(prompt, FORMAT_SYSTEM_PROMPT);
    return response.trim();
  } catch {
    // Fallback: format as simple list
    return `Found ${results.length} record(s) in ${tableName}.`;
  }
}
