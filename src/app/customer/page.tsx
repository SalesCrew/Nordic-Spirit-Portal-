export const dynamic = 'force-dynamic';
import Link from 'next/link';

// Temp data for frontend
const tempEvents = [
  { id: '1', name: 'Summer Campaign 2024', cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
  { id: '2', name: 'Winter Promotion', cover_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop' },
  { id: '3', name: 'Spring Launch', cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
  { id: '4', name: 'Autumn Festival', cover_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop' },
];

export default function CustomerDashboard() {
  return (
    <main className="container-padded py-6">
      <div className="mb-4">
        <Link href="/" className="text-sm text-gray-500">← Back</Link>
      </div>
      <h1 className="text-xl font-semibold mb-6">Customer Dashboard</h1>
      
      <div className="grid grid-cols-7 gap-2">
        {tempEvents.map((event) => (
          <Link key={event.id} href={`/customer/event/${event.id}`} className="block">
            <div className="card overflow-hidden">
              <div className="aspect-[4/3] bg-muted relative">
                <img
                  src={event.cover_url}
                  alt={event.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-500">Event</div>
                <div className="text-sm font-medium truncate" title={event.name}>{event.name}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
