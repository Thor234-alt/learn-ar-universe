import React, { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';

// Extend HTMLElementTagNameMap to include model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface ModelViewerJSX {
  src?: string;
  alt?: string;
  'auto-rotate'?: boolean;
  'camera-controls'?: boolean;
  ar?: boolean;
  'ar-scale'?: string;
  'xr-environment'?: boolean;
  loading?: string;
  'environment-image'?: string;
  'exposure'?: string;
  'shadow-intensity'?: string;
  'shadow-softness'?: string;
  style?: React.CSSProperties;
  slot?: string;
}

interface ARCameraProps {
  modelUrl: string;
  modelScale?: number;
  onCameraReady?: () => void;
  onCameraError?: (error: string) => void;
}

const ARCamera: React.FC<ARCameraProps> = ({
  modelUrl,
  modelScale = 0.1,
  onCameraReady,
  onCameraError
}) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Model viewer is imported at the top, so it's ready
    setIsLoading(false);
    onCameraReady?.();
  }, [onCameraReady]);

  useEffect(() => {
    if (!modelViewerRef.current) return;

    const modelViewer = modelViewerRef.current as any;

    // Event listeners for model loading
    const handleLoad = () => {
      console.log('Model loaded successfully');
    };

    const handleError = (event: any) => {
      const errorMsg = 'Failed to load 3D model';
      console.error(errorMsg, event);
      setError(errorMsg);
      onCameraError?.(errorMsg);
    };

    const handleProgress = (event: any) => {
      const progress = event.detail.totalProgress;
      console.log(`Loading progress: ${(progress * 100).toFixed(0)}%`);
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);
    modelViewer.addEventListener('progress', handleProgress);

    return () => {
      if (modelViewer) {
        modelViewer.removeEventListener('load', handleLoad);
        modelViewer.removeEventListener('error', handleError);
        modelViewer.removeEventListener('progress', handleProgress);
      }
    };
  }, [onCameraError]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-background/95">
        <div className="text-center p-6">
          <p className="text-destructive mb-2">Error Loading AR Viewer</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-background/95">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AR Viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        alt="3D model for AR viewing"
        auto-rotate
        camera-controls
        ar
        ar-scale="fixed"
        xr-environment
        loading="eager"
        environment-image="neutral"
        exposure="1"
        shadow-intensity="1"
        shadow-softness="1"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
      >
        <button 
          slot="ar-button"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          👋 Activate AR
        </button>
      </model-viewer>
    </div>
  );
};

export default ARCamera;
