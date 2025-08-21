"use client";
import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type Photo = { id: string; event_id: string; storage_path: string; created_at: string };
type Event = { id: string; name: string };

export default function PhotoList() {
  const supabase = supabaseBrowser();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: e }] = await Promise.all([
        supabase.from('photos').select('id, event_id, storage_path, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('events').select('id, name')
      ]);
      setPhotos(p ?? []);
      setEvents(e ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  const eventIdToName = useMemo(() => new Map(events.map((ev) => [ev.id, ev.name])), [events]);
  const visible = useMemo(() => (eventFilter === 'all' ? photos : photos.filter((p) => p.event_id === eventFilter)), [photos, eventFilter]);

  function publicUrl(path: string) {
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  }

  function onDownloadJson() {
    const payload = visible.map((p) => ({ ...p, url: publicUrl(p.storage_path), event_name: eventIdToName.get(p.event_id) }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photos.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Photos</h2>
        <div className="flex items-center gap-2">
          <select className="input clean-dropdown" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">All events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
          <button className="btn-ghost" onClick={onDownloadJson}>Download JSON</button>
        </div>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : visible.length === 0 ? (
        <div className="text-gray-500">No photos yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {visible.map((p) => {
            const url = publicUrl(p.storage_path);
            const title = eventIdToName.get(p.event_id) ?? p.event_id;
            return (
              <a key={p.id} href={url} download className="block relative aspect-square bg-muted rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={title} className="object-cover w-full h-full" />
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}


