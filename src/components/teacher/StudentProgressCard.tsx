
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users } from 'lucide-react';

type Student = {
  id: string;
  name: string;
  email: string;
  averageProgress: number;
  completedTopics: number;
  totalTopics: number;
};

type StudentProgressCardProps = {
  students: Student[];
};

const StudentProgressCard = ({ students }: StudentProgressCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Student Progress</span>
        </CardTitle>
        <CardDescription>
          Track individual student learning progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {students.map((student) => (
          <div key={student.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{student.name}</h4>
                <p className="text-sm text-gray-600">{student.email}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {student.averageProgress}%
                </div>
                <div className="text-xs text-gray-600">
                  {student.completedTopics}/{student.totalTopics} completed
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${student.averageProgress}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        {students.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No student progress data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentProgressCard;
