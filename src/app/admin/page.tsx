import Link from 'next/link';
import { isSupabaseConfigured, supabaseBrowser } from '@/lib/supabase/client';
import { Event } from '@/types/db';
import AdminLogin from './parts/login';
import CreateEvent from './parts/create-event';
import FilterWrapper from './parts/FilterWrapper';
import { useState } from 'react';

async function fetchEvents(): Promise<Event[]> {
  const supabase = supabaseBrowser();
  const { data } = await supabase
    .from('events')
    .select('id, name, cover_url, created_at, is_active')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function AdminPage() {
  const configured = isSupabaseConfigured();
  const events = configured ? await fetchEvents() : [];
  const initialFilter = 'all';
  // Note: we can't use hooks in async server components directly, so leave filter to child client components.
  return (
    <main className="container-padded py-6">
      <div className="mb-4">
        <Link href="/" className="text-sm text-gray-500">← Back</Link>
      </div>
      <AdminLogin />
      <div className="space-y-6">
        {configured ? (
          <>
            <CreateEvent />
            {/* Events grid removed per request; selection via dropdown only */}
            <FilterWrapper />
          </>
        ) : (
          <div className="card p-4">
            <h2 className="text-lg font-medium">Connect Supabase</h2>
            <p className="text-sm text-gray-600 mt-1">Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` or in Vercel project settings, then refresh.</p>
          </div>
        )}
      </div>
    </main>
  );
}


