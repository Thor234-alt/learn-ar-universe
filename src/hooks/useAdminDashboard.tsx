
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Module = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  syllabus: string;
  is_active: boolean;
  created_at: string;
};

type Teacher = {
  id: string;
  user_id: string;
  subject: string;
  department: string;
  hire_date: string;
  full_name?: string;
  email?: string;
};

export const useAdminDashboard = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (modulesError) throw modulesError;

      // Fetch teachers with their profile information
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (teachersError) throw teachersError;

      // Fetch profiles for the teachers
      if (teachersData && teachersData.length > 0) {
        const userIds = teachersData.map(teacher => teacher.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Merge teacher data with profile data
        const teachersWithProfiles = teachersData.map(teacher => {
          const profile = profilesData?.find(p => p.id === teacher.user_id);
          return {
            ...teacher,
            full_name: profile?.full_name || 'No name',
            email: profile?.email || 'No email'
          };
        });

        setTeachers(teachersWithProfiles);
      } else {
        setTeachers([]);
      }

      setModules(modulesData || []);
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
    modules,
    teachers,
    loading,
    fetchData
  };
};
