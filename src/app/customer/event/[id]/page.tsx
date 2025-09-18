import Link from 'next/link';
import { Suspense } from 'react';
import CustomerEventSwitcher from './switcher';

// Temp data for frontend
const tempEvents = [
  { id: '1', name: 'Summer Campaign 2024' },
  { id: '2', name: 'Winter Promotion' },
  { id: '3', name: 'Spring Launch' },
  { id: '4', name: 'Autumn Festival' },
];

export default function CustomerEventPage({ params }: { params: { id: string } }) {
  const event = tempEvents.find(e => e.id === params.id);
  if (!event) return <div className="container-padded py-6">Event not found.</div>;
  
  return (
    <main className="container-padded py-6 flex flex-col items-center">
      <div className="mb-4 flex items-center justify-between w-full max-w-6xl">
        <h1 className="text-xl font-semibold">{event.name}</h1>
        <Link href="/customer" className="text-sm text-gray-500">← Back</Link>
      </div>
      <Suspense>
        <CustomerEventSwitcher eventId={event.id} />
      </Suspense>
    </main>
  );
}
