"use client";
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabaseBrowser } from '@/lib/supabase/client';

const FREQUENCIES = [
  { label: 'Sehr stark', value: 'sehr_stark' },
  { label: 'Stark', value: 'stark' },
  { label: 'Mittel', value: 'mittel' },
  { label: 'Schwach', value: 'schwach' },
  { label: 'Sehr schwach', value: 'sehr_schwach' }
] as const;

type Item = {
  id: string;
  event_id: string;
  created_at: string;
  answers: any;
  event_name?: string;
};

export default function ReportingList({ eventFilter, kundenMode, selectedReportings, onToggleReporting }: { 
  eventFilter: string;
  kundenMode?: boolean;
  selectedReportings?: Set<string>;
  onToggleReporting?: (reportingId: string) => void;
}) {
  const supabase = supabaseBrowser();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);

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
          {filtered.map((r) => {
            const isSelected = selectedReportings?.has(r.id) || false;
            return (
              <div key={r.id} className={`card p-3 rounded-lg relative ${editing?.id === r.id ? 'shadow-[0_4px_20px_rgba(43,145,255,0.3)]' : ''} ${kundenMode && isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                {kundenMode && (
                  <button 
                    className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center"
                    onClick={() => onToggleReporting?.(r.id)}
                    title="Select for customer"
                  >
                    <div className={`w-4 h-4 rounded border-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} flex items-center justify-center`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                    </div>
                  </button>
                )}
                {!kundenMode && (
                  <button 
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    onClick={() => setEditing(r)}
                    title="Edit reporting"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                )}
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
            );
          })}
        </div>
      )}
      {editing && (
        <EditReportingModal
          reporting={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setItems((list) => list.map((r) => (r.id === updated.id ? updated : r)));
            setEditing(null);
          }}
          onDeleted={(deletedId) => {
            setItems((list) => list.filter((r) => r.id !== deletedId));
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

function EditReportingModal({ reporting, onClose, onSaved, onDeleted }: {
  reporting: Item;
  onClose: () => void;
  onSaved: (r: Item) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = supabaseBrowser();
  const [answers, setAnswers] = useState(reporting.answers || {});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showFrequenzDropdown, setShowFrequenzDropdown] = useState(false);

  async function onSave() {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('reportings')
        .update({ answers })
        .eq('id', reporting.id);
      if (error) throw error;
      onSaved({ ...reporting, answers });
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  function updateAnswer(key: string, value: string) {
    setAnswers((prev: any) => ({ ...prev, [key]: value }));
  }

  async function onConfirmDelete() {
    setDeleting(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('reportings').delete().eq('id', reporting.id);
      if (error) throw error;
      onDeleted(reporting.id);
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to delete reporting');
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-4 bg-white max-h-[80vh] overflow-y-auto scrollbar-hide">
          <h3 className="text-lg font-semibold mb-3">Edit Reporting</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Name Mitarbeiter</label>
              <input
                className="input"
                value={answers.promoter_name || ''}
                onChange={(e) => updateAnswer('promoter_name', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Datum</label>
              <input
                className="input"
                type="date"
                value={answers.work_date || ''}
                onChange={(e) => updateAnswer('work_date', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Dienstbeginn</label>
                <input
                  className="input"
                  value={answers.start_time || ''}
                  onChange={(e) => updateAnswer('start_time', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Uhrzeit verlassen</label>
                <input
                  className="input"
                  value={answers.leave_time || ''}
                  onChange={(e) => updateAnswer('leave_time', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Frequenz</label>
              <div className="relative">
                <button
                  type="button"
                  className="input w-full text-left flex items-center justify-between"
                  onClick={() => setShowFrequenzDropdown(!showFrequenzDropdown)}
                >
                  <span>{FREQUENCIES.find(f => f.value === answers.frequenz)?.label || answers.frequenz || 'Select...'}</span>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                    <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showFrequenzDropdown && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-border rounded-md shadow-lg z-10">
                    {FREQUENCIES.map((freq) => (
                      <button
                        key={freq.value}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-[#2B91FF]/50 hover:to-[#0047FF]/50"
                        onClick={() => {
                          updateAnswer('frequenz', freq.value);
                          setShowFrequenzDropdown(false);
                        }}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Anzahl Kontakte</label>
                <input
                  className="input"
                  type="number"
                  value={answers.kontakte_count || ''}
                  onChange={(e) => updateAnswer('kontakte_count', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Pause (Minuten)</label>
                <input
                  className="input"
                  type="number"
                  value={answers.pause_minutes || ''}
                  onChange={(e) => updateAnswer('pause_minutes', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Anmerkungen</label>
              <textarea
                className="input min-h-[120px] scrollbar-hide"
                value={answers.notes || ''}
                onChange={(e) => updateAnswer('notes', e.target.value)}
              />
            </div>
            {message && <div className="text-sm text-red-600">{message}</div>}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <div className="flex items-center gap-2">
                <button type="button" className="btn-danger" onClick={() => setConfirmDelete(true)}>Delete</button>
                <button type="button" className="btn-gradient" onClick={onSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="card w-full max-w-sm p-4 bg-white">
              <h4 className="text-md font-semibold mb-2">Delete reporting?</h4>
              <p className="text-sm text-gray-600 mb-4">This will permanently remove this reporting. This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button type="button" className="btn-danger" onClick={onConfirmDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Confirm delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


