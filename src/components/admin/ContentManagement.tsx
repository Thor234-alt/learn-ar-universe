import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, Video, Image, FileIcon, Link, Box, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ContentList from "./ContentList";
import CreateContentDialog from "./CreateContentDialog";

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
  const { user } = useAuth();
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
  const [fileToUpload, setFileToUpload] = useState<File[]>([]);
  const [assetFileSource, setAssetFileSource] = useState<'url' | 'upload'>('url');
  const [assetUploading, setAssetUploading] = useState(false);
  const [assetUploadedUrl, setAssetUploadedUrl] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileToUpload(Array.from(e.target.files));
    } else {
      setFileToUpload([]);
    }
  };

  const handleAssetUpload = async (file: File, type: string) => {
    setAssetUploading(true);
    setAssetUploadedUrl('');
    try {
      // Use public bucket, e.g., 'public-assets'
      const folderId = `${user?.id || 'public'}/${type}s/${Date.now()}_${Math.floor(Math.random()*1e6)}`;
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${folderId}/${safeFileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      if (uploadError) {
        toast({ title: "Error", description: `Failed to upload file: ${uploadError.message}`, variant: "destructive" });
        setAssetUploading(false);
        return null;
      }
      const { data: publicUrlData } = supabase.storage.from('public-assets').getPublicUrl(uploadData.path);
      setAssetUploadedUrl(publicUrlData?.publicUrl || '');
      return publicUrlData?.publicUrl || '';
    } catch (error) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
      setAssetUploading(false);
      return null;
    } finally {
      setAssetUploading(false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) return;

    setLoading(true);
    try {
      let finalContentData: any;
      // 3D model remains special!
      if (contentForm.content_type === '3d_model') {
        // ... keep all 3D model upload code the same ...
        // ... keep unchanged code (as previously implemented for 3d models) ...
        if (!fileToUpload || fileToUpload.length === 0) {
          toast({ title: "Error", description: "Please select all relevant 3D model and asset files.", variant: "destructive" });
          setLoading(false);
          return;
        }
        const folderId = `${user?.id || 'shared_models'}/${Date.now()}_${Math.floor(Math.random()*1e6)}`;
        let urls: string[] = [];
        let rootModelUrl = "";
        let rootModelFilename = "";
        for (const modelFile of fileToUpload) {
          const safeFileName = modelFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filePath = `${folderId}/${safeFileName}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('3d_models')
            .upload(filePath, modelFile, {
              cacheControl: '3600',
              upsert: false,
            });
          if (uploadError) {
            console.error('Error uploading 3D model:', uploadError);
            toast({ title: "Error", description: `Failed to upload ${safeFileName}: ${uploadError.message}`, variant: "destructive" });
            continue;
          }
          const { data: publicUrlData } = supabase.storage.from('3d_models').getPublicUrl(uploadData.path);
          if (publicUrlData && publicUrlData.publicUrl) {
            urls.push(publicUrlData.publicUrl);
            if (
              safeFileName.toLowerCase().endsWith('.gltf') ||
              safeFileName.toLowerCase().endsWith('.glb')
            ) {
              rootModelUrl = publicUrlData.publicUrl;
              rootModelFilename = safeFileName;
            }
          }
        }
        if (!rootModelUrl) {
          toast({ title: "Error", description: "Please include at least one .gltf or .glb file.", variant: "destructive" });
          setLoading(false);
          return;
        }
        finalContentData = { rootModelUrl, urls, folderPrefix: folderId, rootModelFilename };
      } else {
        // Handle asset file uploads for supported types (video, image, pdf)
        const typesWithUploadSupport = ['video', 'image', 'pdf'];
        if (typesWithUploadSupport.includes(contentForm.content_type)) {
          if (assetFileSource === 'upload') {
            // Only one file allowed (enforced below)
            if (!fileToUpload || fileToUpload.length !== 1) {
              toast({ title: "Error", description: "Please select exactly one file.", variant: "destructive" });
              setLoading(false);
              return;
            }
            const uploadedUrl = await handleAssetUpload(fileToUpload[0], contentForm.content_type);
            if (!uploadedUrl) {
              setLoading(false);
              return;
            }
            finalContentData = { url: uploadedUrl };
          } else {
            // Use content_data input value as direct URL
            finalContentData = { url: contentForm.content_data };
          }
        } else {
          // Text and URL types remain the same logic
          switch (contentForm.content_type) {
            case 'text':
              finalContentData = { text: contentForm.content_data };
              break;
            case 'url':
              finalContentData = { url: contentForm.content_data };
              break;
            default:
              finalContentData = { content: contentForm.content_data }; // Fallback
          }
        }
      }

      const { error } = await supabase
        .from('module_content')
        .insert({
          module_id: selectedModuleId,
          title: contentForm.title,
          content_type: contentForm.content_type,
          content_data: finalContentData,
          description: contentForm.description,
          order_index: contentForm.order_index,
          is_active: true,
          created_by: user?.id
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
      setFileToUpload([]);
      setAssetUploadedUrl('');
      setAssetFileSource('url');
      setIsCreateContentOpen(false);
      fetchModuleContent();
    } catch (error: any) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: `Failed to create content: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setAssetUploading(false);
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
      case '3d_model': return <Box className="w-4 h-4" />;
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
        <CreateContentDialog
          isOpen={isCreateContentOpen}
          setIsOpen={setIsCreateContentOpen}
          selectedModuleId={selectedModuleId as string}
          refetchContent={fetchModuleContent}
        />
      </div>
      <ContentList
        contents={contents}
        loading={loading}
        selectedModule={selectedModule}
        deleteContent={deleteContent}
      />
    </div>
  );
};

export type { ModuleContent, Module };
export default ContentManagement;
