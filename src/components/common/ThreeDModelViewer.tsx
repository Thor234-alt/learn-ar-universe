
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, PresentationControls, Environment, Html } from '@react-three/drei'; // Added Html
import { Loader2 } from 'lucide-react';

interface ThreeDModelViewerProps {
  modelUrl: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

const ModelLoader: React.FC = () => (
  // Centering is handled by Html component's `center` prop
  <div style={{ color: 'black', textAlign: 'center' }}>
    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-2 mx-auto" /> {/* Added mx-auto for centering icon */}
    <p>Loading 3D Model...</p>
  </div>
);

const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({ modelUrl }) => {
  if (!modelUrl) {
    return <div className="flex items-center justify-center h-full text-gray-500">No 3D model URL provided.</div>;
  }

  return (
    <div className="w-full h-full relative bg-gray-100 rounded">
      <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [0, 2, 5] }} style={{ touchAction: 'pan-y' }}>
        <color attach="background" args={['#e0e0e0']} />
        
        <Suspense fallback={<Html center><ModelLoader /></Html>}> {/* Used Html directly */}
          <PresentationControls
            speed={1.5}
            global
            zoom={0.7}
            polar={[-0.2, Math.PI / 3]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <Stage environment={null} intensity={0.6} contactShadowOpacity={0.5} shadowBias={-0.0015}>
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
  );
};

// Removed HtmlAsReactComponent helper

export default ThreeDModelViewer;
