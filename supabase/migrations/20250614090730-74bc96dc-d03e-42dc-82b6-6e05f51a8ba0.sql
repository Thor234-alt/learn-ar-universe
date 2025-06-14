
-- Create a table for module content
CREATE TABLE public.module_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'image', 'pdf', 'url')),
  content_data JSONB NOT NULL, -- Stores the actual content or reference
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for better performance
CREATE INDEX idx_module_content_module_id ON public.module_content(module_id);
CREATE INDEX idx_module_content_order ON public.module_content(module_id, order_index);

-- Enable RLS
ALTER TABLE public.module_content ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active content
CREATE POLICY "Anyone can view active content" 
  ON public.module_content 
  FOR SELECT 
  USING (is_active = true);

-- Allow admins to manage content
CREATE POLICY "Admins can manage content" 
  ON public.module_content 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'client')
    )
  );

-- Update student_progress table to track content completion
ALTER TABLE public.student_progress 
ADD COLUMN IF NOT EXISTS content_id UUID REFERENCES public.module_content(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS content_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0;

-- Create index for content progress
CREATE INDEX IF NOT EXISTS idx_student_progress_content ON public.student_progress(student_id, content_id);

-- Update the progress percentage calculation trigger (if needed)
CREATE OR REPLACE FUNCTION calculate_module_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update module progress based on completed content
  UPDATE public.student_progress 
  SET progress_percentage = (
    SELECT CASE 
      WHEN total_content = 0 THEN 100
      ELSE LEAST(100, ROUND((completed_content::DECIMAL / total_content::DECIMAL) * 100))
    END
    FROM (
      SELECT 
        COUNT(*) as total_content,
        COUNT(CASE WHEN sp.content_completed_at IS NOT NULL THEN 1 END) as completed_content
      FROM public.module_content mc
      LEFT JOIN public.student_progress sp ON mc.id = sp.content_id AND sp.student_id = NEW.student_id
      WHERE mc.module_id = NEW.module_id AND mc.is_active = true
    ) progress_calc
  ),
  updated_at = now()
  WHERE student_id = NEW.student_id 
    AND module_id = NEW.module_id 
    AND topic_id = NEW.topic_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for progress updates
DROP TRIGGER IF EXISTS update_module_progress_trigger ON public.student_progress;
CREATE TRIGGER update_module_progress_trigger
  AFTER INSERT OR UPDATE OF content_completed_at ON public.student_progress
  FOR EACH ROW
  EXECUTE FUNCTION calculate_module_progress();
