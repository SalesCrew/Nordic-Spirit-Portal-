"use client";
import { useEffect, useRef, useState } from 'react';

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export default function TimePicker({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState('09');
  const [minutes, setMinutes] = useState('00');
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [alignRight, setAlignRight] = useState(false);
  const [placeAbove, setPlaceAbove] = useState(false);

  // Parse current value when it changes
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setHours(h || '09');
      setMinutes(m || '00');
    }
  }, [value]);

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
    const panelWidth = 200;
    const vw = window.innerWidth;
    setAlignRight(anchor.left + panelWidth > vw - 8);
    const ph = panelRef.current?.getBoundingClientRect().height ?? 280;
    setPlaceAbove(anchor.bottom + ph > window.innerHeight - 8);
  }, [open]);

  function selectTime(h: string, m: string) {
    setHours(h);
    setMinutes(m);
    onChange(`${h}:${m}`);
    setOpen(false);
  }

  const hourOptions = Array.from({ length: 24 }, (_, i) => pad(i));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => pad(i * 5));

  return (
    <div ref={anchorRef} className="relative w-full">
      <input
        readOnly
        value={value}
        onClick={() => setOpen((v) => !v)}
        placeholder={placeholder || "HH:MM"}
        className="input cursor-pointer"
      />
      {open && (
        <div
          ref={panelRef}
          className={`absolute z-50 w-50 rounded-lg border border-border bg-white shadow-card p-3 ${placeAbove ? 'mb-2 bottom-full' : 'mt-2 top-full'} ${alignRight ? 'right-0' : 'left-0'}`}
        >
          <div className="text-sm font-medium mb-3 text-center">Select Time</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-2 text-center">Hours</div>
              <div className="max-h-32 overflow-y-auto scrollbar-hide space-y-1">
                {hourOptions.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => selectTime(h, minutes)}
                    className={`w-full py-1 px-2 text-sm rounded ${hours === h ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2 text-center">Minutes</div>
              <div className="max-h-32 overflow-y-auto scrollbar-hide space-y-1">
                {minuteOptions.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectTime(hours, m)}
                    className={`w-full py-1 px-2 text-sm rounded ${minutes === m ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
