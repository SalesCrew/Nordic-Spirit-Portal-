"use client";
import { useCallback, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type Uploaded = { url: string; id: string };

export default function PhotoUpload({ eventId }: { eventId: string }) {
  const supabase = supabaseBrowser();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPendingFiles(Array.from(files));
    setMessage(`${files.length} file(s) ready to upload`);
  }, []);

  const onUpload = useCallback(async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    setMessage(null);
    try {
      const tasks = pendingFiles.map(async (file) => {
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
        return { url, id: path } as Uploaded;
      });
      const results = await Promise.all(tasks);
      setUploaded((prev) => [...results, ...prev].slice(0, 12));
      setMessage('Uploaded successfully.');
      setPendingFiles([]);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: any) {
      setMessage(err?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [pendingFiles, eventId, supabase]);

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
          ref={inputRef}
        />
      </div>
      
      {pendingFiles.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2">{pendingFiles.length} file(s) ready to upload:</div>
          <div className="grid grid-cols-4 gap-2">
            {pendingFiles.map((file, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden rounded-md bg-muted border-2 border-dashed border-blue-300">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name} 
                  className="object-cover w-full h-full opacity-75" 
                />
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                  <div className="text-xs text-blue-600 font-medium">Ready</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-2">Recently uploaded:</div>
          <div className="grid grid-cols-3 gap-2">
            {uploaded.map((u) => (
              <div key={u.id} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.url} alt="uploaded" className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 flex items-center justify-end gap-2 w-full">
        {message && <div className="text-sm text-gray-500">{message}</div>}
        <button className="btn-gradient ml-auto" disabled={uploading || pendingFiles.length === 0} onClick={onUpload}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}


