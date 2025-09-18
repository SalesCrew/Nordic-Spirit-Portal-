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

function AdminEventCards({ events, onSelect }: { events: Event[]; onSelect: (ev: Event) => void }) {
	return (
		<section className="mb-6">
			<h2 className="text-lg font-medium mb-3">Events</h2>
			<div className="grid grid-cols-7 gap-2">
				{events.map((event) => (
					<button key={event.id} className="card overflow-hidden text-left focus:outline-none" onClick={() => onSelect(event)}>
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
					</button>
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
	const [editing, setEditing] = useState<Event | null>(null);
	const [kundenMode, setKundenMode] = useState(false);
	const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
	const [selectedReportings, setSelectedReportings] = useState<Set<string>>(new Set());

	useEffect(() => {
		(async () => {
			const { data } = await supabase
				.from('events')
				.select('id, name, cover_url, created_at, is_active')
				.order('created_at', { ascending: false });
			setEvents((data as Event[]) ?? []);
			setLoading(false);
		})();
	}, [supabase]);

	async function submitToCustomer() {
		if (selectedPhotos.size === 0 && selectedReportings.size === 0) return;
		
		try {
			// Get photos with their event_ids
			if (selectedPhotos.size > 0) {
				const { data: photos } = await supabase
					.from('photos')
					.select('id, event_id')
					.in('id', Array.from(selectedPhotos));
				
				if (photos) {
					const photoInserts = photos.map(p => ({
						photo_id: p.id,
						event_id: p.event_id
					}));
					await supabase.from('accepted_photos').insert(photoInserts);
				}
			}
			
			// Get reportings with their event_ids
			if (selectedReportings.size > 0) {
				const { data: reportings } = await supabase
					.from('reportings')
					.select('id, event_id')
					.in('id', Array.from(selectedReportings));
				
				if (reportings) {
					const reportingInserts = reportings.map(r => ({
						reporting_id: r.id,
						event_id: r.event_id
					}));
					await supabase.from('accepted_reportings').insert(reportingInserts);
				}
			}
			
			// Reset selection
			setSelectedPhotos(new Set());
			setSelectedReportings(new Set());
			setKundenMode(false);
		} catch (err) {
			console.error('Failed to submit to customer:', err);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div></div>
				<button 
					className={`btn-gradient ${kundenMode ? 'opacity-75' : ''}`}
					onClick={() => setKundenMode(!kundenMode)}
				>
					{kundenMode ? 'Kunden Modus beenden' : 'An den Kunden schicken'}
				</button>
			</div>
			
			{kundenMode && (selectedPhotos.size > 0 || selectedReportings.size > 0) && (
				<div className="flex justify-end">
					<button className="btn-gradient" onClick={submitToCustomer}>
						Auswahl senden ({selectedPhotos.size} Fotos, {selectedReportings.size} Reportings)
					</button>
				</div>
			)}
			
			{loading ? (
				<div className="text-gray-500">Loading events...</div>
			) : (
				<AdminEventCards events={events} onSelect={(ev) => setEditing(ev)} />
			)}
			{editing && (
				<EditEventModal
					event={editing}
					onClose={() => setEditing(null)}
					onSaved={(updated) => {
						setEvents((list) => list.map((e) => (e.id === updated.id ? updated : e)));
						setEditing(null);
					}}
					onDeleted={(deletedId) => {
						setEvents((list) => list.filter((e) => e.id !== deletedId));
						if (eventFilter === deletedId) setEventFilter('all');
						setEditing(null);
					}}
				/>
			)}
			<PhotoList 
				eventFilter={eventFilter} 
				onChangeEventFilter={setEventFilter}
				kundenMode={kundenMode}
				selectedPhotos={selectedPhotos}
				onTogglePhoto={(photoId) => {
					setSelectedPhotos(prev => {
						const newSet = new Set(prev);
						if (newSet.has(photoId)) newSet.delete(photoId);
						else newSet.add(photoId);
						return newSet;
					});
				}}
			/>
			<ReportingList 
				eventFilter={eventFilter}
				kundenMode={kundenMode}
				selectedReportings={selectedReportings}
				onToggleReporting={(reportingId) => {
					setSelectedReportings(prev => {
						const newSet = new Set(prev);
						if (newSet.has(reportingId)) newSet.delete(reportingId);
						else newSet.add(reportingId);
						return newSet;
					});
				}}
			/>
		</div>
	);
}

function EditEventModal({ event, onClose, onSaved, onDeleted }: {
	event: Event;
	onClose: () => void;
	onSaved: (ev: Event) => void;
	onDeleted: (id: string) => void;
}) {
	const supabase = supabaseBrowser();
	const [name, setName] = useState(event.name);
	const [cover, setCover] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	async function onSave() {
		setSaving(true);
		setMessage(null);
		try {
			let coverUrl = event.cover_url;
			if (cover) {
				const path = `covers/${Date.now()}-${cover.name}`;
				const { data, error } = await supabase.storage.from('photos').upload(path, cover);
				if (error) throw error;
				const { data: publicURL } = supabase.storage.from('photos').getPublicUrl(data.path);
				coverUrl = publicURL.publicUrl;
			}
			const { error: upErr } = await supabase
				.from('events')
				.update({ name, cover_url: coverUrl })
				.eq('id', event.id);
			if (upErr) throw upErr;
			onSaved({ ...event, name, cover_url: coverUrl });
		} catch (err: any) {
			setMessage(err?.message ?? 'Failed to save changes');
		} finally {
			setSaving(false);
		}
	}

	async function onConfirmDelete() {
		setDeleting(true);
		setMessage(null);
		try {
			const { error } = await supabase.from('events').delete().eq('id', event.id);
			if (error) throw error;
			onDeleted(event.id);
		} catch (err: any) {
			setMessage(err?.message ?? 'Failed to delete event');
			setDeleting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div className="card w-full max-w-md p-4 bg-white">
					<h3 className="text-lg font-semibold mb-3">Edit event</h3>
					<div className="space-y-3">
						<div>
							<label className="label">Name</label>
							<input className="input" value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div>
							<label className="label">Cover image</label>
							<input type="file" accept="image/*" className="input file-input" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
							{(cover || event.cover_url) && (
								<div className="mt-2 grid grid-cols-2 gap-2">
									<div className="text-xs text-gray-500 col-span-2">Preview</div>
									<div className="aspect-[4/3] rounded-md overflow-hidden bg-muted">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={cover ? URL.createObjectURL(cover) : (event.cover_url ?? '')}
											alt="cover preview"
											className="object-cover w-full h-full"
										/>
									</div>
								</div>
							)}
						</div>
						{message && <div className="text-sm text-red-600">{message}</div>}
						<div className="pt-2 flex items-center justify-between gap-2">
							<button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
							<div className="flex items-center gap-2">
								<button type="button" className="btn-danger" onClick={() => setConfirmDelete(true)}>Delete</button>
								<button type="button" className="btn-gradient" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			{confirmDelete && (
				<div className="fixed inset-0 z-50">
					<div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(false)} />
					<div className="absolute inset-0 flex items-center justify-center p-4">
						<div className="card w-full max-w-sm p-4 bg-white">
							<h4 className="text-md font-semibold mb-2">Delete event?</h4>
							<p className="text-sm text-gray-600 mb-4">This will remove the event and its data. This action cannot be undone.</p>
							<div className="flex items-center justify-end gap-2">
								<button type="button" className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
								<button type="button" className="btn-danger" onClick={onConfirmDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Confirm delete'}</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
