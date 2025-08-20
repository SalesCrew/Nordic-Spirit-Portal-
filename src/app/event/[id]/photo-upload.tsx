"use client";
import { useCallback, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function PhotoUpload({ eventId }: { eventId: string }) {
  const supabase = supabaseBrowser();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
    <div className="card p-4">
      <label className="label mb-2">Select photos</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="input"
      />
      <button className="btn-primary mt-3" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <div className="text-sm text-gray-500 mt-2">{message}</div>}
    </div>
  );
}


