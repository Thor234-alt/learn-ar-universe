
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { useTeacherData } from '@/hooks/useTeacherData';
import { getUniqueStudents, getModuleStats } from '@/utils/teacherDashboardUtils';
import StatsOverview from '@/components/teacher/StatsOverview';
import StudentProgressCard from '@/components/teacher/StudentProgressCard';
import ModuleStatsCard from '@/components/teacher/ModuleStatsCard';
import RecentActivityCard from '@/components/teacher/RecentActivityCard';

const TeacherDashboard = () => {
  const { user, profile } = useAuth();
  const { studentProgress, modules, loading } = useTeacherData();

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

        <div className="grid gap-8 lg:grid-cols-2">
          <StudentProgressCard students={uniqueStudents} />
          <ModuleStatsCard moduleStats={moduleStats} />
        </div>

        <RecentActivityCard studentProgress={studentProgress} />
      </div>
    </div>
  );
};

export default TeacherDashboard;
