
-- Create 'public-assets' bucket (public read, 50MB max, common file types)
insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'public-assets',
    'public-assets',
    true,
    52428800,
    array[
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'video/mp4',
      'video/quicktime',
      'video/x-matroska',
      'video/webm',
      'application/octet-stream'
    ]
  );

-- Public can download (read) any files in the bucket
create policy "Public read access for public-assets"
  on storage.objects for select
  using (bucket_id = 'public-assets');

-- Authenticated users can upload to the bucket
create policy "Authenticated users can upload to public-assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'public-assets');

-- Authenticated users can update (patch) their own files
create policy "Owners can update their own public-assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'public-assets' and auth.uid() = owner)
  with check (bucket_id = 'public-assets' and auth.uid() = owner);

-- Authenticated users can delete their own files
create policy "Owners can delete their own public-assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'public-assets' and auth.uid() = owner);
