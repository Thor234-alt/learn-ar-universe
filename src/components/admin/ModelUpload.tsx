import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Eye, QrCode, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeUtils } from '@/utils/qrCodeUtils';

interface ModelUploadProps {
  moduleId: string;
  onSuccess?: () => void;
}

const ModelUpload: React.FC<ModelUploadProps> = ({ moduleId, onSuccess }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedModelId, setUploadedModelId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subInfo: '',
    publicAccess: false,
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.glb', '.gltf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please select a .glb or .gltf file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the 3D model",
        variant: "destructive",
      });
      return;
    }

    await uploadModel(file);
  };

  const uploadModel = async (file: File) => {
    try {
      setIsUploading(true);

      // Create unique folder for this upload
      const timestamp = Date.now();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const folderPrefix = `${userId}/${timestamp}_${Math.floor(Math.random() * 1000000)}`;
      const fileName = file.name;
      const filePath = `${folderPrefix}/${fileName}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('3d_models')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('3d_models')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Create content data object
      const contentData = {
        rootModelUrl: urlData.publicUrl,
        rootModelFilename: fileName,
        folderPrefix: folderPrefix,
        urls: [urlData.publicUrl],
      };

      // Insert model record into database
      const { data: contentRecord, error: dbError } = await supabase
        .from('module_content')
        .insert({
          title: formData.title,
          description: formData.description || null,
          sub_info: formData.subInfo || null,
          content_type: '3d_model',
          content_data: contentData,
          module_id: moduleId,
          public_access: formData.publicAccess,
          is_active: true,
          order_index: 0,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Generate QR code
      const qrCode = await QRCodeUtils.generateQRCode(contentRecord.id);
      
      // Update record with QR code
      await supabase
        .from('module_content')
        .update({ qr_code_url: qrCode })
        .eq('id', contentRecord.id);

      setUploadedModelId(contentRecord.id);
      setQrCodeUrl(qrCode);

      toast({
        title: "Model uploaded successfully!",
        description: "Your 3D model is now available in AR",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        subInfo: '',
        publicAccess: false,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSuccess?.();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload 3D model",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const copyARLink = async () => {
    if (!uploadedModelId) return;
    
    const arLink = QRCodeUtils.generateShareableUrl(uploadedModelId);
    await navigator.clipboard.writeText(arLink);
    
    toast({
      title: "AR link copied!",
      description: "Link copied to clipboard",
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${formData.title || 'model'}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload 3D Model
          </CardTitle>
          <CardDescription>
            Upload a .glb or .gltf file to create an AR experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Model Title</Label>
            <Input
              id="title"
              placeholder="Enter model title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Brief description of the model"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subInfo">Additional Information (optional)</Label>
            <Textarea
              id="subInfo"
              placeholder="Detailed information about the model"
              value={formData.subInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, subInfo: e.target.value }))}
              disabled={isUploading}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="publicAccess"
              checked={formData.publicAccess}
              onChange={(e) => setFormData(prev => ({ ...prev, publicAccess: e.target.checked }))}
              disabled={isUploading}
              className="rounded"
            />
            <Label htmlFor="publicAccess">
              Make publicly accessible (allows QR code access)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelFile">3D Model File</Label>
            <input
              ref={fileInputRef}
              type="file"
              id="modelFile"
              accept=".glb,.gltf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500">
              Supported formats: .glb, .gltf (max 50MB)
            </p>
          </div>

          {isUploading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading model...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success State */}
      {uploadedModelId && qrCodeUrl && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Upload Successful!
            </CardTitle>
            <CardDescription className="text-green-700">
              Your 3D model is now available in AR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code for AR model" 
                  className="mx-auto mb-2 w-32 h-32 border border-gray-200 rounded"
                />
                <Button onClick={downloadQRCode} variant="outline" size="sm">
                  <QrCode className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">AR Experience Link:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={QRCodeUtils.generateShareableUrl(uploadedModelId)}
                      readOnly
                      className="text-xs"
                    />
                    <Button onClick={copyARLink} size="sm" variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={() => window.open(QRCodeUtils.generateShareableUrl(uploadedModelId), '_blank')}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview AR Experience
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelUpload;