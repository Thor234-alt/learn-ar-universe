import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  QrCode, 
  Download, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  MoreHorizontal,
  Globe,
  Lock,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ModelService, ModelData } from '@/services/modelService';
import { QRCodeUtils } from '@/utils/qrCodeUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModelManagementProps {
  moduleId?: string;
}

const ModelManagement: React.FC<ModelManagementProps> = ({ moduleId }) => {
  const { toast } = useToast();
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    fetchModels();
  }, [moduleId]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('module_content')
        .select('*')
        .eq('content_type', '3d_model')
        .order('created_at', { ascending: false });

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const transformedModels = data.map(item => ModelService.transformToModelData(item));
      setModels(transformedModels);
    } catch (error: any) {
      console.error('Error fetching models:', error);
      toast({
        title: "Error",
        description: "Failed to fetch 3D models",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (model: ModelData) => {
    if (!model.qr_code_url) return;
    
    const link = document.createElement('a');
    link.href = model.qr_code_url;
    link.download = `qr-code-${model.title}.png`;
    link.click();
  };

  const copyARLink = async (model: ModelData) => {
    const arLink = QRCodeUtils.generateShareableUrl(model.id);
    await navigator.clipboard.writeText(arLink);
    
    toast({
      title: "AR link copied!",
      description: "Link copied to clipboard",
    });
  };

  const previewModel = (model: ModelData) => {
    const arLink = QRCodeUtils.generateShareableUrl(model.id);
    window.open(arLink, '_blank');
  };

  const togglePublicAccess = async (model: ModelData) => {
    try {
      const newPublicAccess = !model.public_access;
      
      const { error } = await supabase
        .from('module_content')
        .update({ public_access: newPublicAccess })
        .eq('id', model.id);

      if (error) {
        throw error;
      }

      // Update local state
      setModels(prev => prev.map(m => 
        m.id === model.id 
          ? { ...m, public_access: newPublicAccess }
          : m
      ));

      toast({
        title: "Access updated",
        description: `Model is now ${newPublicAccess ? 'public' : 'private'}`,
      });
    } catch (error: any) {
      console.error('Error updating access:', error);
      toast({
        title: "Error",
        description: "Failed to update model access",
        variant: "destructive",
      });
    }
  };

  const deleteModel = async (model: ModelData) => {
    if (!confirm(`Are you sure you want to delete "${model.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('module_content')
        .delete()
        .eq('id', model.id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setModels(prev => prev.filter(m => m.id !== model.id));

      toast({
        title: "Model deleted",
        description: `"${model.title}" has been deleted`,
      });
    } catch (error: any) {
      console.error('Error deleting model:', error);
      toast({
        title: "Error",
        description: "Failed to delete model",
        variant: "destructive",
      });
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'public' && model.public_access) ||
                         (filterType === 'private' && !model.public_access);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">3D Model Management</h2>
          <p className="text-gray-600">Manage your AR 3D models</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                {filterType === 'all' ? 'All' : filterType === 'public' ? 'Public' : 'Private'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                All Models
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('public')}>
                Public Models
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('private')}>
                Private Models
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Models List */}
      {filteredModels.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first 3D model to get started'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredModels.map((model) => (
            <Card key={model.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">{model.title}</h3>
                      <Badge variant={model.public_access ? "default" : "secondary"}>
                        {model.public_access ? (
                          <>
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    {model.description && (
                      <p className="text-gray-600 mb-2">{model.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Access count: {model.access_count}</span>
                      <span>•</span>
                      <span>ID: {model.id.slice(0, 8)}...</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => previewModel(model)}
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {model.qr_code_url && (
                      <Button
                        onClick={() => downloadQRCode(model)}
                        size="sm"
                        variant="outline"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyARLink(model)}>
                          Copy AR Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublicAccess(model)}>
                          Make {model.public_access ? 'Private' : 'Public'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteModel(model)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelManagement;