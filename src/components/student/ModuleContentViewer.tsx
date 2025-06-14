import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Video, Image, FileIcon, Link, CheckCircle, Play, Box, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThreeDModelViewer from '@/components/common/ThreeDModelViewer';

type ModuleContent = {
  id: string;
  title: string;
  content_type: string;
  content_data: any;
  description: string;
  order_index: number;
  is_active: boolean;
};

type ContentProgress = {
  content_id: string;
  content_completed_at: string | null;
  time_spent_minutes: number;
};

type ModuleContentViewerProps = {
  moduleId: string;
  topicId: string;
  isOpen: boolean;
  onClose: () => void;
};

const ModuleContentViewer = ({ moduleId, topicId, isOpen, onClose }: ModuleContentViewerProps) => {
  const { user } = useAuth();
  const [contents, setContents] = useState<ModuleContent[]>([]);
  const [progress, setProgress] = useState<ContentProgress[]>([]);
  const [selectedContent, setSelectedContent] = useState<ModuleContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [firstTopicId, setFirstTopicId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get the effective topic ID to use for progress tracking
  const getEffectiveTopicId = async (): Promise<string | null> => {
    if (topicId && topicId !== '') {
      return topicId;
    }

    // If no topicId provided, try to get the first topic of the module
    if (!firstTopicId) {
      try {
        const { data: topics, error } = await supabase
          .from('topics')
          .select('id')
          .eq('module_id', moduleId)
          .order('order_index', { ascending: true })
          .limit(1);

        if (error) {
          console.error('Error fetching topics:', error);
          return null;
        }

        if (topics && topics.length > 0) {
          setFirstTopicId(topics[0].id);
          return topics[0].id;
        }
      } catch (error) {
        console.error('Error getting effective topic ID:', error);
      }
    }

    return firstTopicId;
  };

  useEffect(() => {
    if (isOpen && moduleId) {
      console.log('ModuleContentViewer opening with:', { moduleId, topicId });
      fetchModuleContent();
      fetchProgress();
    }
  }, [isOpen, moduleId]);

  const fetchModuleContent = async () => {
    setLoading(true);
    try {
      console.log('Fetching module content for module:', moduleId);
      const { data, error } = await supabase
        .from('module_content')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      console.log('Module content fetched:', data?.length || 0, 'items');
      setContents(data || []);
      
      if (data && data.length > 0 && !selectedContent) {
        setSelectedContent(data[0]);
        console.log('Selected first content item:', data[0].title);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load module content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('content_id, content_completed_at, time_spent_minutes')
        .eq('student_id', user.id)
        .eq('module_id', moduleId)
        .not('content_id', 'is', null);

      if (error) throw error;
      console.log('Progress fetched:', data?.length || 0, 'items');
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const markContentComplete = async (contentId: string) => {
    if (!user) return;

    try {
      console.log('Marking content as complete:', contentId);
      
      // Get the effective topic ID for progress tracking
      const effectiveTopicId = await getEffectiveTopicId();
      
      if (!effectiveTopicId) {
        toast({
          title: "Warning",
          description: "No topic found for progress tracking, but content will be marked as viewed.",
          variant: "default"
        });
        return;
      }

      const { error } = await supabase
        .from('student_progress')
        .upsert({
          student_id: user.id,
          module_id: moduleId,
          topic_id: effectiveTopicId,
          content_id: contentId,
          content_completed_at: new Date().toISOString(),
          progress_percentage: 0 // Will be calculated by trigger
        }, {
          onConflict: 'student_id,module_id,topic_id'
        });

      if (error) {
        console.error('Error marking content complete:', error);
        throw error;
      }

      console.log('Content marked as complete successfully');
      toast({
        title: "Success",
        description: "Content marked as completed!"
      });

      // Refresh progress data
      await fetchProgress();
    } catch (error) {
      console.error('Error marking content complete:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'pdf': return <FileIcon className="w-4 h-4" />;
      case 'url': return <Link className="w-4 h-4" />;
      case '3d_model': return <Box className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isContentCompleted = (contentId: string) => {
    return progress.some(p => p.content_id === contentId && p.content_completed_at);
  };

  const completedCount = contents.filter(content => isContentCompleted(content.id)).length;
  const progressPercentage = contents.length > 0 ? Math.round((completedCount / contents.length) * 100) : 0;

  const renderVideoContent = (videoData: any) => {
    const videoUrl = videoData?.url;
    if (!videoUrl) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No video URL provided</p>
        </div>
      );
    }

    // Check if it's a YouTube URL
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    
    if (isYouTube) {
      // Convert YouTube URL to embed format
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

    // Check if it's a Vimeo URL
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

    // For direct video files or other video URLs, use HTML5 video element
    return (
      <div className="h-full flex items-center justify-center">
        <video
          controls
          className="max-w-full max-h-full rounded"
          preload="metadata"
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
  };

  const renderThreeDModelContent = (contentData: any, title: string) => {
    const urls: string[] =
      Array.isArray(contentData?.urls) && contentData.urls.length > 0
        ? contentData.urls
        : contentData && contentData.url ? [contentData.url] : [];
    const [selectedUrlIdx, setSelectedUrlIdx] = useState(0); // declare hook inside function
    // If no files, show a message
    if (!urls.length) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No 3D model files available for this content.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col h-full w-full">
        {/* 3D Model Gallery Selector if multiple */}
        {urls.length > 1 && (
          <div className="flex flex-row space-x-2 mb-2">
            {urls.map((u, i) => (
              <button
                key={i}
                onClick={() => setSelectedUrlIdx(i)}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  i === selectedUrlIdx
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                }`}
              >
                Model {i + 1}
              </button>
            ))}
          </div>
        )}
        {/* 3D Model Viewer */}
        <div className="flex-1 min-h-[300px] h-[48vw] max-h-[70vh] w-full rounded-lg bg-gray-100">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="mt-2">Loading 3D Viewer...</p>
              </div>
            }
          >
            <ThreeDModelViewer
              modelUrl={urls[selectedUrlIdx]}
            />
          </Suspense>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Content List Sidebar */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r bg-gray-50 p-4 overflow-y-auto">
          {/* ... keep existing code (sidebar header, progress bar, content list mapping) */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Module Content</h3>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{completedCount}/{contents.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {contents.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-8">
              <p>No content available for this module yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contents.map((content) => (
                <Card 
                  key={content.id} 
                  className={`cursor-pointer transition-colors hover:shadow-md ${
                    selectedContent?.id === content.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedContent(content)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">
                        {getContentIcon(content.content_type)}
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{content.title}</span>
                      {isContentCompleted(content.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Play className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    {content.description && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{content.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Content Viewer */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between bg-gray-50 md:bg-white">
            {/* ... keep existing code (header content: icon, title, buttons) */}
            <div className="flex items-center space-x-2 min-w-0">
              {selectedContent && <div className="text-gray-700">{getContentIcon(selectedContent.content_type)}</div>}
              <h2 className="text-xl font-semibold truncate">{selectedContent?.title || 'Module Content'}</h2>
            </div>
            <div className="flex items-center space-x-2">
              {selectedContent && !isContentCompleted(selectedContent.id) && (
                <Button 
                  onClick={() => markContentComplete(selectedContent.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Mark Complete
                </Button>
              )}
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>

          {/* Content Display */}
          <div className="flex-1 p-2 md:p-4 overflow-y-auto relative">
            {loading && !selectedContent ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              </div>
            ) : selectedContent ? (
              <div className="h-full w-full">
                {selectedContent.content_type === 'text' && (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap">
                      {selectedContent.content_data?.text}
                    </div>
                  </div>
                )}
                
                {selectedContent.content_type === 'video' && renderVideoContent(selectedContent.content_data)}
                
                {selectedContent.content_type === 'image' && (
                  <div className="flex items-center justify-center h-full">
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
                  renderThreeDModelContent(selectedContent.content_data, selectedContent.title)
                }
              </div>
            ) : contents.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">No content available</p>
                  <p className="text-sm">This module doesn't have any content yet.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select content to view
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleContentViewer;
