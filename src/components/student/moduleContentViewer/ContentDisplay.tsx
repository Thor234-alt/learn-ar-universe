
import { Loader2 } from 'lucide-react';
import ThreeDModelViewer from '@/components/common/ThreeDModelViewer';

interface ContentDisplayProps {
  selectedContent: any;
  loading: boolean;
  saveContentProgress: (isFinal?: boolean) => void;
}

// Helper to render different content types
function renderVideoContent(selectedContent: any, saveProgress: (isFinal?: boolean) => void) {
  const videoData = { ...selectedContent.content_data, id: "content-video-tag", onTimeUpdate: () => saveProgress(false) };
  const videoUrl = videoData?.url;
  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No video URL provided</p>
      </div>
    );
  }
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  if (isYouTube) {
    let embedUrl = videoUrl;
    if (videoUrl.includes('watch?v=')) {
      const videoId = videoUrl.split('watch?v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    return (
      <div className="h-full">
        <iframe
          src={embedUrl}
          className="w-full h-full rounded"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={selectedContent?.title}
        />
      </div>
    );
  }
  const isVimeo = videoUrl.includes('vimeo.com');
  if (isVimeo) {
    const videoId = videoUrl.split('/').pop();
    const embedUrl = `https://player.vimeo.com/video/${videoId}`;
    return (
      <div className="h-full">
        <iframe
          src={embedUrl}
          className="w-full h-full rounded"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={selectedContent?.title}
        />
      </div>
    );
  }
  return (
    <div className="h-full flex items-center justify-center">
      <video
        controls
        className="max-w-full max-h-full rounded"
        preload="metadata"
        id="content-video-tag"
        onTimeUpdate={() => saveProgress(false)}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
        <p>
          Your browser doesn't support HTML5 video. 
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            Click here to view the video
          </a>
        </p>
      </video>
    </div>
  );
}

function renderThreeDModelContent(contentData: any, title: string) {
  const rootModelUrl = contentData?.rootModelUrl;
  if (!rootModelUrl) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No 3D model root file available for this content.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 min-h-[300px] h-[48vw] max-h-[70vh] w-full rounded-lg bg-gray-100">
        <ThreeDModelViewer
          modelUrl={rootModelUrl}
          modelUrls={contentData?.urls}
          selectedRootUrl={rootModelUrl}
        />
      </div>
    </div>
  );
}

const ContentDisplay = ({ selectedContent, loading, saveContentProgress }: ContentDisplayProps) => {
  if (loading && !selectedContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!selectedContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select content to view
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {selectedContent.content_type === 'text' && (
        <div
          className="prose max-w-none"
          id="content-text-panel"
          style={{ height: "100%", overflow: "auto" }}
          onScroll={() => saveContentProgress(false)}
        >
          <div className="whitespace-pre-wrap">
            {selectedContent.content_data?.text}
          </div>
        </div>
      )}
      {selectedContent.content_type === 'video' &&
        renderVideoContent(selectedContent, saveContentProgress)}
      {selectedContent.content_type === 'image' && (
        <div className="flex flex-col items-center justify-center h-full">
          <img
            src={selectedContent.content_data?.url}
            alt={selectedContent.title}
            className="max-w-full max-h-full object-contain rounded"
          />
        </div>
      )}
      {(selectedContent.content_type === 'pdf' || selectedContent.content_type === 'url') && (
        <div className="h-full">
          <iframe
            src={selectedContent.content_data?.url}
            className="w-full h-full rounded"
            frameBorder="0"
            title={selectedContent.title}
          />
        </div>
      )}
      {selectedContent.content_type === '3d_model' &&
        renderThreeDModelContent(selectedContent.content_data, selectedContent.title)}
      {/* Sub Information Display (for all content types, if present) */}
      {selectedContent.sub_info && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-1">Sub Information:</h4>
          <p className="whitespace-pre-line text-gray-900 bg-orange-50 p-3 rounded">
            {selectedContent.sub_info}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;
