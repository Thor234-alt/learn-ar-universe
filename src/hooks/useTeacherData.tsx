
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type StudentProgress = {
  id: string;
  student_id: string;
  module_id: string;
  topic_id: string;
  progress_percentage: number;
  content_id: string | null;
  content_progress_percentage: number | null;
  time_spent_active_seconds: number | null;
  engagement_metadata: any;
  completed_at: string | null;
  content_completed_at: string | null;
  created_at: string;
  updated_at: string;
  topic_title?: string;
  module_title?: string;
  student_name?: string;
  student_email?: string;
};

type Module = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  is_active: boolean;
};

type StudentProfile = {
  id: string;
  full_name: string | null;
  email: string;
};

export const useTeacherData = () => {
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch student progress
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .order('updated_at', { ascending: false });

      if (progressError) throw progressError;

      // Fetch topics to get topic titles
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id, title, module_id');

      if (topicsError) throw topicsError;

      // Fetch modules to get module titles
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch ALL student profiles (with role = 'student')
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student');

      if (profilesError) throw profilesError;

      // Merge all the data together for progress rows
      const enrichedProgress = progressData?.map(progress => {
        const topic = topicsData?.find(t => t.id === progress.topic_id);
        const module = modulesData?.find(m => m.id === progress.module_id);
        const profile = profilesData?.find(p => p.id === progress.student_id);
        
        return {
          ...progress,
          topic_title: topic?.title || 'Unknown Topic',
          module_title: module?.title || 'Unknown Module',
          student_name: profile?.full_name || 'Unknown Student',
          student_email: profile?.email || 'No email'
        };
      }) || [];

      setStudentProgress(enrichedProgress);
      setModules(modulesData || []);
      setStudentProfiles(profilesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    studentProgress,
    studentProfiles,
    modules,
    loading,
    refetch: fetchData
  };
};
