
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ContentManagement from '@/components/admin/ContentManagement';
import ModuleManagement from '@/components/admin/ModuleManagement';
import TeacherManagement from '@/components/admin/TeacherManagement';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const { modules, teachers, loading, fetchData } = useAdminDashboard();
  const [activeTab, setActiveTab] = useState<'modules' | 'teachers' | 'content'>('modules');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Navbar />
        <div className="container mx-auto px-6 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      <div className="container mx-auto px-6 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-300">
            Welcome back, {profile?.full_name || user?.email}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button
            onClick={() => setActiveTab('modules')}
            variant={activeTab === 'modules' ? 'default' : 'outline'}
            className={activeTab === 'modules' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Modules
          </Button>
          <Button
            onClick={() => setActiveTab('content')}
            variant={activeTab === 'content' ? 'default' : 'outline'}
            className={activeTab === 'content' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'}
          >
            <FileText className="w-4 h-4 mr-2" />
            Content
          </Button>
          <Button
            onClick={() => setActiveTab('teachers')}
            variant={activeTab === 'teachers' ? 'default' : 'outline'}
            className={activeTab === 'teachers' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'}
          >
            <Users className="w-4 h-4 mr-2" />
            Teachers
          </Button>
        </div>

        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Module Selector for Content Management */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Select Module</CardTitle>
                <CardDescription className="text-gray-400">
                  Choose a module to manage its content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedModuleId || ''} onValueChange={setSelectedModuleId}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <ContentManagement 
              selectedModuleId={selectedModuleId} 
              modules={modules}
            />
          </div>
        )}

        {activeTab === 'modules' && (
          <ModuleManagement
            modules={modules}
            onModulesChange={fetchData}
            onSelectModule={setSelectedModuleId}
            onSwitchToContent={() => setActiveTab('content')}
          />
        )}

        {activeTab === 'teachers' && (
          <TeacherManagement
            teachers={teachers}
            onTeachersChange={fetchData}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
