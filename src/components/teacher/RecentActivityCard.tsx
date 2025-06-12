
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

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

type RecentActivityCardProps = {
  studentProgress: StudentProgress[];
};

const RecentActivityCard = ({ studentProgress }: RecentActivityCardProps) => {
  return (
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
  );
};

export default RecentActivityCard;
