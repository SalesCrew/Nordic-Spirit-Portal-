"use client";
import { useEffect, useMemo, useRef, useState } from 'react';

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const MONTHS = [
  'Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'
];

export default function DatePicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const parsed = value ? new Date(value) : new Date();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(parsed.getFullYear());
  const [month, setMonth] = useState(parsed.getMonth()); // 0-11
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [alignRight, setAlignRight] = useState(false);
  const [placeAbove, setPlaceAbove] = useState(false);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (anchorRef.current && anchorRef.current.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const panelWidth = 288; // w-72
    const vw = window.innerWidth;
    setAlignRight(anchor.left + panelWidth > vw - 8);
    // measure height
    const ph = panelRef.current?.getBoundingClientRect().height ?? 320;
    setPlaceAbove(anchor.bottom + ph > window.innerHeight - 8);
  }, [open]);

  const grid = useMemo(() => {
    // Monday as first day of week
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() - 1 + 7) % 7; // 0..6 with Monday=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ d: number | null }> = [];
    for (let i = 0; i < startOffset; i++) cells.push({ d: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ d });
    const remainder = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < remainder; i++) cells.push({ d: null });
    return cells;
  }, [year, month]);

  const selected = value ? new Date(value) : null;

  function changeMonth(delta: number) {
    const date = new Date(year, month + delta, 1);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
  }

  return (
    <div ref={anchorRef} className="relative w-full">
      <input
        readOnly
        value={value}
        onClick={() => setOpen((v) => !v)}
        placeholder="YYYY-MM-DD"
        className="input cursor-pointer"
      />
      {open && (
        <div
          ref={panelRef}
          className={`absolute z-50 w-72 rounded-lg border border-border bg-white shadow-card p-3 ${placeAbove ? 'mb-2 bottom-full' : 'mt-2 top-full'} ${alignRight ? 'right-0' : 'left-0'}`}
          style={{}}
        >
          <div className="flex items-center justify-between mb-2">
            <button type="button" className="btn-ghost px-2 py-1 text-sm" onClick={() => changeMonth(-1)}>‹</button>
            <div className="text-sm font-medium">{MONTHS[month]} {year}</div>
            <button type="button" className="btn-ghost px-2 py-1 text-sm" onClick={() => changeMonth(1)}>›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
            {['Mo','Di','Mi','Do','Fr','Sa','So'].map((w) => <div key={w}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, idx) => {
              if (cell.d == null) return <div key={idx} className="h-8"/>;
              const date = new Date(year, month, cell.d);
              const isSel = selected && formatDate(date) === formatDate(selected);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { onChange(formatDate(date)); setOpen(false); }}
                  className={`h-8 rounded-md text-sm ${isSel ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                >
                  {cell.d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


