
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreateModuleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  user: any;
}

const CreateModuleDialog = ({ isOpen, onOpenChange, onSuccess, user }: CreateModuleDialogProps) => {
  const { toast } = useToast();
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    syllabus: '',
    difficulty_level: 'beginner'
  });

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create modules",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('modules')
        .insert({
          title: moduleForm.title,
          description: moduleForm.description,
          syllabus: moduleForm.syllabus,
          difficulty_level: moduleForm.difficulty_level,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Module created successfully!"
      });

      setModuleForm({
        title: '',
        description: '',
        syllabus: '',
        difficulty_level: 'beginner'
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating module:', error);
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Module</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new learning module to the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">Title</Label>
            <Input
              id="title"
              value={moduleForm.title}
              onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={moduleForm.description}
              onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="syllabus" className="text-white">Syllabus</Label>
            <Textarea
              id="syllabus"
              value={moduleForm.syllabus}
              onChange={(e) => setModuleForm({...moduleForm, syllabus: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="difficulty" className="text-white">Difficulty Level</Label>
            <Select value={moduleForm.difficulty_level} onValueChange={(value) => setModuleForm({...moduleForm, difficulty_level: value})}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
            Create Module
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModuleDialog;
