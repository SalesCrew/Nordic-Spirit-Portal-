"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type Photo = { id: string; event_id: string; storage_path: string; created_at: string };
type Event = { id: string; name: string };

export default function PhotoList() {
  const supabase = supabaseBrowser();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  function onDownloadZip() {
    if (eventFilter === 'all') return;
    window.location.href = `/api/photos/zip?eventId=${eventFilter}`;
  }

  const currentLabel = eventFilter === 'all' ? 'All events' : (eventIdToName.get(eventFilter) ?? 'Event');

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current && menuRef.current.contains(t)) return;
      if (btnRef.current && btnRef.current.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Photos</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              className="input w-56 flex items-center justify-between cursor-pointer"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="truncate">{currentLabel}</span>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="ml-2 text-gray-500">
                <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {open && (
              <div ref={menuRef} className="absolute right-0 top-full mt-1 z-50 bg-white rounded-md shadow-[0_2px_16px_rgba(0,0,0,0.08)] overflow-hidden w-56">
                <div
                  role="button"
                  className="px-3 py-2 text-sm hover:bg-gradient-to-r hover:from-[#2B91FF]/50 hover:to-[#0047FF]/50"
                  onClick={() => { setEventFilter('all'); setOpen(false); }}
                >
                  All events
                </div>
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    role="button"
                    className="px-3 py-2 text-sm hover:bg-gradient-to-r hover:from-[#2B91FF]/50 hover:to-[#0047FF]/50"
                    onClick={() => { setEventFilter(ev.id); setOpen(false); }}
                  >
                    {ev.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className={`btn-ghost ${eventFilter === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={onDownloadZip} disabled={eventFilter === 'all'}>
            Download ZIP
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : visible.length === 0 ? (
        <div className="text-gray-500">No photos yet.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
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


