import { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return <div className="card overflow-hidden">{children}</div>;
}

export function CardBody({ children }: PropsWithChildren) {
  return <div className="p-4">{children}</div>;
}

export function CardHeader({ children }: PropsWithChildren) {
  return <div className="p-4 border-b border-border bg-white/60">{children}</div>;
}


