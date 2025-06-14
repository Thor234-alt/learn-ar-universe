
-- Create the missing 3-column unique index for student_progress upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS student_progress_student_id_module_id_content_id_key
  ON public.student_progress (student_id, module_id, content_id);

-- This will allow ON CONFLICT upserts matching (student_id, module_id, content_id).
