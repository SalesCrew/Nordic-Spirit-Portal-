"use client";
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import PhotoList from './photo-list';
import ReportingList from './reporting-list';

type Event = {
	id: string;
	name: string;
	cover_url: string | null;
	created_at: string;
	is_active: boolean;
};

function AdminEventCards({ events }: { events: Event[] }) {
	return (
		<section className="mb-6">
			<h2 className="text-lg font-medium mb-3">Events</h2>
			<div className="grid grid-cols-7 gap-2">
				{events.map((event) => (
					<div key={event.id} className="card overflow-hidden">
						<div className="aspect-[4/3] bg-muted relative">
							{event.cover_url ? (
								<img
									src={event.cover_url}
									alt={event.name}
									className="object-cover w-full h-full"
								/>
							) : (
								<div className="absolute inset-0 grid place-items-center text-gray-300 text-xs">No cover</div>
							)}
						</div>
						<div className="p-2">
							<div className="text-xs text-gray-500">Event</div>
							<div className="text-sm font-medium truncate" title={event.name}>{event.name}</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export default function FilterWrapper() {
	const [eventFilter, setEventFilter] = useState<string>('all');
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const supabase = supabaseBrowser();

	useEffect(() => {
		(async () => {
			const { data } = await supabase
				.from('events')
				.select('id, name, cover_url, created_at, is_active')
				.order('created_at', { ascending: false });
			setEvents(data ?? []);
			setLoading(false);
		})();
	}, [supabase]);

	return (
		<div className="space-y-6">
			{loading ? (
				<div className="text-gray-500">Loading events...</div>
			) : (
				<AdminEventCards events={events} />
			)}
			<PhotoList eventFilter={eventFilter} onChangeEventFilter={setEventFilter} />
			<ReportingList eventFilter={eventFilter} />
		</div>
	);
}
