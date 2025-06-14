
-- Drop partial unique indexes created previously if they exist
DROP INDEX IF EXISTS student_progress_student_id_module_id_content_id_key;
DROP INDEX IF EXISTS student_progress_student_id_module_id_topic_id_content_id_key;

-- Create a full unique index covering all upsert cases for content-level progress tracking
CREATE UNIQUE INDEX IF NOT EXISTS student_progress_student_id_module_id_topic_id_content_id_full_key
  ON public.student_progress (student_id, module_id, topic_id, content_id);

-- Optionally keep the existing other unique indexes (like student_id, topic_id for topic summary rows)
