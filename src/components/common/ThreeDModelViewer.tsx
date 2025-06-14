
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, PresentationControls, Environment } from '@react-three/drei';
import { Loader2 } from 'lucide-react'; // Using Lucide for loader icon

interface ThreeDModelViewerProps {
  modelUrl: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // You might want to scale or position the model appropriately
  // For now, let's apply a basic scale if needed.
  // const scale = scene.userData.scale || 1; // Example if scale info is in userData
  return <primitive object={scene} scale={1} />;
}

// A simple component to show while the model is loading
const ModelLoader: React.FC = () => (
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'black', textAlign: 'center' }}>
    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-2" />
    <p>Loading 3D Model...</p>
  </div>
);

const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({ modelUrl }) => {
  if (!modelUrl) {
    return <div className="flex items-center justify-center h-full text-gray-500">No 3D model URL provided.</div>;
  }

  return (
    <div className="w-full h-full relative bg-gray-100 rounded">
      <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [0, 2, 5] }} style={{ touchAction: 'pan-y' }}> {/* Adjusted touchAction */}
        <color attach="background" args={['#e0e0e0']} /> {/* Light gray background */}
        
        <Suspense fallback={<HtmlAsReactComponent><ModelLoader /></HtmlAsReactComponent>}>
          <PresentationControls
            speed={1.5}
            global
            zoom={0.7} // Adjusted default zoom
            polar={[-0.2, Math.PI / 3]} // Constrain vertical rotation
            azimuth={[-Math.PI / 4, Math.PI / 4]} // Constrain horizontal rotation
          >
            <Stage environment={null} intensity={0.6} contactShadowOpacity={0.5} shadowBias={-0.0015}>
              <Environment preset="city" /> {/* Using a preset environment for lighting */}
              <Model url={modelUrl} />
            </Stage>
          </PresentationControls>
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1} // Prevent zooming too close
            maxDistance={50} // Prevent zooming too far
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Helper to use React components as fallback in Suspense for R3F
// This is needed because Suspense directly within Canvas expects R3F components
const HtmlAsReactComponent = ({ children }: { children: React.ReactNode }) => {
  const { DREI } = require('@react-three/drei') as any; // A bit of a hack to get Html from drei
  if (!DREI?.Html) { // Fallback if Html cannot be loaded (e.g. test environment)
     return <>{children}</>;
  }
  return <DREI.Html center>{children}</DREI.Html>;
};


export default ThreeDModelViewer;
