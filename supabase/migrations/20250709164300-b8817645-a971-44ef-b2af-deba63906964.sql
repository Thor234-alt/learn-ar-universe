-- Add QR code and public access support to module_content table
ALTER TABLE module_content 
ADD COLUMN qr_code_url TEXT,
ADD COLUMN public_access BOOLEAN DEFAULT FALSE,
ADD COLUMN access_count INTEGER DEFAULT 0;

-- Create index for faster public content queries
CREATE INDEX idx_module_content_public_access ON module_content (public_access, id) WHERE public_access = true;

-- Update RLS policy to allow public access to specific content
CREATE POLICY "Public can view content marked as public" 
ON module_content 
FOR SELECT 
USING (public_access = true AND is_active = true);