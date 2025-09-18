"use client";
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type AcceptedPhoto = {
  id: string;
  storage_path: string;
  created_at: string;
};

type AcceptedReporting = {
  id: string;
  created_at: string;
  answers: any;
};


const FREQUENCIES = [
  { label: 'Sehr stark', value: 'sehr_stark' },
  { label: 'Stark', value: 'stark' },
  { label: 'Mittel', value: 'mittel' },
  { label: 'Schwach', value: 'schwach' },
  { label: 'Sehr schwach', value: 'sehr_schwach' }
] as const;

function getFrequenzColor(value: string) {
  switch (value) {
    case 'sehr_stark': return 'text-green-600';
    case 'stark': return 'text-green-500';
    case 'mittel': return 'text-yellow-600';
    case 'schwach': return 'text-orange-500';
    case 'sehr_schwach': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export default function CustomerEventSwitcher({ eventId }: { eventId: string }) {
  const [tab, setTab] = useState<'photos' | 'reporting'>('photos');
  const [photos, setPhotos] = useState<AcceptedPhoto[]>([]);
  const [reportings, setReportings] = useState<AcceptedReporting[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = supabaseBrowser();

  useEffect(() => {
    (async () => {
      try {
        // Fetch accepted photos for this event
        const { data: acceptedPhotos } = await supabase
          .from('accepted_photos')
          .select(`
            id,
            photos!inner(id, storage_path, created_at)
          `)
          .eq('event_id', eventId);

        // Fetch accepted reportings for this event  
        const { data: acceptedReportings } = await supabase
          .from('accepted_reportings')
          .select(`
            id,
            reportings!inner(id, created_at, answers)
          `)
          .eq('event_id', eventId);

        setPhotos(((acceptedPhotos as any) ?? []).map((ap: any) => ap.photos));
        setReportings(((acceptedReportings as any) ?? []).map((ar: any) => ar.reportings));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch accepted content:', err);
        setLoading(false);
      }
    })();
  }, [eventId, supabase]);

  return (
    <div className="space-y-4 max-w-6xl w-full">
      <div className="relative w-full">
        <div className="relative flex rounded-md border border-border bg-white p-1 select-none w-full">
          <div
            className={
              `absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] ` +
              (tab === 'photos' ? '' : 'translate-x-[calc(100%-2px)]')
            }
          />
          <button
            type="button"
            className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors ${tab === 'photos' ? 'text-gray-900' : 'text-gray-500'}`}
            onClick={() => setTab('photos')}
          >
            Photos
          </button>
          <button
            type="button"
            className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors ${tab === 'reporting' ? 'text-gray-900' : 'text-gray-500'}`}
            onClick={() => setTab('reporting')}
          >
            Reporting
          </button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-gray-500 text-center py-8">Loading...</div>
        ) : tab === 'photos' ? (
          photos.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No photos available.</div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
              {photos.map((photo) => {
                const url = supabase.storage.from('photos').getPublicUrl(photo.storage_path).data.publicUrl;
                return (
                  <div key={photo.id} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                    <img src={url} alt="Photo" className="object-cover w-full h-full" />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          reportings.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No reportings available.</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {reportings.map((r) => (
              <div key={r.id} className="card p-4 rounded-lg">
                <div className="text-[11px] text-gray-500 mb-2">{new Date(r.created_at).toLocaleString()}</div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Name:</span><span>{r.answers?.promoter_name ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Datum:</span><span>{r.answers?.work_date ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Zeit:</span><span>{r.answers?.start_time ?? '—'}–{r.answers?.leave_time ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Frequenz:</span><span className={getFrequenzColor(r.answers?.frequenz)}>{FREQUENCIES.find(f => f.value === r.answers?.frequenz)?.label || r.answers?.frequenz || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Kontakte:</span><span>{r.answers?.kontakte_count ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Pause:</span><span>{r.answers?.pause_minutes ? `${r.answers.pause_minutes} min` : '—'}</span></div>
                  <div className="mt-3">
                    <div className="text-gray-500 font-medium text-xs mb-1">Anmerkungen:</div>
                    <div className="bg-gray-100/70 rounded-md p-2">
                      <div className="text-xs text-gray-600 leading-relaxed scrollbar-hide max-h-24 overflow-y-auto">{r.answers?.notes ?? 'Keine Anmerkungen'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )
        )}
      </div>
    </div>
  );
}
