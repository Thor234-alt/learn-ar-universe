import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeUtils } from '@/utils/qrCodeUtils';
import { useModelData } from '@/hooks/useModelData';
import PublicLayout from '@/components/layouts/PublicLayout';
import ARViewer from '@/components/ar/ARViewer';
import { ARLoadingSkeleton } from '@/components/ui/loading-skeleton';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ARExperience: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Use our new hook for model data
  const { modelData, loading, error, retry } = useModelData(modelId || null);

  // Validate model ID
  const isValidId = modelId && QRCodeUtils.isValidUUID(modelId);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle invalid model ID
  if (!isValidId) {
    return (
      <PublicLayout showLogin={true}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-sm px-4">
            <h2 className="text-2xl font-bold text-white mb-4">Invalid AR Link</h2>
            <p className="text-gray-300 mb-6">
              This AR experience link is not valid. Please scan a valid QR code or check the URL.
            </p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Go Home
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Loading State
  if (loading) {
    return (
      <PublicLayout showLogin={false}>
        <ARLoadingSkeleton />
      </PublicLayout>
    );
  }

  // Error State
  if (error || !modelData) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center h-full px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">AR Experience Unavailable</h2>
            <p className="text-gray-300 mb-6">
              {error || 'The requested 3D model could not be loaded.'}
            </p>
            
            {!isOnline && (
              <div className="flex items-center justify-center mb-4 text-yellow-400">
                <WifiOff className="w-5 h-5 mr-2" />
                <span>No internet connection</span>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={retry}
                className="bg-blue-600 hover:bg-blue-700 w-full"
                disabled={!isOnline}
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Go Home
              </Button>
              
              <p className="text-sm text-gray-400">
                This AR experience requires an active internet connection and a valid model ID.
              </p>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Success State - AR Experience  
  return (
    <PublicLayout showLogin={false}>
      <div className="relative h-full">
        {/* Network Status Indicator */}
        <div className="absolute top-4 right-4 z-50">
          {isOnline ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-full p-2">
              <Wifi className="w-4 h-4 text-green-400" />
            </div>
          ) : (
            <div className="bg-red-500/20 border border-red-500/50 rounded-full p-2">
              <WifiOff className="w-4 h-4 text-red-400" />
            </div>
          )}
        </div>
        
        <ARViewer
          contentId={modelId}
          onClose={() => navigate('/')}
        />
      </div>
    </PublicLayout>
  );
};

export default ARExperience;