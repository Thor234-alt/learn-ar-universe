
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, PresentationControls, Environment, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

interface ThreeDModelViewerProps {
  modelUrl: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

const ModelLoader: React.FC = () => (
  <div style={{ color: 'black', textAlign: 'center' }}>
    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-2 mx-auto" />
    <p>Loading 3D Model...</p>
  </div>
);

// Error boundary wrapper for Three.js viewer to prevent crashes
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, errorMsg: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message || "Failed to render 3D model." };
  }
  componentDidCatch(error: Error, info: any) {
    // log error if needed
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

const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({ modelUrl }) => {
  if (!modelUrl) {
    return <div className="flex items-center justify-center h-full text-gray-500">No 3D model URL provided.</div>;
  }

  // Wrap the Canvas in ErrorBoundary
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
                <Model url={modelUrl} />
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

