
-- 1. Add fields to support advanced progress tracking on student_progress
ALTER TABLE public.student_progress
ADD COLUMN IF NOT EXISTS content_progress_percentage NUMERIC DEFAULT 0, -- Allows 0-100 and fractional
ADD COLUMN IF NOT EXISTS engagement_metadata JSONB, -- For future expansion: JSON analytic details
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE, -- Last viewed timestamp
ADD COLUMN IF NOT EXISTS time_spent_active_seconds INTEGER DEFAULT 0; -- Per content_id row, tracks total active seconds

-- Optional: index for analytics
CREATE INDEX IF NOT EXISTS idx_student_progress_student_content ON public.student_progress(student_id, content_id);

-- 2. (Upgrade function & triggers for new progress logic if necessary.)
-- This step is needed if you want to aggregate or trigger on partial progress. For now, keep triggers as-is; frontend will update partial progress.

-- 3. No changes needed for policies if your existing security setup works for "student can read/write own progress".

