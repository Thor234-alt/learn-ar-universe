
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Module = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  is_active: boolean;
};

type ActiveModulesSectionProps = {
  modules: Module[];
  onViewContent: (moduleId: string) => void;
};

const ActiveModulesSection = ({ modules, onViewContent }: ActiveModulesSectionProps) => {
  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Active Modules & Content</span>
          </CardTitle>
          <CardDescription>
            View and preview the learning modules and their content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Card key={module.id} className="border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{module.title}</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded capitalize">
                      {module.difficulty_level}
                    </span>
                  </div>
                  {module.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {module.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${module.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {module.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      onClick={() => onViewContent(module.id)}
                      variant="outline"
                      size="sm"
                      className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {modules.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active modules</h3>
              <p className="text-gray-600">
                Contact your administrator to create learning modules.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveModulesSection;
