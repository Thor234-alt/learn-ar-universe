
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreateModuleDialog from './CreateModuleDialog';

type Module = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  syllabus: string;
  is_active: boolean;
  created_at: string;
};

interface ModuleManagementProps {
  modules: Module[];
  onModulesChange: () => void;
  onSelectModule: (moduleId: string) => void;
  onSwitchToContent: () => void;
}

const ModuleManagement = ({ modules, onModulesChange, onSelectModule, onSwitchToContent }: ModuleManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);

  const toggleModuleStatus = async (moduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ is_active: !currentStatus })
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Module ${!currentStatus ? 'activated' : 'deactivated'} successfully!`
      });

      onModulesChange();
    } catch (error) {
      console.error('Error updating module:', error);
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive"
      });
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Module deleted successfully!"
      });

      onModulesChange();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive"
      });
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModuleOpen(false);
    onModulesChange();
  };

  return (
    <div className="space-y-6">
      <CreateModuleDialog
        isOpen={isCreateModuleOpen}
        onOpenChange={setIsCreateModuleOpen}
        onSuccess={handleCreateSuccess}
        user={user}
      />

      <Button
        onClick={() => setIsCreateModuleOpen(true)}
        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Create Module
      </Button>

      <div className="grid gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{module.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {module.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => {
                      onSelectModule(module.id);
                      onSwitchToContent();
                    }}
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Content
                  </Button>
                  <Button
                    onClick={() => toggleModuleStatus(module.id, module.is_active)}
                    variant="outline"
                    size="sm"
                    className={module.is_active ? "border-green-500 text-green-500" : "border-gray-500 text-gray-500"}
                  >
                    {module.is_active ? "Active" : "Inactive"}
                  </Button>
                  <Button
                    onClick={() => deleteModule(module.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Difficulty: </span>
                  <span className="text-white capitalize">{module.difficulty_level}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span className={module.is_active ? "text-green-400" : "text-gray-400"}>
                    {module.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              {module.syllabus && (
                <div className="mt-4">
                  <span className="text-gray-400 text-sm">Syllabus: </span>
                  <p className="text-white text-sm mt-1">{module.syllabus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModuleManagement;
