import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import '@google/model-viewer';

interface ARCameraProps {
  modelUrl: string;
  modelScale?: number;
  onCameraReady?: () => void;
  onCameraError?: (error: string) => void;
}

const ARCamera = forwardRef<any, ARCameraProps>(
  ({ modelUrl, modelScale = 0.1, onCameraReady, onCameraError }, ref) => {
    const modelViewerRef = useRef<any>(null);

    // Expose modelViewerRef to parent
    useImperativeHandle(ref, () => ({
      modelViewerRef
    }));

    useEffect(() => {
      if (!modelViewerRef.current) return;
      const mv = modelViewerRef.current;

      const handleLoad = () => {
        onCameraReady?.();
      };

      const handleError = (event: any) => {
        console.error('ARCamera load error:', event);
        onCameraError?.('Failed to load 3D model');
      };

      mv.addEventListener('load', handleLoad);
      mv.addEventListener('error', handleError);

      return () => {
        mv.removeEventListener('load', handleLoad);
        mv.removeEventListener('error', handleError);
      };
    }, [onCameraReady, onCameraError]);

    return (
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        alt="3D AR Model"
        auto-rotate
        camera-controls
        ar
        ar-scale="fixed"
        xr-environment
        loading="eager"
        ar-modes="scene-viewer quick-look" // Force mobile AR
        ios-src={modelUrl.replace('.glb', '.usdz')} // Quick Look fallback
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        <button slot="ar-button" style={{ display: 'none' }}>Activate AR</button>
      </model-viewer>
    );
  }
);

export default ARCamera;
