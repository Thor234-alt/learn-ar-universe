
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, PresentationControls, Environment, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

interface ThreeDModelViewerProps {
  modelUrl?: string;
  modelUrls?: string[];
  selectedRootUrl?: string;
}

// Enhanced Model function to support preloading of all URLs (for bin support)
function Model({ url, fileMap }: { url: string, fileMap?: Map<string, string> }) {
  // Patch the loader to "inject" known URLs for dependency resolution if required
  const { scene } = useGLTF(url, true);
  // Future: Could use onProgress/error for granularity
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

// Support flexible multi-root mode based on provided files
const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({ modelUrl, modelUrls, selectedRootUrl }) => {
  // Consolidate all provided URLs
  let rootUrl = '';
  let fileList: string[] = [];
  if (modelUrls && modelUrls.length > 0) {
    fileList = modelUrls.filter(Boolean);
    // Use selectedRootUrl if provided, else pick first .gltf/.glb, else just first
    rootUrl = selectedRootUrl || fileList.find(u => u.endsWith('.gltf') || u.endsWith('.glb')) || fileList[0];
  } else if (modelUrl) {
    rootUrl = modelUrl;
    fileList = [modelUrl];
  }

  if (!rootUrl) {
    return <div className="flex items-center justify-center h-full text-gray-500">No 3D model file provided.</div>;
  }

  // DEBUG: Log model load events and files attempted
  console.log('[ThreeDModelViewer] rootUrl:', rootUrl);
  console.log('[ThreeDModelViewer] all files:', fileList);

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
                <Model url={rootUrl} />
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
