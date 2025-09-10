import React, { useState, useEffect } from 'react';
import ARCamera from './ARCamera';
import WebXRCamera from './WebXRCamera';

interface ARProviderProps {
  modelUrl: string;
  modelScale?: number;
  onCameraReady?: () => void;
  onCameraError?: (error: string) => void;
}

/**
 * ARProvider - Smart component that chooses between WebXR and fallback AR implementation
 * 
 * This component checks for WebXR support and uses the appropriate implementation:
 * - WebXRCamera: For devices with WebXR support (proper AR with anchoring)
 * - ARCamera: For devices without WebXR (fallback camera-based AR)
 */
const ARProvider: React.FC<ARProviderProps> = ({
  modelUrl,
  modelScale = 0.1,
  onCameraReady,
  onCameraError
}) => {
  const [implementation, setImplementation] = useState<'checking' | 'webxr' | 'fallback'>('checking');
  const [error, setError] = useState<string | null>(null);

  // Check for WebXR support on mount
  useEffect(() => {
    console.log('[AR] Checking WebXR support...');
    
    // Check if WebXR is available in this browser
    if (!navigator.xr) {
      console.log('[AR] WebXR API not available, using fallback implementation');
      setImplementation('fallback');
      return;
    }
    
    // Check if immersive-ar sessions are supported
    navigator.xr.isSessionSupported('immersive-ar')
      .then(supported => {
        if (supported) {
          console.log('[AR] WebXR AR supported, using WebXR implementation');
          setImplementation('webxr');
        } else {
          console.log('[AR] WebXR AR not supported, using fallback implementation');
          setImplementation('fallback');
        }
      })
      .catch(err => {
        console.error('[AR] Error checking WebXR support:', err);
        setImplementation('fallback');
      });
  }, []);

  // Handle errors from either implementation
  const handleError = (errorMessage: string) => {
    console.error('[AR] Error:', errorMessage);
    setError(errorMessage);
    
    // Pass error to parent component if callback provided
    if (onCameraError) {
      onCameraError(errorMessage);
    }
  };

  // Handle ready state from either implementation
  const handleReady = () => {
    console.log('[AR] Camera ready');
    
    // Pass ready state to parent component if callback provided
    if (onCameraReady) {
      onCameraReady();
    }
  };

  // Show loading state while checking implementation
  if (implementation === 'checking') {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p>Initializing AR experience...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate implementation
  return (
    <>
      {implementation === 'webxr' ? (
        <WebXRCamera
          modelUrl={modelUrl}
          modelScale={modelScale}
          onCameraReady={handleReady}
          onCameraError={handleError}
        />
      ) : (
        <ARCamera
          modelUrl={modelUrl}
          modelScale={modelScale}
          onCameraReady={handleReady}
          onCameraError={handleError}
        />
      )}
      
      {/* Display platform info for debugging */}
      <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1 z-50 pointer-events-none">
        Using: {implementation === 'webxr' ? 'WebXR (anchored)' : 'Fallback AR'}
      </div>
    </>
  );
};

export default ARProvider;