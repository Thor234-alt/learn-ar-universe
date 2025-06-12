
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

type ModuleStat = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  is_active: boolean;
  totalStudents: number;
  completedCount: number;
  inProgressCount: number;
};

type ModuleStatsCardProps = {
  moduleStats: ModuleStat[];
};

const ModuleStatsCard = ({ moduleStats }: ModuleStatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>Module Statistics</span>
        </CardTitle>
        <CardDescription>
          Overview of module engagement and completion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {moduleStats.map((module) => (
          <div key={module.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{module.title}</h4>
                <p className="text-sm text-gray-600 capitalize">
                  {module.difficulty_level} level
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {module.totalStudents} students
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{module.completedCount} completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span>{module.inProgressCount} in progress</span>
              </div>
            </div>
          </div>
        ))}
        
        {moduleStats.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No modules available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleStatsCard;
