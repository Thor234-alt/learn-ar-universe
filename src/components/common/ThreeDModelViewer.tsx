
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, PresentationControls, Environment, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

interface ThreeDModelViewerProps {
  // Accept either a string or array of model file URLs
  modelUrl?: string;
  modelUrls?: string[];
}

function Model({ url }: { url: string }) {
  // Drei/three.js will fetch .bin dependencies if referenced inside the .gltf and publicly accessible!
  // Only the main .gltf or .glb URL needs to be loaded; .bin is loaded by loader if referenced
  const { scene } = useGLTF(url, true); // prefetch true for cache
  return <primitive object={scene} scale={1} />;
}

const ModelLoader: React.FC = () => (
  <div style={{ color: 'black', textAlign: 'center' }}>
    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-2 mx-auto" />
    <p>Loading 3D Model...</p>
  </div>
);

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, errorMsg: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message || "Failed to render 3D model." };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('3D Model Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-red-600 bg-white rounded p-3">
          <span className="mr-2 font-bold">Error:</span>
          {this.state.errorMsg}
        </div>
      );
    }
    return this.props.children;
  }
}

const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({ modelUrl, modelUrls }) => {
  // Prioritize array; fallback to single modelUrl
  let mainUrl = '';
  if (modelUrls && modelUrls.length > 0) {
    // Prefer first .gltf/.glb if present, fallback any
    mainUrl = modelUrls.find(u => u.endsWith('.gltf') || u.endsWith('.glb')) || modelUrls[0];
  } else if (modelUrl) {
    mainUrl = modelUrl;
  }

  if (!mainUrl) {
    return <div className="flex items-center justify-center h-full text-gray-500">No 3D model file provided.</div>;
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-full relative bg-gray-100 rounded">
        <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [0, 2, 5] }} style={{ touchAction: 'pan-y' }}>
          <color attach="background" args={['#e0e0e0']} />
          <Suspense fallback={<Html center><ModelLoader /></Html>}>
            <PresentationControls
              speed={1.5}
              global
              zoom={0.7}
              polar={[-0.2, Math.PI / 3]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            >
              <Stage environment={null} intensity={0.6}>
                <Environment preset="city" />
                <Model url={mainUrl} />
              </Stage>
            </PresentationControls>
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minDistance={1}
              maxDistance={50}
            />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
};

export default ThreeDModelViewer;
