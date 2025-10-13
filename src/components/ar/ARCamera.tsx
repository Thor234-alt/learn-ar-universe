import React, { useEffect, useRef, useState } from "react";
import "@google/model-viewer";

// Extend JSX to recognize <model-viewer> as a valid element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

interface ARCameraProps {
  modelUrl: string; // .glb file URL
  iosModelUrl?: string; // Optional .usdz file URL for iOS
}

const ARCamera: React.FC<ARCameraProps> = ({ modelUrl, iosModelUrl }) => {
  const modelViewerRef = useRef<any>(null);
  const [isARSupported, setIsARSupported] = useState(false);

  // Check if AR is supported on the device
  useEffect(() => {
    const checkARSupport = async () => {
      const mv = modelViewerRef.current;
      if (mv && mv.canActivateAR) {
        setIsARSupported(true);
        console.log("✅ AR Supported");
      } else {
        console.warn("❌ AR not supported on this device/browser");
      }
    };
    checkARSupport();
  }, []);

  // Auto-trigger AR on first user tap
  useEffect(() => {
    const handleUserGesture = () => {
      const mv = modelViewerRef.current;
      if (mv && mv.canActivateAR) {
        console.log("🚀 Launching AR mode...");
        mv.activateAR();
      } else {
        console.warn("⚠️ Cannot auto-activate AR on this device.");
      }
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
    };

    // Wait for the first tap/click (browser requirement)
    window.addEventListener("click", handleUserGesture);
    window.addEventListener("touchstart", handleUserGesture);

    return () => {
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        ios-src={iosModelUrl || modelUrl.replace(".glb", ".usdz")}
        alt="3D model for AR viewing"
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        xr-environment
        environment-image="https://modelviewer.dev/shared-assets/environments/neutral.hdr"
        camera-orbit="0deg 75deg auto"
        exposure="1"
        shadow-intensity="1"
        shadow-softness="0.9"
        disable-tap
        interaction-prompt="auto"
        loading="eager"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
      >
        {/* Hidden AR Button - required but not visible */}
        <button
          slot="ar-button"
          style={{
            display: "none",
          }}
        >
          Launch AR
        </button>
      </model-viewer>

      {!isARSupported && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/70">
          <p>AR not supported on this device.</p>
        </div>
      )}
    </div>
  );
};

export default ARCamera;
