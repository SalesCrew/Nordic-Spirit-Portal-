"use client";
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type Item = {
  id: string;
  event_id: string;
  created_at: string;
  answers: any;
  event_name?: string;
};

export default function ReportingList() {
  const supabase = supabaseBrowser();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: reps } = await supabase
        .from('reportings')
        .select('id, event_id, created_at, answers')
        .order('created_at', { ascending: false })
        .limit(100);
      const { data: evs } = await supabase
        .from('events')
        .select('id, name');
      const map = new Map((evs ?? []).map((e) => [e.id, e.name]));
      const withName = (reps ?? []).map((r) => ({ ...r, event_name: map.get(r.event_id) }));
      setItems(withName);
      setLoading(false);
    })();
  }, [supabase]);

  async function downloadJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reportings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Reportings</h2>
        <button className="btn-ghost" onClick={downloadJson}>Download JSON</button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">No reportings yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="text-sm text-gray-500 mb-1">{new Date(r.created_at).toLocaleString()}</div>
              <div className="font-medium mb-2">{r.event_name ?? r.event_id}</div>
              <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-64">{JSON.stringify(r.answers, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


