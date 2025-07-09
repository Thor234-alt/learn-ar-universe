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
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 });

  // Handle touch/mouse interactions
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      setIsDragging(true);
      setLastPointer({ x: event.clientX, y: event.clientY });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      
      const deltaX = event.clientX - lastPointer.x;
      const deltaY = event.clientY - lastPointer.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01
      }));
      
      setLastPointer({ x: event.clientX, y: event.clientY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, lastPointer]);

  // Apply rotation to model
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x = rotation.x;
      modelRef.current.rotation.y = rotation.y;
    }
  });

  return (
    <group ref={modelRef} position={position} scale={scale}>
      <primitive object={scene} />
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
        </Canvas>
      )}
    </div>
  );
};

export default ARCamera;