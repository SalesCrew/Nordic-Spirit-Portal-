"use client";
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function CreateEvent() {
  const supabase = supabaseBrowser();
  const [name, setName] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      let coverUrl: string | null = null;
      if (cover) {
        const path = `covers/${Date.now()}-${cover.name}`;
        const { data, error } = await supabase.storage.from('photos').upload(path, cover);
        if (error) throw error;
        const { data: publicURL } = supabase.storage.from('photos').getPublicUrl(data.path);
        coverUrl = publicURL.publicUrl;
      }
      const { error: insertError } = await supabase
        .from('events')
        .insert({ name, cover_url: coverUrl, is_active: true });
      if (insertError) throw insertError;
      setMessage('Event created. Refresh to see it on top.');
      setName('');
      setCover(null);
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to create event');
    } finally {
      setCreating(false);
    }
  }

  return (
    <form onSubmit={onCreate} className="card p-4">
      <h2 className="text-lg font-medium mb-2">Create event</h2>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Event name" />
        </div>
        <div>
          <label className="label">Cover image</label>
          <input type="file" accept="image/*" className="input" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      <button className="btn-primary mt-3" disabled={creating}>{creating ? 'Creating...' : 'Create event'}</button>
      {message && <div className="text-sm text-gray-500 mt-2">{message}</div>}
    </form>
  );
}


