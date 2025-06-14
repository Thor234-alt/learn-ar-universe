
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';
import TopicCard from './TopicCard';

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
  const completedTopics = topics.filter(topic => {
    const topicProgress = getTopicProgress(topic.id);
    return topicProgress?.progress_percentage === 100;
  });

  const handleViewContent = () => {
    if (onViewModuleContent) {
      // Use the first topic's ID if available, otherwise use empty string
      const firstTopicId = topics.length > 0 ? topics[0].id : '';
      onViewModuleContent(module.id);
      // Also trigger the topic start for the first topic to open content viewer
      if (firstTopicId) {
        onStartTopic(firstTopicId, module.id);
      }
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
              {completedTopics.length} / {topics.length} completed
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
