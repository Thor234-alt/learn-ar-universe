
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Play } from 'lucide-react';

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

interface TopicCardProps {
  topic: Topic;
  progress?: Progress;
  onStartTopic: (topicId: string, moduleId: string) => void;
}

const TopicCard = ({ topic, progress, onStartTopic }: TopicCardProps) => {
  const isCompleted = progress?.progress_percentage === 100;
  const isStarted = progress && progress.progress_percentage > 0;

  return (
    <Card className="border border-gray-200">
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
        {progress && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progress.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}
        <Button
          onClick={() => onStartTopic(topic.id, topic.module_id)}
          className="w-full"
          variant={isCompleted ? "outline" : "default"}
          size="sm"
        >
          {isCompleted ? "Review" : isStarted ? "Continue" : "Start"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TopicCard;
