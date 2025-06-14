
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, Video, Image, FileIcon, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Module = {
  id: string;
  title: string;
};

type ModuleContent = {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
  content_data: any;
  description: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
};

type ContentManagementProps = {
  selectedModuleId: string | null;
  modules: Module[];
};

const ContentManagement = ({ selectedModuleId, modules }: ContentManagementProps) => {
  const [contents, setContents] = useState<ModuleContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateContentOpen, setIsCreateContentOpen] = useState(false);
  const { toast } = useToast();

  // Content form state
  const [contentForm, setContentForm] = useState({
    title: '',
    content_type: 'text',
    content_data: '',
    description: '',
    order_index: 0
  });

  useEffect(() => {
    if (selectedModuleId) {
      fetchModuleContent();
    }
  }, [selectedModuleId]);

  const fetchModuleContent = async () => {
    if (!selectedModuleId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('module_content')
        .select('*')
        .eq('module_id', selectedModuleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load module content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) return;

    try {
      let contentData;
      
      // Process content based on type
      switch (contentForm.content_type) {
        case 'text':
          contentData = { text: contentForm.content_data };
          break;
        case 'video':
          contentData = { url: contentForm.content_data };
          break;
        case 'url':
          contentData = { url: contentForm.content_data };
          break;
        case 'image':
          contentData = { url: contentForm.content_data };
          break;
        case 'pdf':
          contentData = { url: contentForm.content_data };
          break;
        default:
          contentData = { content: contentForm.content_data };
      }

      const { error } = await supabase
        .from('module_content')
        .insert({
          module_id: selectedModuleId,
          title: contentForm.title,
          content_type: contentForm.content_type,
          content_data: contentData,
          description: contentForm.description,
          order_index: contentForm.order_index
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content created successfully!"
      });

      setContentForm({
        title: '',
        content_type: 'text',
        content_data: '',
        description: '',
        order_index: 0
      });

      setIsCreateContentOpen(false);
      fetchModuleContent();
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive"
      });
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('module_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully!"
      });

      fetchModuleContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive"
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'pdf': return <FileIcon className="w-4 h-4" />;
      case 'url': return <Link className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!selectedModuleId) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Select a module to manage its content</p>
        </CardContent>
      </Card>
    );
  }

  const selectedModule = modules.find(m => m.id === selectedModuleId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Content for: {selectedModule?.title}
          </h3>
          <p className="text-gray-400">Manage learning materials and resources</p>
        </div>
        
        <Dialog open={isCreateContentOpen} onOpenChange={setIsCreateContentOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Content</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create new learning content for this module.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateContent} className="space-y-4">
              <div>
                <Label htmlFor="content-title" className="text-white">Title</Label>
                <Input
                  id="content-title"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content-type" className="text-white">Content Type</Label>
                <Select value={contentForm.content_type} onValueChange={(value) => setContentForm({...contentForm, content_type: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="text">Text Content</SelectItem>
                    <SelectItem value="video">Video URL</SelectItem>
                    <SelectItem value="image">Image URL</SelectItem>
                    <SelectItem value="pdf">PDF URL</SelectItem>
                    <SelectItem value="url">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content-data" className="text-white">
                  {contentForm.content_type === 'text' ? 'Content' : 'URL'}
                </Label>
                {contentForm.content_type === 'text' ? (
                  <Textarea
                    id="content-data"
                    value={contentForm.content_data}
                    onChange={(e) => setContentForm({...contentForm, content_data: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={4}
                    required
                  />
                ) : (
                  <Input
                    id="content-data"
                    type="url"
                    value={contentForm.content_data}
                    onChange={(e) => setContentForm({...contentForm, content_data: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="https://..."
                    required
                  />
                )}
              </div>
              <div>
                <Label htmlFor="content-description" className="text-white">Description</Label>
                <Textarea
                  id="content-description"
                  value={contentForm.description}
                  onChange={(e) => setContentForm({...contentForm, description: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="order-index" className="text-white">Order Index</Label>
                <Input
                  id="order-index"
                  type="number"
                  value={contentForm.order_index}
                  onChange={(e) => setContentForm({...contentForm, order_index: parseInt(e.target.value) || 0})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                Create Content
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {contents.map((content) => (
            <Card key={content.id} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getContentIcon(content.content_type)}
                    <CardTitle className="text-white text-lg">{content.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 capitalize bg-slate-700 px-2 py-1 rounded">
                      {content.content_type}
                    </span>
                    <Button
                      onClick={() => deleteContent(content.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {content.description && (
                  <CardDescription className="text-gray-400">
                    {content.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-400">Order: </span>
                    <span className="text-white">{content.order_index}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Status: </span>
                    <span className={content.is_active ? "text-green-400" : "text-gray-400"}>
                      {content.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {content.content_type === 'text' && (
                    <div className="text-sm">
                      <span className="text-gray-400">Preview: </span>
                      <p className="text-white mt-1 p-2 bg-slate-700 rounded text-xs">
                        {content.content_data?.text?.substring(0, 100)}...
                      </p>
                    </div>
                  )}
                  {content.content_type !== 'text' && (
                    <div className="text-sm">
                      <span className="text-gray-400">URL: </span>
                      <a 
                        href={content.content_data?.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 break-all"
                      >
                        {content.content_data?.url}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {contents.length === 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No content yet</h3>
                <p className="text-gray-400 mb-4">
                  Start by adding some learning content to this module.
                </p>
                <Button 
                  onClick={() => setIsCreateContentOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Content
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
