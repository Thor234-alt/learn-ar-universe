
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { useTeacherData } from '@/hooks/useTeacherData';
import { getUniqueStudents, getModuleStats } from '@/utils/teacherDashboardUtils';
import StatsOverview from '@/components/teacher/StatsOverview';
import StudentProgressCard from '@/components/teacher/StudentProgressCard';
import ModuleStatsCard from '@/components/teacher/ModuleStatsCard';
import RecentActivityCard from '@/components/teacher/RecentActivityCard';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Eye } from 'lucide-react';
import ModuleContentViewer from '@/components/student/ModuleContentViewer';

const TeacherDashboard = () => {
  const { user, profile } = useAuth();
  const { studentProgress, modules, loading } = useTeacherData();
  const [contentViewer, setContentViewer] = useState<{
    isOpen: boolean;
    moduleId: string;
    topicId: string;
  }>({
    isOpen: false,
    moduleId: '',
    topicId: ''
  });

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

  const uniqueStudents = getUniqueStudents(studentProgress);
  const moduleStats = getModuleStats(modules, studentProgress);
  const completedTopics = studentProgress.filter(p => p.progress_percentage === 100).length;

  const closeContentViewer = () => {
    setContentViewer({
      isOpen: false,
      moduleId: '',
      topicId: ''
    });
  };

  const viewModuleContent = (moduleId: string) => {
    setContentViewer({
      isOpen: true,
      moduleId: moduleId,
      topicId: 'preview' // Using a dummy topic id for preview
    });
  };

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

        <StatsOverview 
          totalStudents={uniqueStudents.length}
          totalModules={modules.length}
          completedTopics={completedTopics}
        />

        {/* Active Modules Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>Active Modules & Content</span>
              </CardTitle>
              <CardDescription>
                View and preview the learning modules and their content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                  <Card key={module.id} className="border border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{module.title}</h4>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded capitalize">
                          {module.difficulty_level}
                        </span>
                      </div>
                      {module.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {module.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${module.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {module.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <Button
                          onClick={() => viewModuleContent(module.id)}
                          variant="outline"
                          size="sm"
                          className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Content
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {modules.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active modules</h3>
                  <p className="text-gray-600">
                    Contact your administrator to create learning modules.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <StudentProgressCard students={uniqueStudents} />
          <ModuleStatsCard moduleStats={moduleStats} />
        </div>

        <RecentActivityCard studentProgress={studentProgress} />
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

export default TeacherDashboard;
