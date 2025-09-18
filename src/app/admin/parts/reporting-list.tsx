"use client";
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabaseBrowser } from '@/lib/supabase/client';

type Item = {
  id: string;
  event_id: string;
  created_at: string;
  answers: any;
  event_name?: string;
};

export default function ReportingList({ eventFilter }: { eventFilter: string }) {
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
      const map = new Map(((evs as any[]) ?? []).map((e) => [e.id, e.name]));
      const withName = ((reps as any[]) ?? []).map((r) => ({ ...r, event_name: map.get(r.event_id) }));
      setItems(withName);
      setLoading(false);
    })();
  }, [supabase]);

  async function downloadExcel() {
    const list = eventFilter === 'all' ? items : items.filter((r) => r.event_id === eventFilter);
    const rows = list.map((r) => ({
      id: r.id,
      event: r.event_name ?? r.event_id,
      created_at: new Date(r.created_at).toLocaleString(),
      promoter_name: r.answers?.promoter_name ?? '',
      work_date: r.answers?.work_date ?? '',
      start_time: r.answers?.start_time ?? '',
      leave_time: r.answers?.leave_time ?? '',
      frequenz: r.answers?.frequenz ?? '',
      kontakte_count: r.answers?.kontakte_count ?? '',
      pause_minutes: r.answers?.pause_minutes ?? '',
      notes: r.answers?.notes ?? r.answers?.notes ?? r.answers?.notes ?? ''
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Reportings');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reportings.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = eventFilter === 'all' ? items : items.filter((r) => r.event_id === eventFilter);

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Reportings</h2>
        <button className="btn-ghost" onClick={downloadExcel}>Download Excel</button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No reportings yet.</div>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {filtered.map((r) => (
            <div key={r.id} className="card p-3 rounded-lg">
              <div className="text-[11px] text-gray-500 mb-1">{new Date(r.created_at).toLocaleString()}</div>
              <div className="text-sm font-medium mb-2 line-clamp-1">{r.event_name ?? r.event_id}</div>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="truncate max-w-[110px] text-right">{r.answers?.promoter_name ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Datum:</span><span>{r.answers?.work_date ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Zeit:</span><span>{r.answers?.start_time ?? '—'}–{r.answers?.leave_time ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Frequenz:</span><span>{r.answers?.frequenz ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Kontakte:</span><span>{r.answers?.kontakte_count ?? '—'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


