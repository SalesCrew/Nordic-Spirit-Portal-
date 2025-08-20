"use client";
import { useState } from 'react';
import { z } from 'zod';
import { supabaseBrowser } from '@/lib/supabase/client';

const ReportingSchema = z.object({
  team_size: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  stock_delivered: z.string().min(1),
  samples_given: z.string().min(1),
  notes: z.string().optional()
});

type ReportingValues = z.infer<typeof ReportingSchema>;

export default function ReportingForm({ eventId }: { eventId: string }) {
  const supabase = supabaseBrowser();
  const [values, setValues] = useState<ReportingValues>({
    team_size: '',
    start_time: '',
    end_time: '',
    stock_delivered: '',
    samples_given: '',
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
      setError('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('reportings')
        .insert({ event_id: eventId, answers: values });
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
    return <div className="card p-4">Thanks! Your reporting was submitted.</div>;
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 space-y-3">
      <div>
        <label className="label">Team size</label>
        <input className="input" value={values.team_size} onChange={(e) => onChange('team_size', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start time</label>
          <input type="time" className="input" value={values.start_time} onChange={(e) => onChange('start_time', e.target.value)} />
        </div>
        <div>
          <label className="label">End time</label>
          <input type="time" className="input" value={values.end_time} onChange={(e) => onChange('end_time', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Stock delivered</label>
          <input className="input" value={values.stock_delivered} onChange={(e) => onChange('stock_delivered', e.target.value)} />
        </div>
        <div>
          <label className="label">Samples given</label>
          <input className="input" value={values.samples_given} onChange={(e) => onChange('samples_given', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[80px]" value={values.notes} onChange={(e) => onChange('notes', e.target.value)} />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="pt-2">
        <button className="btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit reporting'}
        </button>
      </div>
    </form>
  );
}


