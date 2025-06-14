import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Module = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  created_at: string;
};

type Topic = {
  id: string;
  title: string;
  description: string;
  module_id: string;
  order_index: number;
};

// Use the generated type for Progress for better accuracy
type Progress = Database['public']['Tables']['student_progress']['Row'];

export const useStudentDashboard = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) {
      console.error('No user found');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting data fetch...');
      
      // Fetch modules
      console.log('Fetching modules...');
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (modulesError) {
        console.error('Modules error:', modulesError);
        throw modulesError;
      }
      console.log('Modules fetched:', modulesData?.length || 0);

      // Fetch topics
      console.log('Fetching topics...');
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('order_index', { ascending: true });

      if (topicsError) {
        console.error('Topics error:', topicsError);
        throw topicsError;
      }
      console.log('Topics fetched:', topicsData?.length || 0);

      // Fetch student progress
      console.log('Fetching student progress for user:', user.id);
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id);

      if (progressError) {
        console.error('Progress error:', progressError);
        throw progressError;
      }
      console.log('Progress fetched:', progressData?.length || 0);

      setModules(modulesData || []);
      setTopics(topicsData || []);
      setProgress(progressData || []);
      
      console.log('All data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: `Failed to load dashboard data: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Fetching dashboard data for user:', user.id);
      fetchData();
    }
  }, [user]);

  // Set up real-time listener for progress updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time listener for progress updates');
    
    const channel = supabase
      .channel('progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_progress',
          filter: `student_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Progress update received:', payload);
          // Refetch data when progress changes
          fetchData();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getModuleTopics = (moduleId: string) => {
    return topics.filter(topic => topic.module_id === moduleId);
  };

  const getTopicProgress = (topicId: string) => {
    // Find the summary progress row for the topic, where content_id is null
    return progress.find(p => p.topic_id === topicId && p.content_id === null);
  };

  const startTopic = async (topicId: string, moduleId: string) => {
    if (!user) {
      console.warn('No user found when starting topic');
      return true; // Allow content access even without auth
    }

    try {
      console.log('Starting topic:', topicId, 'for user:', user.id);
      
      // Check if a summary progress row already exists for this topic
      const existingProgress = progress.find(p => p.topic_id === topicId && p.content_id === null);
      
      if (!existingProgress) {
        const { error } = await supabase
          .from('student_progress')
          .upsert({
            student_id: user.id,
            topic_id: topicId,
            module_id: moduleId,
            progress_percentage: 0
          }, {
            onConflict: 'student_id,topic_id'
          });

        if (error) {
          console.error('Error starting topic:', error);
          // Don't throw error, just log it - allow content access
          toast({
            title: "Warning",
            description: "Progress tracking may not work properly, but you can still access the content.",
            variant: "default"
          });
        } else {
          toast({
            title: "Success",
            description: "Topic started successfully!"
          });
          // Refetch data to update progress
          fetchData();
        }
      }

      return true;
    } catch (error) {
      console.error('Error starting topic:', error);
      toast({
        title: "Warning",
        description: "Progress tracking may not work properly, but you can still access the content.",
        variant: "default"
      });
      return true; // Still allow content access
    }
  };

  return {
    modules,
    topics,
    progress,
    loading,
    getModuleTopics,
    getTopicProgress,
    startTopic,
    refetchData: fetchData
  };
};
