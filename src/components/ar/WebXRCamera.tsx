import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

interface WebXRCameraProps {
  modelUrl: string;
  modelScale?: number;
  onCameraReady?: () => void;
  onCameraError?: (error: string) => void;
}

// Reticle component for hit testing visualization
function Reticle() {
  const reticleRef = useRef<THREE.Mesh>(null);
  const [visible, setVisible] = useState(false);
  
  // Make the reticle follow the hit test results
  useFrame((state, delta) => {
    if (reticleRef.current) {
      // Subtle animation for better visibility
      reticleRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <mesh 
      ref={reticleRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      visible={visible}
    >
      <ringGeometry args={[0.08, 0.1, 32]} />
      <meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
    </mesh>
  );
}

// Anchored model component
function AnchoredModel({ 
  url, 
  scale = 0.1, 
  anchorMatrix = new THREE.Matrix4(),
  isAnchored = false
}: { 
  url: string; 
  scale?: number; 
  anchorMatrix?: THREE.Matrix4;
  isAnchored?: boolean;
}) {
  const { scene } = useGLTF(url, true);
  const modelRef = useRef<THREE.Group>(null);
  const [modelBounds, setModelBounds] = useState<THREE.Box3 | null>(null);
  
  // Calculate model bounds on load
  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      setModelBounds(box);
      
      // Center the model geometry
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);
      
      // Move model up so it sits on the plane
      const size = new THREE.Vector3();
      box.getSize(size);
      scene.position.y += size.y / 2;
      
      console.log('[AR] Model prepared, centered and adjusted to sit on plane');
    }
  }, [scene]);
  
  // Update model from anchor matrix
  useFrame(() => {
    if (modelRef.current && isAnchored) {
      modelRef.current.matrix.copy(anchorMatrix);
      modelRef.current.matrix.decompose(
        modelRef.current.position,
        modelRef.current.quaternion,
        modelRef.current.scale
      );
      
      // Apply scale after decomposition
      modelRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <group ref={modelRef} matrixAutoUpdate={false}>
      <primitive object={scene} scale={scale} />
      
      {/* Anchor indicator */}
      {isAnchored && (
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* Ground reference plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} visible={isAnchored}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Main WebXR Scene component
function ARScene({ 
  modelUrl, 
  modelScale = 0.1 
}: { 
  modelUrl: string; 
  modelScale?: number;
}) {
  const { gl, camera, scene } = useThree();
  const reticleRef = useRef<THREE.Mesh>(null);
  const [hitTestSource, setHitTestSource] = useState<XRHitTestSource | null>(null);
  const [hitTestSourceRequested, setHitTestSourceRequested] = useState(false);
  const [referenceSpace, setReferenceSpace] = useState<XRReferenceSpace | null>(null);
  const [session, setSession] = useState<XRSession | null>(null);
  const [isAnchored, setIsAnchored] = useState(false);
  const [anchorMatrix, setAnchorMatrix] = useState(new THREE.Matrix4());
  const [anchors] = useState(new Set<XRAnchor>());
  const [planeFound, setPlaneFound] = useState(false);
  const [showHint, setShowHint] = useState(true);
  
  // Feature detection
  const [features, setFeatures] = useState({
    anchorsSupported: false,
    hitTestSupported: false
  });
  
  // Initialize WebXR session
  useEffect(() => {
    if (!gl.xr) return;
    
    // Check for feature support
    navigator.xr?.isSessionSupported('immersive-ar').then(supported => {
      if (supported) {
        console.log('[AR] WebXR AR supported');
        
        // Check for hit-test support
        if ('XRHitTestSource' in window) {
          setFeatures(prev => ({ ...prev, hitTestSupported: true }));
          console.log('[AR] Hit-test supported: yes');
        } else {
          console.log('[AR] Hit-test supported: no');
        }
        
        // Check for anchors support
        if ('XRAnchor' in window) {
          setFeatures(prev => ({ ...prev, anchorsSupported: true }));
          console.log('[AR] Anchors supported: yes');
        } else {
          console.log('[AR] Anchors supported: no');
        }
      }
    });
    
    // Set up session
    const sessionInit = { 
      requiredFeatures: ['hit-test', 'anchors', 'local-floor'] as string[],
      optionalFeatures: [] as string[]
    };
    
    gl.xr.addEventListener('sessionstart', onSessionStart);
    gl.xr.addEventListener('sessionend', onSessionEnd);
    
    return () => {
      gl.xr.removeEventListener('sessionstart', onSessionStart);
      gl.xr.removeEventListener('sessionend', onSessionEnd);
    };
    
    function onSessionStart(event: any) {
      const session = gl.xr.getSession();
      setSession(session);
      
      if (session) {
        console.log('[AR] XR Session started');
        
        session.addEventListener('select', onSelect);
        
        // Request reference space
        session.requestReferenceSpace('local-floor')
          .then((space) => {
            setReferenceSpace(space);
            console.log('[AR] Reference space acquired');
          })
          .catch(error => {
            console.error('[AR] Error requesting reference space:', error);
            // Fallback to local space
            return session.requestReferenceSpace('local');
          })
          .then(space => {
            if (space && !referenceSpace) {
              setReferenceSpace(space);
              console.log('[AR] Fallback reference space acquired');
            }
          });
      }
    }
    
    function onSessionEnd() {
      console.log('[AR] XR Session ended');
      setSession(null);
      setHitTestSource(null);
      setHitTestSourceRequested(false);
      setReferenceSpace(null);
      setIsAnchored(false);
      anchors.clear();
      
      // Hide hint when session ends
      setShowHint(false);
    }
    
    function onSelect(event: any) {
      if (!reticleRef.current || !reticleRef.current.visible || !planeFound) return;
      
      const frame = event.frame;
      const session = event.target;
      
      if (!referenceSpace) return;
      
      // Get hit test results
      const hitTestResults = frame.getHitTestResults(hitTestSource!);
      if (hitTestResults.length === 0) return;
      
      const hit = hitTestResults[0];
      
      // Try to create anchor
      if (features.anchorsSupported && hit.createAnchor) {
        hit.createAnchor()
          .then((anchor: XRAnchor) => {
            console.log('[AR] Anchor created successfully');
            anchors.add(anchor);
            setIsAnchored(true);
            
            // Hide hint after successful placement
            setShowHint(false);
          })
          .catch((error: any) => {
            console.error('[AR] Error creating anchor:', error);
            // Fallback to placing without anchor
            fallbackPlacement(hit);
          });
      } else {
        // Fallback if anchors not supported
        fallbackPlacement(hit);
      }
    }
    
    function fallbackPlacement(hit: XRHitTestResult) {
      console.log('[AR] Using fallback placement (no anchoring)');
      const pose = hit.getPose(referenceSpace!);
      if (pose) {
        setAnchorMatrix(new THREE.Matrix4().fromArray(pose.transform.matrix));
        setIsAnchored(true);
        
        // Hide hint after successful placement
        setShowHint(false);
      }
    }
  }, [gl.xr, anchors, features, hitTestSource, planeFound, referenceSpace]);
  
  // Set up hit testing
  useFrame((state) => {
    if (!session || !referenceSpace) return;
    
    const frame = state.gl.xr.getFrame();
    
    // Request hit test source once
    if (!hitTestSourceRequested) {
      session.requestReferenceSpace('viewer')
        .then((viewerSpace) => {
          session.requestHitTestSource({ space: viewerSpace })
            .then((source) => {
              setHitTestSource(source);
              console.log('[AR] Hit test source created');
            })
            .catch(err => {
              console.error('[AR] Error creating hit test source:', err);
            });
        })
        .catch(err => {
          console.error('[AR] Error requesting viewer space:', err);
        });
      
      setHitTestSourceRequested(true);
      return;
    }
    
    // Process hit test results
    if (hitTestSource && reticleRef.current) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        
        if (pose) {
          // Update reticle position
          reticleRef.current.visible = true;
          reticleRef.current.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );
          reticleRef.current.quaternion.set(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          );
          
          // Indicate that we found a plane
          if (!planeFound) {
            setPlaneFound(true);
            console.log('[AR] Surface detected');
          }
        }
      } else {
        // Hide reticle when no hit test results
        reticleRef.current.visible = false;
        
        if (planeFound) {
          setPlaneFound(false);
          console.log('[AR] Surface lost');
          
          // Show hint again if we lost the plane and model isn't anchored
          if (!isAnchored) {
            setShowHint(true);
          }
        }
      }
    }
    
    // Update anchored objects
    if (isAnchored && features.anchorsSupported) {
      for (const anchor of anchors) {
        const anchorPose = frame.getPose(anchor.anchorSpace, referenceSpace);
        if (anchorPose) {
          setAnchorMatrix(new THREE.Matrix4().fromArray(anchorPose.transform.matrix));
        }
      }
    }
  });
  
  return (
    <>
      {/* Reticle for hit testing */}
      <mesh 
        ref={reticleRef} 
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
      </mesh>
      
      {/* Anchored 3D model */}
      <AnchoredModel 
        url={modelUrl} 
        scale={modelScale} 
        anchorMatrix={anchorMatrix}
        isAnchored={isAnchored}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      
      {/* UI Overlay */}
      {showHint && !isAnchored && (
        <Html position={[0, 0, -0.5]} center>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '20px',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            pointerEvents: 'none'
          }}>
            Move your device to find a surface
          </div>
        </Html>
      )}
    </>
  );
}

// HTML overlay component for WebXR
function Html({ children, position, center }: { 
  children: React.ReactNode; 
  position: [number, number, number]; 
  center?: boolean;
}) {
  const { camera } = useThree();
  const ref = useRef<HTMLDivElement>(null);
  
  useFrame(() => {
    if (!ref.current) return;
    
    const pos = new THREE.Vector3(...position);
    pos.project(camera);
    
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    
    ref.current.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
  });
  
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        zIndex: 100
      }}
    >
      {children}
    </div>
  );
}

// Main WebXR Camera component
const WebXRCamera: React.FC<WebXRCameraProps> = ({
  modelUrl,
  modelScale = 0.1,
  onCameraReady,
  onCameraError
}) => {
  const [isXRSupported, setIsXRSupported] = useState<boolean | null>(null);
  const [isXRSession, setIsXRSession] = useState(false);
  
  // Check for WebXR support
  useEffect(() => {
    if (!navigator.xr) {
      setIsXRSupported(false);
      onCameraError?.('WebXR not supported in this browser');
      return;
    }
    
    navigator.xr.isSessionSupported('immersive-ar')
      .then(supported => {
        setIsXRSupported(supported);
        if (!supported) {
          onCameraError?.('AR not supported on this device');
        } else {
          onCameraReady?.();
        }
      })
      .catch(error => {
        console.error('[AR] Error checking XR support:', error);
        setIsXRSupported(false);
        onCameraError?.('Error checking AR support');
      });
  }, [onCameraReady, onCameraError]);
  
  // Handle session state
  const handleSessionStart = () => {
    setIsXRSession(true);
    console.log('[AR] XR Session started');
  };
  
  const handleSessionEnd = () => {
    setIsXRSession(false);
    console.log('[AR] XR Session ended');
  };
  
  if (isXRSupported === false) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <div className="text-center p-4">
          <h3 className="text-xl font-bold mb-2">AR Not Supported</h3>
          <p>Your device or browser doesn't support WebXR Augmented Reality.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <Canvas
        className="absolute inset-0"
        camera={{ fov: 70, position: [0, 0, 0] }}
        gl={{ 
          alpha: true, 
          antialias: true,
          preserveDrawingBuffer: true
        }}
        onCreated={({ gl }) => {
          gl.xr.enabled = true;
          gl.xr.addEventListener('sessionstart', handleSessionStart);
          gl.xr.addEventListener('sessionend', handleSessionEnd);
        }}
      >
        <ARScene modelUrl={modelUrl} modelScale={modelScale} />
      </Canvas>
      
      {/* AR Session Button */}
      {!isXRSession && isXRSupported && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg"
            onClick={() => {
              const canvas = document.querySelector('canvas');
              if (canvas) {
                // @ts-ignore - WebXR types not fully supported in TypeScript
                const gl = canvas.getContext('webgl2', { xrCompatible: true });
                const xr = (gl as any)?.xr;
                if (xr) {
                  xr.requestSession('immersive-ar', {
                    requiredFeatures: ['hit-test', 'anchors', 'local-floor'],
                    optionalFeatures: []
                  }).catch((err: Error) => {
                    console.error('[AR] Error starting AR session:', err);
                    onCameraError?.(err.message);
                  });
                }
              }
            }}
          >
            Start AR Experience
          </button>
        </div>
      )}
    </div>
  );
};

export default WebXRCamera;