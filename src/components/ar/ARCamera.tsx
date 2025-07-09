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

// AR 3D Model Component with Touch Controls
function ARModel({ url, scale = 0.1, position = [0, 0, -1] }: { 
  url: string; 
  scale?: number; 
  position?: [number, number, number];
}) {
  const { scene } = useGLTF(url, true);
  const modelRef = useRef<THREE.Group>();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [modelPosition, setModelPosition] = useState<[number, number, number]>(position);
  const [modelScale, setModelScale] = useState(scale);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 });
  const [gestureState, setGestureState] = useState({ 
    initialDistance: 0, 
    initialScale: scale,
    isScaling: false 
  });

  // Handle touch/mouse interactions with enhanced gestures
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' && event.detail === 2) {
        // Double tap - reset position
        resetModelPosition();
        return;
      }
      
      setIsDragging(true);
      setIsSelected(true);
      setLastPointer({ x: event.clientX, y: event.clientY });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      
      const deltaX = event.clientX - lastPointer.x;
      const deltaY = event.clientY - lastPointer.y;
      
      // Check if this is a multi-touch gesture
      if (event.pressure > 0.5) {
        // Movement gesture - translate model
        setModelPosition(prev => [
          prev[0] + deltaX * 0.001,
          prev[1] - deltaY * 0.001,
          prev[2]
        ]);
      } else {
        // Rotation gesture
        setRotation(prev => ({
          x: prev.x + deltaY * 0.01,
          y: prev.y + deltaX * 0.01
        }));
      }
      
      setLastPointer({ x: event.clientX, y: event.clientY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    // Touch events for pinch to scale
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        setGestureState({
          initialDistance: distance,
          initialScale: modelScale,
          isScaling: true
        });
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && gestureState.isScaling) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const scaleFactor = distance / gestureState.initialDistance;
        const newScale = Math.max(0.05, Math.min(2, gestureState.initialScale * scaleFactor));
        setModelScale(newScale);
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        setGestureState(prev => ({ ...prev, isScaling: false }));
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, lastPointer, gestureState, modelScale]);

  // Reset model to original position
  const resetModelPosition = () => {
    setModelPosition([0, 0, -1]);
    setRotation({ x: 0, y: 0 });
    setModelScale(scale);
    setIsSelected(false);
  };

  // Apply rotation and position to model with world tracking
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x = rotation.x;
      modelRef.current.rotation.y = rotation.y;
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
      {/* Anchor point indicator */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
      </mesh>
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