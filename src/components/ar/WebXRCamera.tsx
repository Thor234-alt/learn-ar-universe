import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Hammer from 'hammerjs';

interface WebXRCameraProps {
  modelUrl: string;
  modelScale?: number;
  onTrackingReady?: () => void;
  onTrackingError?: (error: string) => void;
  allowInteraction?: boolean;
}

interface ModelState {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

// AR Model with World Tracking
function WebXRModel({ 
  url, 
  initialScale = 0.1,
  onInteractionStart,
  onInteractionEnd 
}: { 
  url: string; 
  initialScale?: number;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}) {
  const { scene } = useGLTF(url, true);
  const modelRef = useRef<THREE.Group>();
  const { camera, gl } = useThree();
  
  const [modelState, setModelState] = useState<ModelState>({
    position: [0, 0, -1],
    rotation: [0, 0, 0],
    scale: [initialScale, initialScale, initialScale]
  });
  
  const [isSelected, setIsSelected] = useState(false);
  const [worldAnchor, setWorldAnchor] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, -1));

  // Update model transform based on camera movement for world tracking
  useFrame(() => {
    if (modelRef.current && camera) {
      // Calculate world position relative to camera
      const cameraMatrix = camera.matrixWorld;
      const worldPosition = worldAnchor.clone();
      worldPosition.applyMatrix4(cameraMatrix.clone().invert());
      
      modelRef.current.position.copy(worldPosition);
      modelRef.current.rotation.set(...modelState.rotation);
      modelRef.current.scale.set(...modelState.scale);
    }
  });

  // Handle model interactions
  const updateModelState = (updates: Partial<ModelState>) => {
    setModelState(prev => ({ ...prev, ...updates }));
  };

  // Reset model to original position
  const resetPosition = () => {
    const originalState: ModelState = {
      position: [0, 0, -1],
      rotation: [0, 0, 0],
      scale: [initialScale, initialScale, initialScale]
    };
    setModelState(originalState);
    setWorldAnchor(new THREE.Vector3(0, 0, -1));
    setIsSelected(false);
  };

  // Store reference globally for parent access
  useEffect(() => {
    if (modelRef.current && window) {
      (window as any).arModelRef = {
        updateModelState,
        resetPosition,
        setSelected: setIsSelected,
        getModelState: () => modelState
      };
    }
  }, [modelState, updateModelState, resetPosition]);

  return (
    <group ref={modelRef}>
      <primitive object={scene} />
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* Anchor point indicator */}
      <mesh position={worldAnchor.toArray()}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Camera background for AR
function ARBackground({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) {
  const { scene } = useThree();
  
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    // Create background geometry that fills the screen
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide
    });
    
    const backgroundMesh = new THREE.Mesh(geometry, material);
    backgroundMesh.position.z = -10;
    backgroundMesh.name = 'arBackground';
    
    scene.add(backgroundMesh);

    return () => {
      scene.remove(backgroundMesh);
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [scene, videoRef]);

  return null;
}

const WebXRCamera: React.FC<WebXRCameraProps> = ({
  modelUrl,
  modelScale = 0.1,
  onTrackingReady,
  onTrackingError,
  allowInteraction = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<{
    updateModelState: (updates: Partial<ModelState>) => void;
    resetPosition: () => void;
    setSelected: (selected: boolean) => void;
    getModelState: () => ModelState;
  }>();
  const hammerRef = useRef<HammerManager | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [selectedModel, setSelectedModel] = useState(false);

  // Initialize camera
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.playsInline = true;
          videoRef.current.muted = true;
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current && mounted) {
              videoRef.current.play().then(() => {
                setIsReady(true);
                onTrackingReady?.();
              }).catch((error) => {
                console.error('Error playing video:', error);
                onTrackingError?.('Failed to start camera feed');
              });
            }
          };
        }
      } catch (error: any) {
        console.error('Camera access error:', error);
        let errorMessage = 'Camera access denied or unavailable';
        
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        }
        
        onTrackingError?.(errorMessage);
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onTrackingReady, onTrackingError]);

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
      
      if ((window as any).arModelRef?.setSelected) {
        (window as any).arModelRef.setSelected(!selectedModel);
      }
      
      setTimeout(() => setIsInteracting(false), 100);
    });

    // Double tap - reset position
    hammer.on('doubletap', (event) => {
      if ((window as any).arModelRef?.resetPosition) {
        (window as any).arModelRef.resetPosition();
        setSelectedModel(false);
      }
    });

    // Pan - move model in AR space
    hammer.on('panstart', (event) => {
      if (!selectedModel) return;
      setIsInteracting(true);
    });

    hammer.on('panmove', (event) => {
      if (!selectedModel || !isReady || !(window as any).arModelRef?.updateModelState) return;
      
      const deltaX = event.deltaX * 0.001;
      const deltaY = -event.deltaY * 0.001;
      
      const currentState = (window as any).arModelRef.getModelState();
      const newPosition: [number, number, number] = [
        currentState.position[0] + deltaX,
        currentState.position[1] + deltaY,
        currentState.position[2]
      ];
      
      (window as any).arModelRef.updateModelState({ position: newPosition });
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
      if (!selectedModel || !isReady || !(window as any).arModelRef?.updateModelState) return;
      
      const scaleFactor = event.scale;
      const currentState = (window as any).arModelRef.getModelState();
      const newScale: [number, number, number] = [
        Math.max(0.05, Math.min(2, currentState.scale[0] * scaleFactor)),
        Math.max(0.05, Math.min(2, currentState.scale[1] * scaleFactor)),
        Math.max(0.05, Math.min(2, currentState.scale[2] * scaleFactor))
      ];
      
      (window as any).arModelRef.updateModelState({ scale: newScale });
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
      if (!selectedModel || !isReady || !(window as any).arModelRef?.updateModelState) return;
      
      const rotationDelta = event.rotation * (Math.PI / 180);
      const currentState = (window as any).arModelRef.getModelState();
      const newRotation: [number, number, number] = [
        currentState.rotation[0],
        currentState.rotation[1] + rotationDelta * 0.1,
        currentState.rotation[2]
      ];
      
      (window as any).arModelRef.updateModelState({ rotation: newRotation });
    });

    hammer.on('rotateend', () => {
      setIsInteracting(false);
    });

    hammerRef.current = hammer;

    return () => {
      hammer.destroy();
    };
  }, [allowInteraction, selectedModel, isReady]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
      style={{ touchAction: 'none' }}
    >
      {/* Hidden video element for camera feed */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />

      {/* Three.js Canvas with AR overlay */}
      {isReady && (
        <Canvas
          className="absolute inset-0"
          camera={{ 
            fov: 60, 
            position: [0, 0, 0],
            near: 0.01,
            far: 1000
          }}
          gl={{ 
            alpha: true, 
            antialias: true,
            preserveDrawingBuffer: true
          }}
        >
          <ARBackground videoRef={videoRef} />
          
          <ambientLight intensity={0.8} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <pointLight position={[-1, -1, 1]} intensity={0.5} />
          
          <WebXRModel 
            url={modelUrl} 
            initialScale={modelScale}
            onInteractionStart={() => setIsInteracting(true)}
            onInteractionEnd={() => setIsInteracting(false)}
          />
        </Canvas>
      )}

      {/* Tracking Status Overlay */}
      {!isReady && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center text-white p-6">
            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Starting AR Tracking</h3>
            <p className="text-gray-300 text-sm">Initializing camera and world tracking...</p>
          </div>
        </div>
      )}

      {/* Model State Indicator */}
      {selectedModel && isReady && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-green-500/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-white text-xs">
              <p className="font-bold">Model Selected</p>
              <p>Touch to interact</p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {isReady && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={() => {
              if ((window as any).arModelRef?.resetPosition) {
                (window as any).arModelRef.resetPosition();
                setSelectedModel(false);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
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

export default WebXRCamera;