
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, CheckCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import ModuleContentViewer from '@/components/student/ModuleContentViewer';

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

type Progress = {
  topic_id: string;
  progress_percentage: number;
  completed_at: string | null;
};

const StudentDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentViewer, setContentViewer] = useState<{
    isOpen: boolean;
    moduleId: string;
    topicId: string;
  }>({
    isOpen: false,
    moduleId: '',
    topicId: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Only fetch data when user is authenticated and not in auth loading state
    if (!authLoading && user) {
      console.log('Fetching dashboard data for user:', user.id);
      fetchData();
    } else if (!authLoading && !user) {
      // User is not authenticated
      setLoading(false);
    }
  }, [user, authLoading]);

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

  const getModuleTopics = (moduleId: string) => {
    return topics.filter(topic => topic.module_id === moduleId);
  };

  const getTopicProgress = (topicId: string) => {
    return progress.find(p => p.topic_id === topicId);
  };

  const startTopic = async (topicId: string, moduleId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to start a topic",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Starting topic:', topicId, 'for user:', user.id);
      
      const { error } = await supabase
        .from('student_progress')
        .upsert({
          student_id: user.id,
          topic_id: topicId,
          module_id: moduleId,
          progress_percentage: 0
        });

      if (error) {
        console.error('Error starting topic:', error);
        throw error;
      }

      // Open content viewer
      setContentViewer({
        isOpen: true,
        moduleId: moduleId,
        topicId: topicId
      });

      toast({
        title: "Success",
        description: "Topic started successfully!"
      });

      fetchData();
    } catch (error) {
      console.error('Error starting topic:', error);
      toast({
        title: "Error",
        description: `Failed to start topic: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const closeContentViewer = () => {
    setContentViewer({
      isOpen: false,
      moduleId: '',
      topicId: ''
    });
    // Refresh data to update progress
    fetchData();
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="container mx-auto px-6 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="container mx-auto px-6 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="container mx-auto px-6 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your dashboard</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || user?.email}!
          </h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        <div className="grid gap-6">
          {modules.map((module) => {
            const moduleTopics = getModuleTopics(module.id);
            const completedTopics = moduleTopics.filter(topic => {
              const topicProgress = getTopicProgress(topic.id);
              return topicProgress?.progress_percentage === 100;
            });

            return (
              <Card key={module.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span>{module.title}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {module.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {completedTopics.length} / {moduleTopics.length} completed
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {module.difficulty_level}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {moduleTopics.map((topic) => {
                      const topicProgress = getTopicProgress(topic.id);
                      const isCompleted = topicProgress?.progress_percentage === 100;
                      const isStarted = topicProgress && topicProgress.progress_percentage > 0;

                      return (
                        <Card key={topic.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{topic.title}</h4>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : isStarted ? (
                                <Clock className="w-5 h-5 text-yellow-600" />
                              ) : (
                                <Play className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            {topic.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {topic.description}
                              </p>
                            )}
                            {topicProgress && (
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{topicProgress.progress_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${topicProgress.progress_percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            <Button
                              onClick={() => startTopic(topic.id, module.id)}
                              className="w-full"
                              variant={isCompleted ? "outline" : "default"}
                              size="sm"
                            >
                              {isCompleted ? "Review" : isStarted ? "Continue" : "Start"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {modules.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules available</h3>
              <p className="text-gray-600">
                Check back later for new learning modules.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content Viewer Modal */}
      <ModuleContentViewer
        moduleId={contentViewer.moduleId}
        topicId={contentViewer.topicId}
        isOpen={contentViewer.isOpen}
        onClose={closeContentViewer}
      />
    </div>
  );
};

export default StudentDashboard;
