
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import Navbar from '@/components/Navbar';
import ModuleContentViewer from '@/components/student/ModuleContentViewer';
import WelcomeHeader from '@/components/student/WelcomeHeader';
import ModuleCard from '@/components/student/ModuleCard';
import EmptyModulesState from '@/components/student/EmptyModulesState';
import LoadingSpinner from '@/components/student/LoadingSpinner';

const StudentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    modules,
    loading,
    getModuleTopics,
    getTopicProgress,
    startTopic,
    refetchData
  } = useStudentDashboard();

  const [contentViewer, setContentViewer] = useState<{
    isOpen: boolean;
    moduleId: string;
    topicId: string;
  }>({
    isOpen: false,
    moduleId: '',
    topicId: ''
  });

  const handleStartTopic = async (topicId: string, moduleId: string) => {
    console.log('Starting topic:', topicId, 'for module:', moduleId);
    
    // Always open the content viewer, regardless of startTopic success
    // This allows students to access content even if progress tracking fails
    setContentViewer({
      isOpen: true,
      moduleId: moduleId,
      topicId: topicId
    });

    // Try to update progress, but don't block content access if it fails
    try {
      await startTopic(topicId, moduleId);
    } catch (error) {
      console.error('Failed to update progress, but allowing content access:', error);
    }
  };

  const closeContentViewer = () => {
    setContentViewer({
      isOpen: false,
      moduleId: '',
      topicId: ''
    });
    // Refetch data to get updated progress
    refetchData();
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="container mx-auto px-6 pt-24">
          <LoadingSpinner />
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
          <LoadingSpinner message="Loading dashboard data..." />
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
        <WelcomeHeader />

        <div className="grid gap-6">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              topics={getModuleTopics(module.id)}
              getTopicProgress={getTopicProgress}
              onStartTopic={handleStartTopic}
            />
          ))}
        </div>

        {modules.length === 0 && <EmptyModulesState />}
      </div>

      {/* Content Viewer Modal */}
      {contentViewer.isOpen && (
        <ModuleContentViewer
          moduleId={contentViewer.moduleId}
          topicId={contentViewer.topicId}
          isOpen={contentViewer.isOpen}
          onClose={closeContentViewer}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
