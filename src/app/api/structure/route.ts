import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { structureText } from '@/lib/gemini/structure';
import { StructureRequestSchema } from '@/lib/validation/schemas';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const parsed = StructureRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: document_id is required.' },
        { status: 400 }
      );
    }

    const { document_id } = parsed.data;

    // Fetch raw text from documents table
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('id, raw_text, file_name')
      .eq('id', document_id)
      .single();

    if (fetchError || !doc) {
      return NextResponse.json(
        { success: false, error: 'Document not found.' },
        { status: 404 }
      );
    }

    if (!doc.raw_text) {
      // No text to structure — mark as done with 0 records
      await supabase
        .from('documents')
        .update({ structured: true })
        .eq('id', document_id);

      return NextResponse.json({
        success: true,
        document_id,
        inserted: { customers: 0, orders: 0, suppliers: 0, follow_ups: 0 },
        message: 'No text content to structure.',
      });
    }

    console.warn(`[api/structure] Starting Gemini structuring for document_id: ${document_id}`);

    // Call Gemini structuring
    const structureResult = await structureText(doc.raw_text);

    if (!structureResult.success || !structureResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: structureResult.error || 'AI structuring failed.',
          document_id,
        },
        { status: 422 }
      );
    }

    const { customers, orders, suppliers, follow_ups } = structureResult.data;
    const inserted = { customers: 0, orders: 0, suppliers: 0, follow_ups: 0 };

    // Upsert customers
    if (customers.length > 0) {
      const { error } = await supabase
        .from('customers')
        .upsert(customers, { onConflict: 'name', ignoreDuplicates: false });
      if (error) {
        console.error('[api/structure] Customers upsert failed:', error.message);
      } else {
        inserted.customers = customers.length;
      }
    }

    // Upsert orders (use order_id as conflict key when available, otherwise insert)
    if (orders.length > 0) {
      // Orders without order_id just get inserted
      const ordersWithId = orders.filter((o) => o.order_id);
      const ordersWithoutId = orders.filter((o) => !o.order_id);

      if (ordersWithId.length > 0) {
        const { error } = await supabase
          .from('orders')
          .upsert(ordersWithId, { onConflict: 'order_id', ignoreDuplicates: false });
        if (!error) inserted.orders += ordersWithId.length;
        else console.error('[api/structure] Orders upsert (with id) failed:', error.message);
      }

      if (ordersWithoutId.length > 0) {
        const { error } = await supabase.from('orders').insert(ordersWithoutId);
        if (!error) inserted.orders += ordersWithoutId.length;
        else console.error('[api/structure] Orders insert (no id) failed:', error.message);
      }
    }

    // Upsert suppliers
    if (suppliers.length > 0) {
      const { error } = await supabase
        .from('suppliers')
        .upsert(suppliers, { onConflict: 'supplier_name,item', ignoreDuplicates: false });
      if (error) {
        console.error('[api/structure] Suppliers upsert failed:', error.message);
        // Fallback: insert without conflict check
        const { error: insertError } = await supabase.from('suppliers').insert(suppliers);
        if (!insertError) inserted.suppliers = suppliers.length;
      } else {
        inserted.suppliers = suppliers.length;
      }
    }

    // Insert follow_ups (always insert, don't deduplicate)
    if (follow_ups.length > 0) {
      const { error } = await supabase.from('follow_ups').insert(follow_ups);
      if (error) {
        console.error('[api/structure] Follow_ups insert failed:', error.message);
      } else {
        inserted.follow_ups = follow_ups.length;
      }
    }

    // Mark document as structured
    await supabase
      .from('documents')
      .update({ structured: true })
      .eq('id', document_id);

    console.warn(`[api/structure] Complete: customers=${inserted.customers}, orders=${inserted.orders}, suppliers=${inserted.suppliers}, follow_ups=${inserted.follow_ups}`);

    return NextResponse.json({
      success: true,
      document_id,
      inserted,
    });
  } catch (error) {
    console.error('[api/structure] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
