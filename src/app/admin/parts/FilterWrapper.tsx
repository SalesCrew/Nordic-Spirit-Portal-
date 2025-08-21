"use client";
import { useState } from 'react';
import PhotoList from './photo-list';
import ReportingList from './reporting-list';

export default function FilterWrapper() {
	const [eventFilter, setEventFilter] = useState<string>('all');
	return (
		<div className="space-y-6">
			<PhotoList eventFilter={eventFilter} onChangeEventFilter={setEventFilter} />
			<ReportingList eventFilter={eventFilter} />
		</div>
	);
}
