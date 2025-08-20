"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody } from './ui/Card';
import { Event } from '@/types/db';

type Props = {
  event: Event;
};

export default function EventCard({ event }: Props) {
  return (
    <Link href={`/event/${event.id}`} className="block">
      <Card>
        <div className="aspect-[4/3] bg-muted relative">
          {event.cover_url ? (
            <Image
              src={event.cover_url}
              alt={event.name}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        <CardBody>
          <div className="text-sm text-gray-500">Event</div>
          <div className="text-lg font-semibold">{event.name}</div>
        </CardBody>
      </Card>
    </Link>
  );
}


