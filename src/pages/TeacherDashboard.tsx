import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

type StudentProgress = {
  id: string;
  student_id: string;
  module_id: string;
  topic_id: string;
  progress_percentage: number;
  completed_at: string | null;
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

const TeacherDashboard = () => {
  const { user, profile } = useAuth();
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

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

      // Fetch profiles to get student names
      const studentIds = progressData?.map(p => p.student_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Merge all the data together
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

  const getUniqueStudents = () => {
    const uniqueStudents = new Map();
    studentProgress.forEach(progress => {
      if (!uniqueStudents.has(progress.student_id)) {
        uniqueStudents.set(progress.student_id, {
          id: progress.student_id,
          name: progress.student_name || 'No name',
          email: progress.student_email || 'No email',
          totalProgress: 0,
          completedTopics: 0,
          totalTopics: 0
        });
      }
      
      const student = uniqueStudents.get(progress.student_id);
      student.totalTopics += 1;
      student.totalProgress += progress.progress_percentage;
      if (progress.progress_percentage === 100) {
        student.completedTopics += 1;
      }
    });

    // Calculate average progress
    uniqueStudents.forEach(student => {
      student.averageProgress = student.totalTopics > 0 ? 
        Math.round(student.totalProgress / student.totalTopics) : 0;
    });

    return Array.from(uniqueStudents.values());
  };

  const getModuleStats = () => {
    const moduleStats = new Map();
    
    modules.forEach(module => {
      moduleStats.set(module.id, {
        ...module,
        totalStudents: 0,
        completedCount: 0,
        inProgressCount: 0
      });
    });

    studentProgress.forEach(progress => {
      if (moduleStats.has(progress.module_id)) {
        const stats = moduleStats.get(progress.module_id);
        stats.totalStudents += 1;
        if (progress.progress_percentage === 100) {
          stats.completedCount += 1;
        } else if (progress.progress_percentage > 0) {
          stats.inProgressCount += 1;
        }
      }
    });

    return Array.from(moduleStats.values());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="container mx-auto px-6 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const uniqueStudents = getUniqueStudents();
  const moduleStats = getModuleStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {profile?.full_name || user?.email}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{uniqueStudents.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Modules</p>
                  <p className="text-3xl font-bold text-gray-900">{modules.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Topics</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {studentProgress.filter(p => p.progress_percentage === 100).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Progress */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Student Progress</span>
              </CardTitle>
              <CardDescription>
                Track individual student learning progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uniqueStudents.map((student) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {student.averageProgress}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {student.completedTopics}/{student.totalTopics} completed
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${student.averageProgress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {uniqueStudents.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No student progress data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Module Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Module Statistics</span>
              </CardTitle>
              <CardDescription>
                Overview of module engagement and completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {moduleStats.map((module) => (
                <div key={module.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{module.title}</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {module.difficulty_level} level
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {module.totalStudents} students
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{module.completedCount} completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span>{module.inProgressCount} in progress</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {moduleStats.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No modules available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest student progress updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentProgress.slice(0, 10).map((progress) => (
                <div key={progress.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {progress.student_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {progress.topic_title} - {progress.module_title}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {progress.progress_percentage}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(progress.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {studentProgress.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
