"use client";
import { useState } from 'react';

// Temp data
const tempPhotos = Array.from({ length: 12 }, (_, i) => ({
  id: `photo-${i + 1}`,
  url: `https://images.unsplash.com/photo-${1506905925346 + i}?w=140&h=140&fit=crop`,
  title: `Photo ${i + 1}`,
}));

const tempReportings = [
  {
    id: '1',
    created_at: '2024-01-15T10:30:00Z',
    promoter_name: 'Max Mustermann',
    work_date: '2024-01-15',
    start_time: '09:00',
    leave_time: '17:00',
    frequenz: 'stark',
    kontakte_count: '45',
    pause_minutes: '30',
    notes: 'Sehr erfolgreicher Tag mit vielen interessierten Kunden. Besonders das neue Produkt kam gut an. Wetter war perfekt für Outdoor-Aktivitäten. Die Standortauswahl war optimal und die Passantenfrequenz hoch. Mehrere Kunden zeigten großes Interesse an unseren Angeboten und buchten direkt vor Ort. Das Team war motiviert und professionell. Einige Kunden fragten nach weiteren Terminen und Standorten. Die Zusammenarbeit mit dem lokalen Management verlief reibungslos. Insgesamt ein sehr zufriedenstellender Arbeitstag mit guten Ergebnissen.',
  },
  {
    id: '2',
    created_at: '2024-01-14T14:20:00Z',
    promoter_name: 'Anna Schmidt',
    work_date: '2024-01-14',
    start_time: '10:00',
    leave_time: '18:00',
    frequenz: 'mittel',
    kontakte_count: '32',
    pause_minutes: '45',
    notes: 'Guter Tag mit stabilen Verkaufszahlen. Einige Rückfragen zu Preisen und Verfügbarkeit. Das Wetter war wechselhaft, was die Kundenfrequenz zeitweise beeinträchtigte. Trotzdem konnten wir mehrere erfolgreiche Gespräche führen und neue Kontakte knüpfen. Die Produktpräsentation wurde gut angenommen. Einige Kunden baten um Informationsmaterial zum Mitnehmen. Die Logistik funktionierte einwandfrei und alle benötigten Materialien waren verfügbar. Gegen Abend stieg die Besucherfrequenz deutlich an.',
  },
  {
    id: '3',
    created_at: '2024-01-13T16:45:00Z',
    promoter_name: 'Tom Weber',
    work_date: '2024-01-13',
    start_time: '08:30',
    leave_time: '16:30',
    frequenz: 'sehr_stark',
    kontakte_count: '67',
    pause_minutes: '20',
    notes: 'Außergewöhnlich starker Tag! Viele spontane Käufe und positive Reaktionen. Der Standort war perfekt gewählt und die Sichtbarkeit optimal. Bereits am frühen Morgen bildeten sich kleine Warteschlangen. Die Kunden waren sehr aufgeschlossen und interessiert an unseren Produkten. Besonders die Neukunden zeigten großes Interesse. Das Feedback war durchweg positiv und mehrere Kunden empfahlen uns direkt weiter. Die Teamarbeit war hervorragend und alle Abläufe funktionierten reibungslos. Dieser Tag übertraf alle Erwartungen und wird sicher als Referenz für zukünftige Events dienen.',
  },
];

const FREQUENCIES = [
  { label: 'Sehr stark', value: 'sehr_stark' },
  { label: 'Stark', value: 'stark' },
  { label: 'Mittel', value: 'mittel' },
  { label: 'Schwach', value: 'schwach' },
  { label: 'Sehr schwach', value: 'sehr_schwach' }
] as const;

export default function CustomerEventSwitcher({ eventId }: { eventId: string }) {
  const [tab, setTab] = useState<'photos' | 'reporting'>('photos');

  return (
    <div className="space-y-4 max-w-6xl w-full">
      <div className="relative w-full">
        <div className="relative flex rounded-md border border-border bg-white p-1 select-none w-full">
          <div
            className={
              `absolute top-1 bottom-1 w-1/2 rounded-md bg-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out ` +
              (tab === 'photos' ? 'translate-x-0' : 'translate-x-full')
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
        {tab === 'photos' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
            {tempPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                <img src={photo.url} alt={photo.title} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {tempReportings.map((r) => (
              <div key={r.id} className="card p-4 rounded-lg">
                <div className="text-[11px] text-gray-500 mb-2">{new Date(r.created_at).toLocaleString()}</div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Name:</span><span>{r.promoter_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Datum:</span><span>{r.work_date}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Zeit:</span><span>{r.start_time}–{r.leave_time}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Frequenz:</span><span>{FREQUENCIES.find(f => f.value === r.frequenz)?.label || r.frequenz}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Kontakte:</span><span>{r.kontakte_count}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Pause:</span><span>{r.pause_minutes} min</span></div>
                  <div className="mt-3">
                    <div className="text-gray-500 font-medium text-xs mb-1">Anmerkungen:</div>
                    <div className="text-xs text-gray-600 leading-relaxed scrollbar-hide max-h-24 overflow-y-auto">{r.notes}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
