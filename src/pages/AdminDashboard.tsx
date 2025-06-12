import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen, Users, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

type Module = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  syllabus: string;
  is_active: boolean;
  created_at: string;
};

type Teacher = {
  id: string;
  user_id: string;
  subject: string;
  department: string;
  hire_date: string;
  full_name?: string;
  email?: string;
};

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'modules' | 'teachers'>('modules');
  const { toast } = useToast();

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    syllabus: '',
    difficulty_level: 'beginner'
  });

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    email: '',
    fullName: '',
    subject: '',
    department: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (modulesError) throw modulesError;

      // Fetch teachers with their profile information
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (teachersError) throw teachersError;

      // Fetch profiles for the teachers
      if (teachersData && teachersData.length > 0) {
        const userIds = teachersData.map(teacher => teacher.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Merge teacher data with profile data
        const teachersWithProfiles = teachersData.map(teacher => {
          const profile = profilesData?.find(p => p.id === teacher.user_id);
          return {
            ...teacher,
            full_name: profile?.full_name || 'No name',
            email: profile?.email || 'No email'
          };
        });

        setTeachers(teachersWithProfiles);
      } else {
        setTeachers([]);
      }

      setModules(modulesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('modules')
        .insert({
          ...moduleForm,
          created_by: user?.id
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

      fetchData();
    } catch (error) {
      console.error('Error creating module:', error);
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive"
      });
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: teacherForm.email,
        password: 'temp123456', // Temporary password
        email_confirm: true,
        user_metadata: {
          full_name: teacherForm.fullName,
          role: 'teacher'
        }
      });

      if (authError) throw authError;

      // Then create the teacher profile
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
        description: "Teacher account created successfully!"
      });

      setTeacherForm({
        email: '',
        fullName: '',
        subject: '',
        department: ''
      });

      fetchData();
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast({
        title: "Error",
        description: "Failed to create teacher account",
        variant: "destructive"
      });
    }
  };

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

      fetchData();
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

      fetchData();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive"
      });
    }
  };

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
          <p className="text-gray-300">Manage modules and teachers</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button
            onClick={() => setActiveTab('modules')}
            variant={activeTab === 'modules' ? 'default' : 'outline'}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Modules
          </Button>
          <Button
            onClick={() => setActiveTab('teachers')}
            variant={activeTab === 'teachers' ? 'default' : 'outline'}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Users className="w-4 h-4 mr-2" />
            Teachers
          </Button>
        </div>

        {activeTab === 'modules' && (
          <div className="space-y-6">
            {/* Create Module Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Module
                </Button>
              </DialogTrigger>
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

            {/* Modules List */}
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
        )}

        {activeTab === 'teachers' && (
          <div className="space-y-6">
            {/* Create Teacher Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teacher
                </Button>
              </DialogTrigger>
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

            {/* Teachers List */}
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
