
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CreateTeacherDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateTeacherDialog = ({ isOpen, onOpenChange, onSuccess }: CreateTeacherDialogProps) => {
  const { toast } = useToast();
  
  const [teacherForm, setTeacherForm] = useState({
    email: '',
    fullName: '',
    subject: '',
    department: ''
  });

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create the user account with signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: teacherForm.email,
        password: 'temp123456',
        options: {
          data: {
            full_name: teacherForm.fullName,
            role: 'teacher',
            email: teacherForm.email
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create the teacher profile
        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({
            user_id: authData.user.id,
            subject: teacherForm.subject,
            department: teacherForm.department
          });

        if (teacherError) throw teacherError;

        toast({
          title: "Success",
          description: "Teacher account created successfully! They will receive a confirmation email."
        });

        setTeacherForm({
          email: '',
          fullName: '',
          subject: '',
          department: ''
        });

        onSuccess();
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast({
        title: "Error",
        description: "Failed to create teacher account",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Teacher</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new teacher account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={teacherForm.email}
              onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="fullName" className="text-white">Full Name</Label>
            <Input
              id="fullName"
              value={teacherForm.fullName}
              onChange={(e) => setTeacherForm({...teacherForm, fullName: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="subject" className="text-white">Subject</Label>
            <Input
              id="subject"
              value={teacherForm.subject}
              onChange={(e) => setTeacherForm({...teacherForm, subject: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="department" className="text-white">Department</Label>
            <Input
              id="department"
              value={teacherForm.department}
              onChange={(e) => setTeacherForm({...teacherForm, department: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
            Add Teacher
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeacherDialog;
