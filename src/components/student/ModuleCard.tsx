
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';
import TopicCard from './TopicCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

interface ModuleCardProps {
  module: Module;
  topics: Topic[];
  getTopicProgress: (topicId: string) => Progress | undefined;
  onStartTopic: (topicId: string, moduleId: string) => void;
  onViewModuleContent?: (moduleId: string) => void;
}

const ModuleCard = ({ module, topics, getTopicProgress, onStartTopic, onViewModuleContent }: ModuleCardProps) => {
  const { user } = useAuth();
  const [moduleContentStats, setModuleContentStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    fetchModuleContentStats();
  }, [module.id, user]);

  const fetchModuleContentStats = async () => {
    if (!user) return;

    try {
      // Get total content count for this module
      const { data: contentData, error: contentError } = await supabase
        .from('module_content')
        .select('id')
        .eq('module_id', module.id)
        .eq('is_active', true);

      if (contentError) {
        console.error('Error fetching content count:', contentError);
        return;
      }

      const totalContent = contentData?.length || 0;

      // Get completed content count for this module
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select('content_id')
        .eq('student_id', user.id)
        .eq('module_id', module.id)
        .not('content_completed_at', 'is', null)
        .not('content_id', 'is', null);

      if (progressError) {
        console.error('Error fetching progress count:', progressError);
        return;
      }

      const completedContent = progressData?.length || 0;

      setModuleContentStats({
        completed: completedContent,
        total: totalContent
      });

      console.log(`Module ${module.title} stats:`, { completed: completedContent, total: totalContent });
    } catch (error) {
      console.error('Error fetching module content stats:', error);
    }
  };

  const handleViewContent = () => {
    if (onViewModuleContent) {
      onViewModuleContent(module.id);
    }
  };

  return (
    <Card className="overflow-hidden">
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
              {moduleContentStats.completed} / {moduleContentStats.total} content completed
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {module.difficulty_level}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button 
            onClick={handleViewContent}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            View Module Content
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              progress={getTopicProgress(topic.id)}
              onStartTopic={onStartTopic}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
