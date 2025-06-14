
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

const COLORS = ['#10b981', '#f59e42', '#818cf8'];

const StudentProgressBarChart = ({ students }: { students: Student[] }) => {
  // Prepare data for progress bands
  const data = [
    { name: '0-19%', count: 0 },
    { name: '20-39%', count: 0 },
    { name: '40-59%', count: 0 },
    { name: '60-79%', count: 0 },
    { name: '80-99%', count: 0 },
    { name: '100%', count: 0 }
  ];
  students.forEach(student => {
    const ap = student.averageProgress || 0;
    if (ap === 100) data[5].count++;
    else if (ap >= 80) data[4].count++;
    else if (ap >= 60) data[3].count++;
    else if (ap >= 40) data[2].count++;
    else if (ap >= 20) data[1].count++;
    else data[0].count++;
  });

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} tickCount={4} />
          <Tooltip />
          <Bar dataKey="count" fill="#a78bfa" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-500 mt-1 text-right">Number of students per progress band</div>
    </div>
  );
};

const StudentProgressPieChart = ({ students }: { students: Student[] }) => {
  // Students grouped into: "Completed", "In Progress", "Not Started"
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  students.forEach(student => {
    if (student.averageProgress === 100) completed++;
    else if (student.averageProgress > 0) inProgress++;
    else notStarted++;
  });
  const pieData = [
    { name: "Completed", value: completed },
    { name: "In Progress", value: inProgress },
    { name: "Not Started", value: notStarted }
  ];
  return (
    <div style={{ width: "100%", height: 140 }}>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            dataKey="value"
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={45}
            fill="#8884d8"
            label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
          >
            {pieData.map((entry, idx) => (
              <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-500 mt-1 text-right">
        Overall student progress distribution
      </div>
    </div>
  );
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
          Track individual student learning progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {students.length > 0 && (
          <>
            <StudentProgressPieChart students={students} />
            <StudentProgressBarChart students={students} />
          </>
        )}
        <div className="space-y-2">
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
        </div>
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
