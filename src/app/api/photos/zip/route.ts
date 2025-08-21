import { NextRequest } from 'next/server';
import JSZip from 'jszip';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) return new Response('eventId is required', { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(url, key);

    let page = 0;
    const pageSize = 100;
    const zip = new JSZip();

    // List all storage objects under prefix `${eventId}/`
    while (true) {
      const { data, error } = await supabase.storage.from('photos').list(eventId + '/', { limit: pageSize, offset: page * pageSize });
      if (error) throw error;
      const files = data ?? [];
      for (const f of files) {
        if (f.name.endsWith('/')) continue;
        const path = `${eventId}/${f.name}`;
        const { data: fileData, error: dlErr } = await supabase.storage.from('photos').download(path);
        if (dlErr) continue;
        const arrayBuffer = await fileData.arrayBuffer();
        zip.file(f.name, arrayBuffer);
      }
      if (files.length < pageSize) break;
      page++;
    }

    const content = await zip.generateAsync({ type: 'uint8array' });
    const blob = new Blob([content], { type: 'application/zip' });
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${eventId}.zip"`
      }
    });
  } catch (e: any) {
    return new Response(e?.message ?? 'Server error', { status: 500 });
  }
}


