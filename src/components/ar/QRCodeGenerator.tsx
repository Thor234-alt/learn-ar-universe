import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, QrCode, ExternalLink, Eye } from 'lucide-react';
import { generateQRCode, downloadQRCode, getARUrl } from '@/utils/qrGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  contentId: string;
  title: string;
  currentPublicAccess?: boolean;
  currentQRUrl?: string;
  onUpdate?: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  contentId,
  title,
  currentPublicAccess = false,
  currentQRUrl,
  onUpdate
}) => {
  const [isPublic, setIsPublic] = useState(currentPublicAccess);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(currentQRUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const arUrl = getARUrl(contentId);

  useEffect(() => {
    if (isPublic && !qrCodeUrl) {
      generateQRCodeForContent();
    }
  }, [isPublic]);

  const generateQRCodeForContent = async () => {
    setIsGenerating(true);
    try {
      const qrDataURL = await generateQRCode(contentId);
      setQrCodeUrl(qrDataURL);
      
      // Update database with QR code URL
      await updateContentQRData(qrDataURL, isPublic);
      
      toast({
        title: "Success",
        description: "QR code generated successfully!"
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateContentQRData = async (qrUrl: string, publicAccess: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('module_content')
        .update({
          qr_code_url: qrUrl,
          public_access: publicAccess
        })
        .eq('id', contentId);

      if (error) throw error;
      onUpdate?.();
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePublicToggle = async (checked: boolean) => {
    try {
      setIsPublic(checked);
      
      if (checked && !qrCodeUrl) {
        await generateQRCodeForContent();
      } else {
        await updateContentQRData(qrCodeUrl, checked);
        toast({
          title: "Success",
          description: checked ? "Content is now publicly accessible" : "Content is now private"
        });
      }
    } catch (error) {
      console.error('Error toggling public access:', error);
      setIsPublic(!checked); // Revert on error
      toast({
        title: "Error",
        description: "Failed to update public access",
        variant: "destructive"
      });
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const filename = `qr-code-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      downloadQRCode(qrCodeUrl, filename);
      toast({
        title: "Downloaded",
        description: "QR code saved to downloads"
      });
    }
  };

  const handleCopyArUrl = async () => {
    try {
      await navigator.clipboard.writeText(arUrl);
      toast({
        title: "Copied",
        description: "AR URL copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code & AR Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Public Access Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="public-access" className="text-gray-300">
            Enable Public AR Access
          </Label>
          <Switch
            id="public-access"
            checked={isPublic}
            onCheckedChange={handlePublicToggle}
            disabled={isUpdating}
          />
        </div>

        {/* QR Code Display */}
        {isPublic && (
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4">
              {isGenerating ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-300">Generating QR code...</span>
                </div>
              ) : qrCodeUrl ? (
                <div className="flex flex-col items-center space-y-3">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for AR experience"
                    className="rounded-lg bg-white p-2"
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadQR}
                      variant="outline"
                      size="sm"
                      className="text-white border-gray-600 hover:bg-slate-600"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      onClick={handleCopyArUrl}
                      variant="outline"
                      size="sm"
                      className="text-white border-gray-600 hover:bg-slate-600"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    onClick={generateQRCodeForContent}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Generate QR Code
                  </Button>
                </div>
              )}
            </div>

            {/* AR URL Display */}
            <div className="bg-slate-700 rounded-lg p-3">
              <Label className="text-gray-400 text-sm">AR Experience URL:</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-blue-400 text-sm bg-slate-800 px-2 py-1 rounded flex-1 truncate">
                  {arUrl}
                </code>
                <Button
                  onClick={() => window.open(arUrl, '_blank')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isPublic && (
          <p className="text-gray-400 text-sm">
            Enable public access to generate a QR code for AR experience.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;