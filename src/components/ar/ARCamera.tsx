import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ARCameraProps {
  modelUrl: string;
  modelScale?: number;
  onCameraReady?: () => void;
  onCameraError?: (error: string) => void;
}

// AR 3D Model Component with Enhanced Touch Controls
function ARModel({ url, scale = 0.1, position = [0, 0, -0.5] }: { 
  url: string; 
  scale?: number; 
  position?: [number, number, number];
}) {
  const { scene } = useGLTF(url, true);
  const modelRef = useRef<THREE.Group>();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [modelPosition, setModelPosition] = useState<[number, number, number]>(position);
  const [modelScale, setModelScale] = useState(scale);
  const [isSelected, setIsSelected] = useState(false);
  
  // Enhanced gesture state tracking with fixed position
  const [gestureState, setGestureState] = useState({
    mode: 'none' as 'none' | 'rotate' | 'translate' | 'scale',
    initialDistance: 0,
    initialScale: scale,
    initialPosition: { x: 0, y: 0 },
    lastTouchPositions: [] as Array<{ x: number; y: number }>,
    touchCount: 0,
    isAnchored: true // Track if model is anchored in place
  });

  // Improved touch handling with better gesture detection
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touches = Array.from(event.touches);
      const touchCount = touches.length;
      
      setGestureState(prev => ({
        ...prev,
        touchCount,
        lastTouchPositions: touches.map(t => ({ x: t.clientX, y: t.clientY }))
      }));

      if (touchCount === 1) {
        // Single touch - prepare for rotation or translation
        setIsSelected(true);
        setGestureState(prev => ({
          ...prev,
          mode: 'rotate',
          initialPosition: { x: touches[0].clientX, y: touches[0].clientY }
        }));
      } else if (touchCount === 2) {
        // Two finger pinch - scale mode
        const touch1 = touches[0];
        const touch2 = touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        setGestureState(prev => ({
          ...prev,
          mode: 'scale',
          initialDistance: distance,
          initialScale: modelScale
        }));
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touches = Array.from(event.touches);
      
      if (gestureState.mode === 'rotate' && touches.length === 1) {
        // Single finger rotation
        const deltaX = touches[0].clientX - gestureState.initialPosition.x;
        const deltaY = touches[0].clientY - gestureState.initialPosition.y;
        
        setRotation(prev => ({
          x: Math.max(-Math.PI, Math.min(Math.PI, prev.x + deltaY * 0.01)),
          y: prev.y + deltaX * 0.01
        }));
        
        setGestureState(prev => ({
          ...prev,
          initialPosition: { x: touches[0].clientX, y: touches[0].clientY }
        }));
      } else if (gestureState.mode === 'scale' && touches.length === 2) {
        // Two finger pinch-to-scale
        const touch1 = touches[0];
        const touch2 = touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (gestureState.initialDistance > 0) {
          const scaleFactor = currentDistance / gestureState.initialDistance;
          const newScale = Math.max(0.02, Math.min(3, gestureState.initialScale * scaleFactor));
          setModelScale(newScale);
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touchCount = event.touches.length;
      
      if (touchCount === 0) {
        // All fingers lifted - reset gesture state
        setGestureState(prev => ({
          ...prev,
          mode: 'none',
          touchCount: 0,
          lastTouchPositions: []
        }));
      } else if (touchCount === 1 && gestureState.mode === 'scale') {
        // Switched from two fingers to one - go back to rotation mode
        const touch = event.touches[0];
        setGestureState(prev => ({
          ...prev,
          mode: 'rotate',
          touchCount: 1,
          initialPosition: { x: touch.clientX, y: touch.clientY },
          lastTouchPositions: [{ x: touch.clientX, y: touch.clientY }]
        }));
      }
    };

    // Double tap to reset
    let tapTimeout: NodeJS.Timeout;
    let tapCount = 0;
    
    const handleDoubleTap = (event: TouchEvent) => {
      tapCount++;
      if (tapCount === 1) {
        tapTimeout = setTimeout(() => {
          tapCount = 0;
        }, 300);
      } else if (tapCount === 2) {
        clearTimeout(tapTimeout);
        tapCount = 0;
        resetModelPosition();
      }
    };

    // Improved mouse support for desktop testing
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left click
        setIsSelected(true);
        setGestureState(prev => ({
          ...prev,
          mode: 'rotate',
          initialPosition: { x: event.clientX, y: event.clientY }
        }));
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (gestureState.mode === 'rotate' && event.buttons === 1) {
        const deltaX = event.clientX - gestureState.initialPosition.x;
        const deltaY = event.clientY - gestureState.initialPosition.y;
        
        setRotation(prev => ({
          x: Math.max(-Math.PI, Math.min(Math.PI, prev.x + deltaY * 0.01)),
          y: prev.y + deltaX * 0.01
        }));
        
        setGestureState(prev => ({
          ...prev,
          initialPosition: { x: event.clientX, y: event.clientY }
        }));
      }
    };

    const handleMouseUp = () => {
      setGestureState(prev => ({ ...prev, mode: 'none' }));
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scaleDelta = event.deltaY > 0 ? 0.9 : 1.1;
      setModelScale(prev => Math.max(0.02, Math.min(3, prev * scaleDelta)));
    };

    // Event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchstart', handleDoubleTap, { passive: false });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchstart', handleDoubleTap);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('wheel', handleWheel);
      clearTimeout(tapTimeout);
    };
  }, [gestureState, modelScale]);

  // Reset model to original position and ensure it's anchored
  const resetModelPosition = () => {
    setModelPosition([0, 0, -0.5]); // Match the default position parameter
    setRotation({ x: 0, y: 0 });
    setModelScale(scale);
    setIsSelected(false);
    setGestureState(prev => ({
      ...prev,
      isAnchored: true
    }));
  };

  // Apply rotation and position to model with world tracking
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x = rotation.x;
      modelRef.current.rotation.y = rotation.y;
      // Ensure position is always set to the fixed position for better anchoring
      modelRef.current.position.set(...modelPosition);
      modelRef.current.scale.setScalar(modelScale);
    }
  });

  return (
    <group ref={modelRef} position={modelPosition} scale={modelScale}>
      <primitive object={scene} />
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
      {/* Enhanced anchor point indicator - positioned relative to model's center */}
      <mesh position={[0, -0.05, 0]} visible={true}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color={gestureState.isAnchored ? "#ff0000" : "#ffaa00"} transparent opacity={0.9} />
      </mesh>
      {/* Ground plane for better spatial reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} visible={true}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial color={gestureState.isAnchored ? "#ff0000" : "#ffaa00"} transparent opacity={0.2} side={2} />
      </mesh>
      {/* Anchoring indicator */}
      {gestureState.isAnchored && (
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

// Camera Background Component
function CameraBackground({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) {
  const { scene, camera } = useThree();
  
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    // Create background geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide
    });
    
    const backgroundMesh = new THREE.Mesh(geometry, material);
    backgroundMesh.position.z = -2;
    backgroundMesh.name = 'cameraBackground';
    
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

const ARCamera: React.FC<ARCameraProps> = ({
  modelUrl,
  modelScale = 0.1,
  onCameraReady,
  onCameraError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      try {
        // Request camera access with specific constraints for AR
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }, // Prefer back camera
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
                onCameraReady?.();
              }).catch((error) => {
                console.error('Error playing video:', error);
                onCameraError?.('Failed to start camera feed');
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
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device.';
        }
        
        onCameraError?.(errorMessage);
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCameraReady, onCameraError]);

  return (
    <div className="relative w-full h-full">
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
            near: 0.1,
            far: 1000
          }}
          gl={{ 
            alpha: true, 
            antialias: true,
            preserveDrawingBuffer: true
          }}
        >
          <CameraBackground videoRef={videoRef} />
          
          <ambientLight intensity={0.8} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <pointLight position={[-1, -1, 1]} intensity={0.5} />
          
          <ARModel 
            url={modelUrl} 
            scale={modelScale}
            position={[0, 0, -0.5]}
          />

          {/* Reset Button Overlay */}
          <mesh position={[0.3, -0.3, -0.5]} onClick={() => {
            // Reset functionality can be added here
          }}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#0066ff" transparent opacity={0.8} />
          </mesh>
        </Canvas>
      )}
    </div>
  );
};

export default ARCamera;