"use client";
import { useCallback, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type Uploaded = { url: string; id: string };

export default function PhotoUpload({ eventId }: { eventId: string }) {
  const supabase = supabaseBrowser();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);

  const onChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);
    try {
      const tasks = Array.from(files).map(async (file) => {
        const unique = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
          ? crypto.randomUUID()
          : String(Date.now());
        const path = `${eventId}/${unique}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { error: insertError } = await supabase
          .from('photos')
          .insert({ event_id: eventId, storage_path: path });
        if (insertError) throw insertError;
        const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
        setUploaded((prev) => [{ url, id: path }, ...prev].slice(0, 12));
      });
      await Promise.all(tasks);
      setMessage('Uploaded successfully.');
    } catch (err: any) {
      setMessage(err?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
      (e.target as HTMLInputElement).value = '';
    }
  }, [eventId, supabase]);

  return (
    <div className="card p-4 rounded-lg w-full">
      <div className="mb-3">
        <label className="label mb-2 block">Select photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onChange}
          className="input"
        />
      </div>
      {uploaded.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {uploaded.map((u) => (
            <div key={u.id} className="relative aspect-square overflow-hidden rounded-md bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u.url} alt="uploaded" className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        {message && <div className="text-sm text-gray-500">{message}</div>}
        <button className="btn-gradient" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}


