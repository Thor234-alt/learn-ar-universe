import React, { useEffect, useRef, useState } from 'react';
import Hammer from 'hammerjs';
import * as THREE from 'three';

interface ARTrackedCameraProps {
  modelUrl: string;
  modelScale?: number;
  onTrackingReady?: () => void;
  onTrackingError?: (error: string) => void;
  allowInteraction?: boolean;
  trackingMode?: 'marker' | 'world' | 'plane';
}

interface ModelState {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

const ARTrackedCamera: React.FC<ARTrackedCameraProps> = ({
  modelUrl,
  modelScale = 1,
  onTrackingReady,
  onTrackingError,
  allowInteraction = true,
  trackingMode = 'world'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const hammerRef = useRef<HammerManager | null>(null);
  
  const [isTracking, setIsTracking] = useState(false);
  const [modelState, setModelState] = useState<ModelState>({
    position: [0, 0, -1],
    rotation: [0, 0, 0],
    scale: [modelScale, modelScale, modelScale]
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const [selectedModel, setSelectedModel] = useState(false);

  // Initialize A-Frame scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create A-Frame scene programmatically
    const sceneEl = document.createElement('a-scene');
    sceneEl.setAttribute('embedded', '');
    sceneEl.setAttribute('arjs', JSON.stringify({
      trackingMethod: 'best',
      sourceType: 'webcam',
      debugUIEnabled: false,
      detectionMode: 'mono_and_matrix',
      matrixCodeType: '3x3',
      cameraParametersUrl: 'data/camera_para.dat',
      maxDetectionRate: 60,
      canvasWidth: 640,
      canvasHeight: 480
    }));
    sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
    sceneEl.setAttribute('renderer', 'logarithmicDepthBuffer: true');

    // Create marker or world anchor
    let anchorEl;
    if (trackingMode === 'marker') {
      anchorEl = document.createElement('a-marker');
      anchorEl.setAttribute('preset', 'hiro');
      anchorEl.setAttribute('raycaster', 'objects: .clickable');
    } else {
      // World tracking anchor
      anchorEl = document.createElement('a-anchor');
      anchorEl.setAttribute('hit-testing-renderorder', '0');
    }

    // Create 3D model entity
    const modelEl = document.createElement('a-entity');
    modelEl.setAttribute('id', 'ar-model');
    modelEl.setAttribute('gltf-model', `url(${modelUrl})`);
    modelEl.setAttribute('position', modelState.position.join(' '));
    modelEl.setAttribute('rotation', modelState.rotation.join(' '));
    modelEl.setAttribute('scale', modelState.scale.join(' '));
    modelEl.setAttribute('class', 'clickable');
    modelEl.setAttribute('animation-mixer', '');

    // Add visual feedback elements
    const anchorPoint = document.createElement('a-sphere');
    anchorPoint.setAttribute('radius', '0.02');
    anchorPoint.setAttribute('color', '#ff0000');
    anchorPoint.setAttribute('opacity', '0.8');
    anchorPoint.setAttribute('id', 'anchor-point');
    anchorPoint.setAttribute('visible', 'false');

    const selectionGlow = document.createElement('a-sphere');
    selectionGlow.setAttribute('radius', '0.1');
    selectionGlow.setAttribute('color', '#00ff00');
    selectionGlow.setAttribute('opacity', '0.3');
    selectionGlow.setAttribute('id', 'selection-glow');
    selectionGlow.setAttribute('visible', 'false');
    selectionGlow.setAttribute('animation', 'property: scale; to: 1.2 1.2 1.2; dir: alternate; dur: 1000; loop: true');

    // Create camera
    const cameraEl = document.createElement('a-camera-static');

    // Assemble scene
    modelEl.appendChild(selectionGlow);
    anchorEl.appendChild(modelEl);
    anchorEl.appendChild(anchorPoint);
    sceneEl.appendChild(anchorEl);
    sceneEl.appendChild(cameraEl);

    containerRef.current.appendChild(sceneEl);

    // Store references
    sceneRef.current = sceneEl;
    modelRef.current = modelEl;

    // Setup tracking events
    sceneEl.addEventListener('arjs-video-loaded', () => {
      console.log('AR video loaded');
    });

    anchorEl.addEventListener('markerFound', () => {
      setIsTracking(true);
      onTrackingReady?.();
      console.log('AR tracking started');
    });

    anchorEl.addEventListener('markerLost', () => {
      setIsTracking(false);
      console.log('AR tracking lost');
    });

    return () => {
      if (containerRef.current?.contains(sceneEl)) {
        containerRef.current.removeChild(sceneEl);
      }
    };
  }, [modelUrl, trackingMode, onTrackingReady]);

  // Setup touch interactions
  useEffect(() => {
    if (!containerRef.current || !allowInteraction) return;

    const hammer = new Hammer(containerRef.current);
    
    // Enable all gestures
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    hammer.get('pinch').set({ enable: true });
    hammer.get('rotate').set({ enable: true });

    // Single tap - select/deselect model
    hammer.on('tap', (event) => {
      setSelectedModel(!selectedModel);
      setIsInteracting(true);
      
      if (modelRef.current) {
        const glowEl = modelRef.current.querySelector('#selection-glow');
        if (glowEl) {
          glowEl.setAttribute('visible', !selectedModel);
        }
      }
      
      setTimeout(() => setIsInteracting(false), 100);
    });

    // Double tap - reset position
    hammer.on('doubletap', (event) => {
      resetModelPosition();
    });

    // Pan - move model in AR space
    hammer.on('panstart', (event) => {
      if (!selectedModel) return;
      setIsInteracting(true);
    });

    hammer.on('panmove', (event) => {
      if (!selectedModel || !isTracking) return;
      
      const deltaX = event.deltaX * 0.001;
      const deltaY = -event.deltaY * 0.001;
      
      setModelState(prev => {
        const newPosition: [number, number, number] = [
          prev.position[0] + deltaX,
          prev.position[1] + deltaY,
          prev.position[2]
        ];
        
        updateModelTransform({ position: newPosition });
        return { ...prev, position: newPosition };
      });
    });

    hammer.on('panend', () => {
      setIsInteracting(false);
    });

    // Pinch - scale model
    hammer.on('pinchstart', (event) => {
      if (!selectedModel) return;
      setIsInteracting(true);
    });

    hammer.on('pinchmove', (event) => {
      if (!selectedModel || !isTracking) return;
      
      const scaleFactor = event.scale;
      setModelState(prev => {
        const newScale: [number, number, number] = [
          Math.max(0.1, Math.min(3, prev.scale[0] * scaleFactor)),
          Math.max(0.1, Math.min(3, prev.scale[1] * scaleFactor)),
          Math.max(0.1, Math.min(3, prev.scale[2] * scaleFactor))
        ];
        
        updateModelTransform({ scale: newScale });
        return { ...prev, scale: newScale };
      });
    });

    hammer.on('pinchend', () => {
      setIsInteracting(false);
    });

    // Rotate - rotate model
    hammer.on('rotatestart', (event) => {
      if (!selectedModel) return;
      setIsInteracting(true);
    });

    hammer.on('rotatemove', (event) => {
      if (!selectedModel || !isTracking) return;
      
      const rotationDelta = event.rotation * (Math.PI / 180);
      setModelState(prev => {
        const newRotation: [number, number, number] = [
          prev.rotation[0],
          prev.rotation[1] + rotationDelta * 0.1,
          prev.rotation[2]
        ];
        
        updateModelTransform({ rotation: newRotation });
        return { ...prev, rotation: newRotation };
      });
    });

    hammer.on('rotateend', () => {
      setIsInteracting(false);
    });

    hammerRef.current = hammer;

    return () => {
      hammer.destroy();
    };
  }, [allowInteraction, selectedModel, isTracking]);

  // Update model transform in A-Frame
  const updateModelTransform = (updates: Partial<ModelState>) => {
    if (!modelRef.current) return;

    if (updates.position) {
      modelRef.current.setAttribute('position', updates.position.join(' '));
    }
    if (updates.rotation) {
      modelRef.current.setAttribute('rotation', updates.rotation.join(' '));
    }
    if (updates.scale) {
      modelRef.current.setAttribute('scale', updates.scale.join(' '));
    }
  };

  // Reset model to original position
  const resetModelPosition = () => {
    const originalState: ModelState = {
      position: [0, 0, -1],
      rotation: [0, 0, 0],
      scale: [modelScale, modelScale, modelScale]
    };
    
    setModelState(originalState);
    updateModelTransform(originalState);
    setSelectedModel(false);
    
    if (modelRef.current) {
      const glowEl = modelRef.current.querySelector('#selection-glow');
      if (glowEl) {
        glowEl.setAttribute('visible', 'false');
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full"
      style={{ touchAction: 'none' }}
    >
      {/* Tracking Status Overlay */}
      {!isTracking && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center text-white p-6">
            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Searching for AR Target</h3>
            <p className="text-gray-300 text-sm">
              {trackingMode === 'marker' 
                ? 'Point camera at AR marker' 
                : 'Move camera around to start tracking'
              }
            </p>
          </div>
        </div>
      )}

      {/* Interaction Instructions */}
      {isTracking && (
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
            <div className="text-white text-xs space-y-1">
              <p>👆 <strong>Tap:</strong> Select model</p>
              <p>🔄 <strong>Drag:</strong> Move model</p>
              <p>🤏 <strong>Pinch:</strong> Scale model</p>
              <p>🔄 <strong>Rotate:</strong> Two fingers</p>
              <p>👆👆 <strong>Double tap:</strong> Reset position</p>
            </div>
          </div>
        </div>
      )}

      {/* Model State Indicator */}
      {selectedModel && isTracking && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-green-500/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-white text-xs">
              <p className="font-bold">Model Selected</p>
              <p>Scale: {modelState.scale[0].toFixed(1)}x</p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {isTracking && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={resetModelPosition}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
            title="Reset model position"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ARTrackedCamera;