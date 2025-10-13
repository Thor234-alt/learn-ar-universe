import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, PresentationControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Info, X, Camera, Eye, RefreshCcw, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModelData } from '@/hooks/useModelData';
import { ModelService } from '@/services/modelService';
import { QRCodeUtils } from '@/utils/qrCodeUtils';
import ARCamera from './ARCamera';

interface ARViewerProps {
  modelUrl?: string;
  modelTitle?: string;
  modelDescription?: string;
  subInfo?: string;
  contentId?: string;
  onClose?: () => void;
}

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
  const arCameraRef = useRef<any>(null); // ✅ New ref to ARCamera

  const { modelData, loading: modelLoading, error: modelError, retry } = useModelData(contentId);

  const modelUrl = modelData ? ModelService.getModelUrl(modelData) : propModelUrl;
  const modelTitle = modelData?.title || propModelTitle || 'AR Model';
  const modelDescription = modelData?.description || propModelDescription;
  const subInfo = modelData?.sub_info || propSubInfo;

  useEffect(() => {
    if (contentId) {
      setIsLoading(modelLoading);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [contentId, modelLoading]);

  const handleReset = () => {
    setModelScale(1);
    controlsRef.current?.reset();
  };
  const handleZoomIn = () => setModelScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setModelScale(prev => Math.max(prev / 1.2, 0.3));

  // ✅ Updated handleARToggle to trigger AR via ref
  const handleARToggle = () => {
    if (!isARMode) {
      setCameraError(null);
      setIsARMode(true);

      // Wait a tick for ARCamera to mount
      setTimeout(() => {
        if (arCameraRef.current?.modelViewerRef?.current) {
          const mv = arCameraRef.current.modelViewerRef.current;
          if (mv.canActivateAR) {
            mv.activateAR().catch((err: any) => {
              console.error('AR activation failed:', err);
              setCameraError('Failed to activate AR. Please check permissions.');
              setIsARMode(false);
            });
          }
        }
      }, 100);
    } else {
      setIsARMode(false); // Exit AR
    }
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
    } catch {
      const shareUrl = QRCodeUtils.generateShareableUrl(contentId);
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "AR link copied to clipboard" });
    }
  };

  const handleRetry = () => modelError && retry();

  if (modelError && contentId) {
    return (
      <div className="relative h-full w-full bg-black flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Model Not Found</h3>
          <p className="text-gray-300 mb-6">{modelError}</p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 w-full">
              <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline" className="w-full">
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!modelUrl) return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
        <p className="text-white text-lg">Loading model...</p>
      </div>
    </div>
  );

  return (
    <div className="relative h-full w-full bg-black">
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

      {cameraError && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center max-w-sm px-4">
            <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Camera Access Required</h3>
            <p className="text-gray-300 mb-6">{cameraError}</p>
            <div className="space-y-3">
              <Button onClick={handleARToggle} className="bg-blue-600 hover:bg-blue-700 w-full">Try Again</Button>
              <Button onClick={() => { setCameraError(null); setIsARMode(false); }} variant="outline" className="w-full">Use 3D View Instead</Button>
            </div>
          </div>
        </div>
      )}

      {isARMode && !cameraError && (
        <ARCamera
          ref={arCameraRef} // ✅ Pass ref to trigger activateAR()
          modelUrl={modelUrl}
          modelScale={0.15}
          onCameraReady={handleCameraReady}
          onCameraError={handleCameraError}
        />
      )}

      {!isARMode && (
        <Canvas className="h-full w-full" camera={{ fov: 45, position: [0, 2, 5] }} style={{ background: 'transparent' }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          <PresentationControls speed={1.5} global zoom={0.8} polar={[-Math.PI / 4, Math.PI / 4]} azimuth={[-Math.PI / 2, Math.PI / 2]}>
            <Model url={modelUrl} scale={modelScale} />
          </PresentationControls>
          <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate minDistance={1} maxDistance={20} touches={{ ONE: 2, TWO: 1 }} />
        </Canvas>
      )}

      {/* Control Panel */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto z-40">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center space-x-2">
          {/* AR Mode Toggle Button */}
          <Button
            onClick={handleARToggle}
            variant={isARMode ? "default" : "ghost"}
            size="sm"
            className={`rounded-full ${isARMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-white hover:bg-white/20"}`}
            title={isARMode ? "Exit AR Mode" : "Enter AR Mode"}
          >
            {isARMode ? <Eye className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          </Button>
          {/* Other controls... */}
        </div>
      </div>
    </div>
  );
};

export default ARViewer;
