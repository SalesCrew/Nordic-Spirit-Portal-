export const dynamic = 'force-dynamic';
import EventCard from '@/components/EventCard';
import { isSupabaseConfigured, supabaseBrowser } from '@/lib/supabase/client';
import { Event } from '@/types/db';

async function fetchEvents(): Promise<Event[]> {
  try {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from('events')
      .select('id, name, cover_url, created_at, is_active')
      .order('created_at', { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const events = isSupabaseConfigured() ? await fetchEvents() : [];
  return (
    <main className="container-padded py-6">
      {events.length === 0 ? (
        <div className="text-center text-gray-500 pt-32">No events available yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {events
            .filter((ev) => ev.name.toLowerCase() !== 'temp')
            .map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </main>
  );
}


