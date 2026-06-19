import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ChatRequestSchema } from '@/lib/validation/schemas';
import { getQueryIntent, formatQueryResults } from '@/lib/gemini/chat';
import type { QueryIntent } from '@/lib/validation/schemas';

export const maxDuration = 60;

// Build a Supabase query from the intent
async function executeQuery(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  intent: QueryIntent
) {
  if (!intent.table) return [];

  let query = supabase.from(intent.table).select('*');

  // Apply filters
  if (intent.filters) {
    for (const [key, value] of Object.entries(intent.filters)) {
      if (key.endsWith('_eq')) {
        const col = key.replace('_eq', '');
        query = query.eq(col, value);
      } else if (key.endsWith('_ilike')) {
        const col = key.replace('_ilike', '');
        query = query.ilike(col, String(value));
      } else if (key.endsWith('_gt')) {
        const col = key.replace('_gt', '');
        query = query.gt(col, value);
      } else if (key.endsWith('_lt')) {
        const col = key.replace('_lt', '');
        query = query.lt(col, value);
      } else if (key.endsWith('_gte')) {
        const col = key.replace('_gte', '');
        query = query.gte(col, value);
      }
    }
  }

  // Apply ordering
  if (intent.order_by) {
    query = query.order(intent.order_by, { ascending: intent.direction !== 'desc' });
  }

  // Apply limit
  query = query.limit(intent.limit || 20);

  const { data, error } = await query;
  if (error) throw new Error(`Query failed: ${error.message}`);
  return data || [];
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Question must be between 1 and 500 characters.' },
        { status: 400 }
      );
    }

    const { question } = parsed.data;

    // Get query intent from Gemini
    const intentResult = await getQueryIntent(question);

    if (!intentResult.success) {
      return NextResponse.json(
        { success: false, error: intentResult.error },
        { status: 422 }
      );
    }

    if (intentResult.isOffTopic) {
      return NextResponse.json({
        success: true,
        answer: "I can only answer questions about your uploaded business data. Try asking about customers, orders, suppliers, or follow-ups.",
        table_used: null,
        record_count: 0,
      });
    }

    const intent = intentResult.intent!;

    // Execute the Supabase query
    let results: unknown[] = [];
    try {
      results = await executeQuery(supabase, intent);
    } catch (queryError) {
      console.error('[api/chat] Query execution failed:', queryError instanceof Error ? queryError.message : 'Unknown');
      return NextResponse.json(
        { success: false, error: 'Could not retrieve data. Please try again.' },
        { status: 500 }
      );
    }

    // Format results with Gemini
    const answer = await formatQueryResults(question, results, intent.table || 'records');

    return NextResponse.json({
      success: true,
      answer,
      table_used: intent.table,
      record_count: results.length,
    });
  } catch (error) {
    console.error('[api/chat] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
