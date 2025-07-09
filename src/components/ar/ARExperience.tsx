import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PublicLayout from '@/components/layouts/PublicLayout';
import ARViewer from '@/components/ar/ARViewer';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelData {
  id: string;
  title: string;
  description?: string;
  content_data: any; // Using any to handle Json type from Supabase
  sub_info?: string;
  access_count?: number;
}

const ARExperience: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  useEffect(() => {
    if (!modelId) {
      setError('Invalid model ID');
      setLoading(false);
      return;
    }

    fetchModelData();
  }, [modelId]);

  const fetchModelData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch public model data
      const { data, error: fetchError } = await supabase
        .from('module_content')
        .select('id, title, description, content_data, sub_info, content_type, access_count')
        .eq('id', modelId)
        .eq('public_access', true)
        .eq('is_active', true)
        .eq('content_type', '3d_model')
        .single();

      if (fetchError) {
        throw new Error('Model not found or not publicly accessible');
      }

      if (!data) {
        throw new Error('Model not found');
      }

      setModelData(data);

      // Track access (fire and forget)
      trackModelAccess(modelId!);
    } catch (err: any) {
      console.error('Error fetching model:', err);
      setError(err.message || 'Failed to load AR experience');
    } finally {
      setLoading(false);
    }
  };

  const trackModelAccess = async (id: string) => {
    try {
      // Increment access count
      await supabase
        .from('module_content')
        .update({ 
          access_count: (modelData?.access_count || 0) + 1 
        })
        .eq('id', id);
    } catch (error) {
      console.warn('Failed to track access:', error);
    }
  };

  const handleRetry = () => {
    fetchModelData();
  };

  // Loading State
  if (loading) {
    return (
      <PublicLayout showLogin={false}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-6 mx-auto"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading AR Experience</h2>
            <p className="text-gray-300">Preparing your 3D model...</p>
          </div>
        </div>
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
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 w-full"
                disabled={!isOnline}
              >
                Try Again
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

  // Get model URL
  const modelUrl = modelData.content_data?.rootModelUrl || modelData.content_data?.url;
  
  if (!modelUrl) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center h-full px-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Model URL Missing</h2>
            <p className="text-gray-300">
              The 3D model file could not be located.
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Network Status Indicator
  const NetworkStatus = () => (
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
  );

  // Success State - AR Experience
  return (
    <PublicLayout>
      <div className="relative h-full">
        <NetworkStatus />
        <ARViewer
          modelUrl={modelUrl}
          modelTitle={modelData.title}
          modelDescription={modelData.description}
          subInfo={modelData.sub_info}
        />
      </div>
    </PublicLayout>
  );
};

export default ARExperience;