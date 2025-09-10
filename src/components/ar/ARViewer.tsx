import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, PresentationControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move3D, ZoomIn, ZoomOut, Info, X, Camera, Eye, RefreshCcw, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModelData } from '@/hooks/useModelData';
import { ModelService } from '@/services/modelService';
import { QRCodeUtils } from '@/utils/qrCodeUtils';
import { Skeleton } from '@/components/ui/skeleton';
import ARProvider from './ARProvider';

interface ARViewerProps {
  modelUrl?: string;
  modelTitle?: string;
  modelDescription?: string;
  subInfo?: string;
  contentId?: string;
  onClose?: () => void;
}

// 3D Model Component
function Model({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} scale={scale} />;
}

const ARViewer: React.FC<ARViewerProps> = ({
  modelUrl: propModelUrl,
  modelTitle: propModelTitle,
  modelDescription: propModelDescription,
  subInfo: propSubInfo,
  contentId,
  onClose
}) => {
  const { toast } = useToast();
  const [showInfo, setShowInfo] = useState(false);
  const [modelScale, setModelScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isARMode, setIsARMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const controlsRef = useRef<any>();

  // Use dynamic model loading if contentId is provided
  const { modelData, loading: modelLoading, error: modelError, retry } = useModelData(contentId);

  // Determine which data source to use
  const modelUrl = modelData ? ModelService.getModelUrl(modelData) : propModelUrl;
  const modelTitle = modelData?.title || propModelTitle || 'AR Model';
  const modelDescription = modelData?.description || propModelDescription;
  const subInfo = modelData?.sub_info || propSubInfo;

  useEffect(() => {
    if (contentId) {
      // Using dynamic loading - wait for model data
      setIsLoading(modelLoading);
    } else {
      // Using static props - simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [contentId, modelLoading]);

  const handleReset = () => {
    setModelScale(1);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleZoomIn = () => {
    setModelScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setModelScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleARToggle = () => {
    setCameraError(null);
    setIsARMode(!isARMode);
  };

  const handleCameraReady = () => {
    setCameraReady(true);
    setIsLoading(false);
  };

  const handleCameraError = (error: string) => {
    setCameraError(error);
    setIsARMode(false);
    setCameraReady(false);
    setIsLoading(false);
  };

  const handleShare = async () => {
    if (!contentId) return;
    
    try {
      const shareUrl = QRCodeUtils.generateShareableUrl(contentId);
      await navigator.share({
        title: modelTitle,
        text: `Check out this AR model: ${modelTitle}`,
        url: shareUrl,
      });
    } catch (error) {
      // Fallback to clipboard
      const shareUrl = QRCodeUtils.generateShareableUrl(contentId);
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "AR link copied to clipboard",
      });
    }
  };

  const handleRetry = () => {
    if (modelError) {
      retry();
    }
  };

  // Show error state if model loading failed
  if (modelError && contentId) {
    return (
      <div className="relative h-full w-full bg-black flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Model Not Found</h3>
          <p className="text-gray-300 mb-6">{modelError}</p>
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if no model URL available
  if (!modelUrl) {
    return (
      <div className="relative h-full w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white text-lg">Loading model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      {/* Loading Overlay */}
      {(isLoading || (isARMode && !cameraReady)) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
            <p className="text-white text-lg">
              {isARMode ? 'Starting AR Camera...' : 'Loading AR Experience...'}
            </p>
            <p className="text-gray-300 text-sm mt-2">
              {isARMode ? 'Please allow camera access' : `Preparing ${modelTitle}`}
            </p>
          </div>
        </div>
      )}

      {/* Camera Error Overlay */}
      {cameraError && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center max-w-sm px-4">
            <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Camera Access Required</h3>
            <p className="text-gray-300 mb-6">{cameraError}</p>
            <div className="space-y-3">
              <Button
                onClick={handleARToggle}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => {
                  setCameraError(null);
                  setIsARMode(false);
                }}
                variant="outline"
                className="w-full"
              >
                Use 3D View Instead
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AR View - Uses ARProvider to select best implementation */}
      {isARMode && !cameraError && (
        <ARProvider
          modelUrl={modelUrl}
          modelScale={0.15}
          onCameraReady={handleCameraReady}
          onCameraError={handleCameraError}
        />
      )}

      {/* Regular 3D Canvas View */}
      {!isARMode && (
        <Canvas
          className="h-full w-full"
          camera={{ fov: 45, position: [0, 2, 5] }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          
          <PresentationControls
            speed={1.5}
            global
            zoom={0.8}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 2, Math.PI / 2]}
          >
            <Model url={modelUrl} scale={modelScale} />
          </PresentationControls>
          
          <OrbitControls 
            ref={controlsRef}
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1}
            maxDistance={20}
            touches={{
              ONE: 2, // ROTATE
              TWO: 1  // DOLLY (zoom)
            }}
          />
        </Canvas>
      )}

      {/* AR UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto z-40">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-xs">
            <h3 className="text-white font-semibold text-lg">{modelTitle}</h3>
            {modelDescription && (
              <p className="text-gray-300 text-sm mt-1">{modelDescription}</p>
            )}
          </div>
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Info Panel */}
        {showInfo && subInfo && (
          <div className="absolute top-20 left-4 right-4 pointer-events-auto z-30">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium">Model Information</h4>
                <Button
                  onClick={() => setShowInfo(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-line">{subInfo}</p>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto z-40">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center space-x-2">
            {/* AR Mode Toggle */}
            <Button
              onClick={handleARToggle}
              variant={isARMode ? "default" : "ghost"}
              size="sm"
              className={`rounded-full ${
                isARMode 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "text-white hover:bg-white/20"
              }`}
              title={isARMode ? "Exit AR Mode" : "Enter AR Mode"}
            >
              {isARMode ? <Eye className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </Button>

            {!isARMode && (
              <>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full"
                  title="Reset View"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={handleZoomOut}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={handleZoomIn}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>
              </>
            )}

            {subInfo && (
              <Button
                onClick={() => setShowInfo(!showInfo)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full"
                title="Model Info"
              >
                <Info className="w-5 h-5" />
              </Button>
            )}

            {contentId && (
              <Button
                onClick={handleShare}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full"
                title="Share AR Model"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Interaction Guide */}
        <div className="absolute bottom-4 right-4 pointer-events-auto z-30">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300">
            {isARMode ? (
              <>
                <p>📹 AR Camera Active</p>
                <p>🔄 Drag to rotate model</p>
                <p>👁️ Look around to explore</p>
              </>
            ) : (
              <>
                <p>📱 Touch: Rotate</p>
                <p>🤏 Pinch: Zoom</p>
                <p>👆 Drag: Move</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;

// Note: ARViewer is now getting too long (300+ lines). Consider refactoring into smaller components.