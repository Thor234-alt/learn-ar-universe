
-- Create a new storage bucket for 3D models
-- This bucket will be public for read access, with a 50MB file size limit,
-- and will allow .glb (model/gltf-binary) and .gltf (model/gltf+json) files.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('3d_models', '3d_models', true, 52428800, ARRAY['model/gltf-binary', 'model/gltf+json']);

-- Policy: Allow public read access to files in the '3d_models' bucket.
-- This means anyone with the link can view the 3D models.
CREATE POLICY "Public read access for 3d_models"
ON storage.objects FOR SELECT
USING (bucket_id = '3d_models');

-- Policy: Allow authenticated users to upload files to the '3d_models' bucket.
-- The 'owner' of the file will be the ID of the user who uploaded it.
CREATE POLICY "Authenticated users can upload to 3d_models"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = '3d_models');

-- Policy: Allow authenticated users who are owners of a file to update it.
CREATE POLICY "Owners can update their own 3d_models"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = '3d_models' AND auth.uid() = owner)
WITH CHECK (bucket_id = '3d_models' AND auth.uid() = owner);

-- Policy: Allow authenticated users who are owners of a file to delete it.
CREATE POLICY "Owners can delete their own 3d_models"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = '3d_models' AND auth.uid() = owner);

