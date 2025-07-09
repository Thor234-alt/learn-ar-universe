import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, PresentationControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move3D, ZoomIn, ZoomOut, Info, X } from 'lucide-react';

interface ARViewerProps {
  modelUrl: string;
  modelTitle: string;
  modelDescription?: string;
  subInfo?: string;
  onClose?: () => void;
}

// 3D Model Component
function Model({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} scale={scale} />;
}

const ARViewer: React.FC<ARViewerProps> = ({
  modelUrl,
  modelTitle,
  modelDescription,
  subInfo,
  onClose
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [modelScale, setModelScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const controlsRef = useRef<any>();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="relative h-full w-full bg-black">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
            <p className="text-white text-lg">Loading AR Experience...</p>
            <p className="text-gray-300 text-sm mt-2">Preparing {modelTitle}</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
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
          </div>
        </div>

        {/* Interaction Guide */}
        <div className="absolute bottom-4 right-4 pointer-events-auto z-30">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300">
            <p>📱 Touch: Rotate</p>
            <p>🤏 Pinch: Zoom</p>
            <p>👆 Drag: Move</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;