"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabaseBrowser } from '@/lib/supabase/client';
import { logoutCustomer } from '@/lib/customer-auth';
import { Event } from '@/types/db';

async function fetchAcceptedEvents(): Promise<Event[]> {
  try {
    const supabase = supabaseBrowser();
    
    // Get events that have accepted photos or reportings
    const [{ data: photoEventIds }, { data: reportingEventIds }] = await Promise.all([
      supabase.from('accepted_photos').select('event_id'),
      supabase.from('accepted_reportings').select('event_id')
    ]);
    
    const allEventIds = [
      ...(photoEventIds ?? []).map(item => item.event_id),
      ...(reportingEventIds ?? []).map(item => item.event_id)
    ];
    
    if (allEventIds.length === 0) return [];
    
    const uniqueEventIds = [...new Set(allEventIds)];
    
    const { data: events } = await supabase
      .from('events')
      .select('id, name, cover_url, created_at, is_active')
      .in('id', uniqueEventIds)
      .order('created_at', { ascending: false });
    
    return (events as Event[]) ?? [];
  } catch {
    return [];
  }
}

export default function CustomerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    
    fetchAcceptedEvents().then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  function handleLogout() {
    logoutCustomer();
    window.location.href = '/';
  }

  return (
    <main className="container-padded py-6">
      <div className="mb-4">
        <button 
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          ← Logout
        </button>
      </div>
      <h1 className="text-xl font-semibold mb-6">JTI Kunden Dashboard</h1>
      
      {loading ? (
        <div className="text-center text-gray-500 pt-32">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-500 pt-32">No events available yet.</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {events.map((event) => (
            <Link key={event.id} href={`/customer/event/${event.id}`} className="block">
              <div className="card overflow-hidden">
                <div className="aspect-[4/3] bg-muted relative">
                  {event.cover_url ? (
                    <img
                      src={event.cover_url}
                      alt={event.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-gray-300 text-xs">No cover</div>
                  )}
                </div>
                <div className="p-2">
                  <div className="text-xs text-gray-500">Event</div>
                  <div className="text-sm font-medium truncate" title={event.name}>{event.name}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
