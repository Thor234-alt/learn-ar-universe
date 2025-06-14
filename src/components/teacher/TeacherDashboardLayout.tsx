
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { useTeacherData } from '@/hooks/useTeacherData';
import { getUniqueStudents, getModuleStats } from '@/utils/teacherDashboardUtils';
import StatsOverview from './StatsOverview';
import StudentProgressCard from './StudentProgressCard';
import ModuleStatsCard from './ModuleStatsCard';
import RecentActivityCard from './RecentActivityCard';
import ActiveModulesSection from './ActiveModulesSection';
import ContentViewerModal from './ContentViewerModal';
import { useState } from 'react';

const TeacherDashboardLayout = () => {
  const { user, profile } = useAuth();
  const { studentProgress, studentProfiles, modules, loading } = useTeacherData();
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

  const uniqueStudents = getUniqueStudents(studentProgress, studentProfiles);
  const moduleStats = getModuleStats(modules, studentProgress);
  const completedTopics = studentProgress.filter(p => p.progress_percentage === 100).length;

  const handleOpenContentViewer = (moduleId: string) => {
    setContentViewer({
      isOpen: true,
      moduleId,
      topicId: 'preview'
    });
  };

  const handleCloseContentViewer = () => {
    setContentViewer({
      isOpen: false,
      moduleId: '',
      topicId: ''
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

        <ActiveModulesSection modules={modules} onViewContent={handleOpenContentViewer} />

        <div className="grid gap-8 lg:grid-cols-2">
          <StudentProgressCard students={uniqueStudents} />
          <ModuleStatsCard moduleStats={moduleStats} />
        </div>

        <RecentActivityCard studentProgress={studentProgress} />
      </div>

      <ContentViewerModal 
        isOpen={contentViewer.isOpen}
        moduleId={contentViewer.moduleId}
        topicId={contentViewer.topicId}
        onClose={handleCloseContentViewer}
      />
    </div>
  );
};

export default TeacherDashboardLayout;
