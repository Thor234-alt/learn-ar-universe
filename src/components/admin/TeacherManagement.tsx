
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreateTeacherDialog from './CreateTeacherDialog';

type Teacher = {
  id: string;
  user_id: string;
  subject: string;
  department: string;
  hire_date: string;
  full_name?: string;
  email?: string;
};

interface TeacherManagementProps {
  teachers: Teacher[];
  onTeachersChange: () => void;
}

const TeacherManagement = ({ teachers, onTeachersChange }: TeacherManagementProps) => {
  const { toast } = useToast();
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateTeacherOpen(false);
    onTeachersChange();
  };

  return (
    <div className="space-y-6">
      <CreateTeacherDialog
        isOpen={isCreateTeacherOpen}
        onOpenChange={setIsCreateTeacherOpen}
        onSuccess={handleCreateSuccess}
      />

      <Button
        onClick={() => setIsCreateTeacherOpen(true)}
        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Teacher
      </Button>

      <div className="grid gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {teacher.full_name}
                  </h3>
                  <p className="text-gray-400">{teacher.email}</p>
                  <div className="mt-2 space-y-1">
                    {teacher.subject && (
                      <div className="text-sm">
                        <span className="text-gray-400">Subject: </span>
                        <span className="text-white">{teacher.subject}</span>
                      </div>
                    )}
                    {teacher.department && (
                      <div className="text-sm">
                        <span className="text-gray-400">Department: </span>
                        <span className="text-white">{teacher.department}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Joined: {new Date(teacher.hire_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherManagement;
