import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const q = request.nextUrl.searchParams.get('q') || '';

    if (q.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (q.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Search query is too long.' },
        { status: 400 }
      );
    }

    const pattern = `%${q}%`;

    // Run all queries in parallel
    const [
      { data: customers },
      { data: orders },
      { data: suppliers },
      { data: follow_ups },
      { data: documents },
    ] = await Promise.all([
      supabase.from('customers').select('*').or(`name.ilike.${pattern},phone.ilike.${pattern}`).limit(10),
      supabase.from('orders').select('*').or(`customer_name.ilike.${pattern},item.ilike.${pattern},order_id.ilike.${pattern}`).limit(10),
      supabase.from('suppliers').select('*').or(`supplier_name.ilike.${pattern},item.ilike.${pattern}`).limit(10),
      supabase.from('follow_ups').select('*').or(`title.ilike.${pattern},description.ilike.${pattern}`).limit(10),
      supabase.from('documents').select('id,file_name,file_type,structured,created_at').or(`file_name.ilike.${pattern},raw_text.ilike.${pattern}`).limit(5),
    ]);

    const results = {
      customers: customers || [],
      orders: orders || [],
      suppliers: suppliers || [],
      follow_ups: follow_ups || [],
      documents: documents || [],
    };

    const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    return NextResponse.json({
      success: true,
      query: q,
      results,
      total,
    });
  } catch (error) {
    console.error('[api/search] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
