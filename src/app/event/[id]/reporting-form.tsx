"use client";
import { useState } from 'react';
import { z } from 'zod';
import { supabaseBrowser } from '@/lib/supabase/client';
import DatePicker from '@/components/DatePicker';

const FREQUENCIES = [
  { label: 'Sehr stark', value: 'sehr_stark' },
  { label: 'Stark', value: 'stark' },
  { label: 'Mittel', value: 'mittel' },
  { label: 'Schwach', value: 'schwach' },
  { label: 'Sehr schwach', value: 'sehr_schwach' }
] as const;

const TIME_24H = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ReportingSchema = z.object({
  promoter_name: z.string().min(1),
  work_date: z.string().min(1),
  start_time: z.string().regex(TIME_24H, 'HH:MM'),
  leave_time: z.string().regex(TIME_24H, 'HH:MM'),
  frequenz: z.enum(FREQUENCIES.map(f => f.value) as [string, ...string[]]),
  kontakte_count: z.string().min(1),
  pause_minutes: z.string().optional().default(''),
  notes: z.string().optional()
});

type ReportingValues = z.infer<typeof ReportingSchema>;

export default function ReportingForm({ eventId }: { eventId: string }) {
  const supabase = supabaseBrowser();
  const [values, setValues] = useState<ReportingValues>({
    promoter_name: '',
    work_date: '',
    start_time: '',
    leave_time: '',
    frequenz: 'mittel',
    kontakte_count: '',
    pause_minutes: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parse = ReportingSchema.safeParse(values);
    if (!parse.success) {
      setError('Bitte alle Pflichtfelder ausfüllen');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        event_id: eventId,
        answers: values,
        promoter_name: values.promoter_name,
        work_date: values.work_date,
        dienstbeginn: values.start_time,
        frequenz: values.frequenz as any,
        kontakte_count: Number(values.kontakte_count) || null,
        pause: values.pause_minutes ? true : false,
        pause_minutes: values.pause_minutes ? Number(values.pause_minutes) || null : null,
        leave_time: values.leave_time,
        notes: values.notes ?? null
      };
      const { error: insertError } = await supabase.from('reportings').insert(payload);
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  function onChange(name: keyof ReportingValues, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  if (submitted) {
    return <div className="card p-4">Danke! Dein Reporting wurde gesendet.</div>;
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Name Mitarbeiter</label>
          <input className="input" value={values.promoter_name} onChange={(e) => onChange('promoter_name', e.target.value)} />
        </div>
        <div>
          <label className="label">Datum</label>
          <DatePicker value={values.work_date} onChange={(val) => onChange('work_date', val)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Dienstbeginn</label>
          <input
            className="input"
            placeholder="HH:MM"
            inputMode="numeric"
            pattern="([01]\\d|2[0-3]):([0-5]\\d)"
            value={values.start_time}
            onChange={(e) => onChange('start_time', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Uhrzeit verlassen</label>
          <input
            className="input"
            placeholder="HH:MM"
            inputMode="numeric"
            pattern="([01]\\d|2[0-3]):([0-5]\\d)"
            value={values.leave_time}
            onChange={(e) => onChange('leave_time', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label block mb-1">Frequenz</label>
        <div className="relative flex rounded-md border border-border bg-white p-1 select-none w-full max-w-md">
          <div
            className="absolute top-1 bottom-1 left-1 rounded-md bg-gradient-to-r from-[#2B91FF]/20 to-[#0047FF]/20 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out"
            style={{
              width: `calc(${100 / FREQUENCIES.length}% - 2px)`,
              transform: `translateX(calc(${FREQUENCIES.findIndex(f=>f.value===values.frequenz)} * (100% + 2px)))`
            }}
          />
          {FREQUENCIES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onChange('frequenz', f.value)}
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors ${values.frequenz === f.value ? 'text-gray-900' : 'text-gray-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Anzahl Kontakte</label>
          <input className="input" inputMode="numeric" value={values.kontakte_count} onChange={(e) => onChange('kontakte_count', e.target.value)} />
        </div>
        <div>
          <label className="label">Pause (Minuten)</label>
          <input className="input" inputMode="numeric" placeholder="z.B. 30" value={values.pause_minutes} onChange={(e) => onChange('pause_minutes', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Anmerkungen</label>
        <textarea className="input min-h-[100px]" value={values.notes} onChange={(e) => onChange('notes', e.target.value)} />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="pt-2 flex justify-end">
        <button className="btn-gradient" disabled={submitting}>
          {submitting ? 'Sende...' : 'Reporting senden'}
        </button>
      </div>
    </form>
  );
}


