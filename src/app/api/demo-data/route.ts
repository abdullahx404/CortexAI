import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DemoDataRequestSchema } from '@/lib/validation/schemas';
import {
  DEMO_CUSTOMERS,
  DEMO_ORDERS,
  DEMO_SUPPLIERS,
  DEMO_FOLLOW_UPS,
  DEMO_DOCUMENTS,
} from '@/lib/demo/data';

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
    const parsed = DemoDataRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request.' },
        { status: 400 }
      );
    }

    const { clear_existing } = parsed.data;

    // Clear existing data if requested
    if (clear_existing) {
      const tables = ['follow_ups', 'orders', 'customers', 'suppliers', 'documents'] as const;
      for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.error(`[api/demo-data] Clear ${table} failed:`, error.message);
        }
      }
    }

    const inserted = { customers: 0, orders: 0, suppliers: 0, follow_ups: 0, documents: 0 };

    // Insert customers
    const { error: custErr } = await supabase.from('customers').insert(DEMO_CUSTOMERS);
    if (!custErr) inserted.customers = DEMO_CUSTOMERS.length;
    else console.error('[api/demo-data] Customers insert failed:', custErr.message);

    // Insert orders
    const { error: ordErr } = await supabase.from('orders').insert(DEMO_ORDERS);
    if (!ordErr) inserted.orders = DEMO_ORDERS.length;
    else console.error('[api/demo-data] Orders insert failed:', ordErr.message);

    // Insert suppliers
    const { error: supErr } = await supabase.from('suppliers').insert(DEMO_SUPPLIERS);
    if (!supErr) inserted.suppliers = DEMO_SUPPLIERS.length;
    else console.error('[api/demo-data] Suppliers insert failed:', supErr.message);

    // Insert follow_ups
    const { error: fuErr } = await supabase.from('follow_ups').insert(DEMO_FOLLOW_UPS);
    if (!fuErr) inserted.follow_ups = DEMO_FOLLOW_UPS.length;
    else console.error('[api/demo-data] Follow_ups insert failed:', fuErr.message);

    // Insert documents
    const { error: docErr } = await supabase.from('documents').insert(DEMO_DOCUMENTS);
    if (!docErr) inserted.documents = DEMO_DOCUMENTS.length;
    else console.error('[api/demo-data] Documents insert failed:', docErr.message);

    return NextResponse.json({ success: true, inserted });
  } catch (error) {
    console.error('[api/demo-data] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
