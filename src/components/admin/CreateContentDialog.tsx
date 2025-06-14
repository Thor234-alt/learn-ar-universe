import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type ModuleContentForm = {
  title: string;
  content_type: string;
  content_data: string;
  description: string;
  order_index: number;
};

type CreateContentDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedModuleId: string;
  refetchContent: () => void;
};

const CreateContentDialog: React.FC<CreateContentDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedModuleId,
  refetchContent,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contentForm, setContentForm] = useState<ModuleContentForm>({
    title: "",
    content_type: "text",
    content_data: "",
    description: "",
    order_index: 0,
  });
  const [loading, setLoading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File[]>([]);
  const [assetFileSource, setAssetFileSource] = useState<"url" | "upload">("url");
  const [assetUploading, setAssetUploading] = useState(false);
  const [assetUploadedUrl, setAssetUploadedUrl] = useState("");

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
      setIsOpen(false);
      refetchContent();
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <Select 
              value={contentForm.content_type} 
              onValueChange={(value) => {
                setContentForm({...contentForm, content_type: value, content_data: ''});
                setFileToUpload([]);
                setAssetUploadedUrl('');
                setAssetFileSource('url');
              }}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="url">External Link</SelectItem>
                <SelectItem value="3d_model">3D Model (gLTF/GLB)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3D MODEL ONLY */}
          {contentForm.content_type === '3d_model' ? (
            <div>
              <Label htmlFor="content-file" className="text-white">
                3D Model Assets (.glb, .gltf, .bin, .jpg, .jpeg, .png, textures, etc)
              </Label>
              <Input
                id="content-file"
                type="file"
                multiple
                onChange={handleFileChange}
                className="bg-slate-700 border-slate-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                accept=".glb,.gltf,.bin,.jpg,.jpeg,.png,.webp,.svg,.bmp,.tga,.dds,.ktx,.ktx2"
                required
              />
              {fileToUpload && fileToUpload.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Selected: {fileToUpload.map(f => f.name).join(', ')}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Upload your main .gltf/.glb and any required .bin, texture, or asset files. All will be stored in a single folder to preserve relative paths.
              </p>
            </div>

          // VIDEO, IMAGE, PDF: Upload file or use URL
          ) : ['video', 'image', 'pdf'].includes(contentForm.content_type) ? (
            <div>
              <Label className="text-white mb-1 block">Source</Label>
              <div className="flex items-center space-x-4 mb-2">
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    checked={assetFileSource === 'url'}
                    onChange={() => {
                      setAssetFileSource('url');
                      setFileToUpload([]);
                      setAssetUploadedUrl('');
                    }}
                    className="mr-2"
                  />
                  URL
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    checked={assetFileSource === 'upload'}
                    onChange={() => {
                      setAssetFileSource('upload');
                      setFileToUpload([]);
                      setAssetUploadedUrl('');
                    }}
                    className="mr-2"
                  />
                  Upload File
                </label>
              </div>
              {assetFileSource === 'url' && (
                <div>
                  <Label htmlFor="content-data" className="text-white">{contentForm.content_type === 'video' ? 'Video' : contentForm.content_type === 'image' ? 'Image' : 'PDF'} URL</Label>
                  <Input
                    id="content-data"
                    type="url"
                    value={contentForm.content_data}
                    onChange={(e) => setContentForm({...contentForm, content_data: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="https://..."
                    required
                  />
                </div>
              )}
              {assetFileSource === 'upload' && (
                <div>
                  <Label htmlFor="asset-upload" className="text-white">
                    {contentForm.content_type[0].toUpperCase() + contentForm.content_type.slice(1)} File
                  </Label>
                  <Input
                    id="asset-upload"
                    type="file"
                    accept={
                      contentForm.content_type === 'video'
                        ? 'video/*'
                        : contentForm.content_type === 'pdf'
                        ? 'application/pdf'
                        : 'image/*'
                    }
                    multiple={false}
                    onChange={handleFileChange}
                    className="bg-slate-700 border-slate-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    required
                  />
                  {fileToUpload && fileToUpload.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Selected: {fileToUpload[0]?.name}
                    </p>
                  )}
                </div>
              )}
              {assetUploading && (
                <div className="text-orange-400 text-xs mt-1 flex items-center">
                  <Loader className="w-4 h-4 animate-spin mr-1" /> Uploading...
                </div>
              )}
              {assetUploadedUrl && (
                <div className="text-green-400 text-xs mt-1">
                  Uploaded! {assetUploadedUrl}
                </div>
              )}
            </div>

          // TEXT TYPE
          ) : contentForm.content_type === 'text' ? (
            <div>
              <Label htmlFor="content-data" className="text-white">Content</Label>
              <Textarea
                id="content-data"
                value={contentForm.content_data}
                onChange={(e) => setContentForm({...contentForm, content_data: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                rows={4}
                required
              />
            </div>

          // FALLBACK FOR EXT LINK
          ) : (
            <div>
              <Label htmlFor="content-data" className="text-white">URL</Label>
              <Input
                id="content-data"
                type="url"
                value={contentForm.content_data}
                onChange={(e) => setContentForm({...contentForm, content_data: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://..."
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="content-description" className="text-white">Description (Optional)</Label>
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
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading || assetUploading}>
            {loading ? 'Creating...' : 'Create Content'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContentDialog;
