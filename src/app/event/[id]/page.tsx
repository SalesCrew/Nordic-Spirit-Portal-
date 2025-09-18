export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { isSupabaseConfigured, supabaseBrowser } from '@/lib/supabase/client';
import { Event } from '@/types/db';
import { Suspense } from 'react';
import EventSwitcher from './switcher';

async function fetchEvent(id: string): Promise<Event | null> {
  try {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from('events')
      .select('id, name, cover_url, created_at, is_active')
      .eq('id', id)
      .single();
    return (data as Event) ?? null;
  } catch {
    return null;
  }
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = isSupabaseConfigured() ? await fetchEvent(params.id) : null;
  if (!event) return <div className="container-padded py-6">Event not found.</div>;
  return (
    <main className="container-padded py-6 flex flex-col items-center">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-sm text-gray-500">← Back</Link>
        <h1 className="text-xl font-semibold">{event.name}</h1>
      </div>
      <Suspense>
        <EventSwitcher eventId={event.id} />
      </Suspense>
    </main>
  );
}


