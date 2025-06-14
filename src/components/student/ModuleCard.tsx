
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
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
}

const ModuleCard = ({ module, topics, getTopicProgress, onStartTopic }: ModuleCardProps) => {
  const completedTopics = topics.filter(topic => {
    const topicProgress = getTopicProgress(topic.id);
    return topicProgress?.progress_percentage === 100;
  });

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
