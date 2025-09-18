"use client";
import { useState } from 'react';
import PhotoUpload from './photo-upload';
import ReportingForm from './reporting-form';

export default function EventSwitcher({ eventId }: { eventId: string }) {
  const [tab, setTab] = useState<'photos' | 'reporting'>('photos');

  return (
    <div className="space-y-4 max-w-2xl w-full">
      <div className="relative w-full">
        <div className="relative flex rounded-md border border-border bg-white p-1 select-none w-full">
          <div
            className={
              `absolute top-1 bottom-1 w-1/2 rounded-md bg-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out ` +
              (tab === 'photos' ? 'translate-x-0' : 'translate-x-[100%]')
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
          <PhotoUpload eventId={eventId} />
        ) : (
          <ReportingForm eventId={eventId} />
        )}
      </div>
    </div>
  );
}


