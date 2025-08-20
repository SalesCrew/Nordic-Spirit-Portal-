export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { isSupabaseConfigured, supabaseBrowser } from '@/lib/supabase/client';
import { Event } from '@/types/db';
import { Suspense } from 'react';
import PhotoUpload from './photo-upload';
import ReportingForm from './reporting-form';

async function fetchEvent(id: string): Promise<Event | null> {
  try {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from('events')
      .select('id, name, cover_url, created_at, is_active')
      .eq('id', id)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = isSupabaseConfigured() ? await fetchEvent(params.id) : null;
  if (!event) return <div className="container-padded py-6">Event not found.</div>;
  return (
    <main className="container-padded py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-sm text-gray-500">← Back</Link>
        <h1 className="text-xl font-semibold">{event.name}</h1>
      </div>
      <div className="sticky top-0 z-10 bg-white">
        <nav className="flex gap-2 border-b border-border pb-2">
          <a href="#photos" className="btn-ghost text-sm">Photos</a>
          <a href="#reporting" className="btn-ghost text-sm">Reporting</a>
        </nav>
      </div>
      <section id="photos" className="py-4">
        <h2 className="text-lg font-medium mb-2">Upload photos</h2>
        <Suspense>
          <PhotoUpload eventId={event.id} />
        </Suspense>
      </section>
      <section id="reporting" className="py-4">
        <h2 className="text-lg font-medium mb-2">Workday reporting</h2>
        <Suspense>
          <ReportingForm eventId={event.id} />
        </Suspense>
      </section>
    </main>
  );
}


