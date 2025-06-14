
-- Update the 3d_models bucket to also allow application/octet-stream MIME type
-- This is needed because some browsers may not properly detect .glb/.gltf MIME types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']
WHERE id = '3d_models';
