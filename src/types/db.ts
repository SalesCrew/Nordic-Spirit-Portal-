export type Event = {
  id: string;
  name: string;
  cover_url: string | null;
  created_at: string;
  is_active: boolean;
};

export type Photo = {
  id: string;
  event_id: string;
  storage_path: string;
  created_at: string;
  note: string | null;
};

export type ReportingAnswer = {
  id: string;
  event_id: string;
  created_at: string;
  answers: Record<string, unknown>;
};


