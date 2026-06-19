import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  extractText,
  getFileType,
  MAX_FILE_SIZE,
  MAX_FILES,
} from '@/lib/extraction';

export const maxDuration = 60; // seconds — needed for OCR

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided.' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, error: `You can upload a maximum of ${MAX_FILES} files at a time.` },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        results.push({
          file_name: file.name,
          success: false,
          error: `File too large. Maximum size is 10 MB.`,
        });
        continue;
      }

      // Validate file type
      const fileType = getFileType(file.name, file.type);
      if (!fileType) {
        results.push({
          file_name: file.name,
          success: false,
          error: `File type not supported. Please upload CSV, Excel, TXT, PDF, or image files.`,
        });
        continue;
      }

      try {
        // Read file into buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text
        const extraction = await extractText(buffer, fileType);

        // Save to documents table regardless of extraction success
        const { data: doc, error: dbError } = await supabase
          .from('documents')
          .insert({
            file_name: file.name,
            file_type: fileType,
            raw_text: extraction.text || null,
            structured: false,
          })
          .select()
          .single();

        if (dbError) {
          console.error('[api/upload] DB insert failed:', dbError.message);
          results.push({
            file_name: file.name,
            success: false,
            error: 'Failed to save file record. Please try again.',
          });
          continue;
        }

        results.push({
          file_name: file.name,
          document_id: doc.id,
          file_type: fileType,
          extracted_chars: extraction.char_count,
          extraction_success: extraction.success,
          extraction_error: extraction.error,
          status: extraction.success ? 'queued_for_structuring' : 'extraction_failed',
          success: true,
        });
      } catch {
        console.error('[api/upload] File processing error for type:', fileType);
        results.push({
          file_name: file.name,
          success: false,
          error: 'Failed to process this file. Please try again.',
        });
      }
    }

    return NextResponse.json({ success: true, files: results });
  } catch (error) {
    console.error('[api/upload] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
