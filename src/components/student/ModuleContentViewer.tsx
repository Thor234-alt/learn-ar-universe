import { useState, useEffect, Suspense, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Video, Image, FileIcon, Link, CheckCircle, Play, Box, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThreeDModelViewer from '@/components/common/ThreeDModelViewer';
import ContentListSidebar from './moduleContentViewer/ContentListSidebar';
import ContentViewerHeader from './moduleContentViewer/ContentViewerHeader';
import ContentDisplay from './moduleContentViewer/ContentDisplay';

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
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const { toast } = useToast();

  // --- New: time tracking and progress ---
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activityStartRef = useRef<number | null>(null); // timestamp in ms
  const activeSecondsRef = useRef<number>(0); // cummulative active seconds
  const lastProgressRef = useRef<number>(0);
  const lastEngagementRef = useRef<any>(null);

  // Calculate content progress (demo: text percent scrolled, video percent watched)
  function getCurrentContentProgress(): number {
    // Add modes for different content types as you see fit
    if (!selectedContent) return 0;
    if (selectedContent.content_type === 'text') {
      const textPanel = document.getElementById('content-text-panel');
      if (textPanel) {
        const scrolled = textPanel.scrollTop;
        const maxScroll = textPanel.scrollHeight - textPanel.clientHeight;
        if (maxScroll > 0) return Math.min(100, Math.round((scrolled / maxScroll) * 100));
      }
    }
    if (selectedContent.content_type === 'video') {
      const video: any = document.getElementById('content-video-tag');
      if (video && video.currentTime && video.duration) {
        return Math.round((video.currentTime / video.duration) * 100);
      }
    }
    // Fallback: not supported, or complete if present
    return isContentCompleted(selectedContent.id) ? 100 : 0;
  }
  // Calculate engagement metadata (scroll pos, video pos, browser info, etc)
  function getCurrentEngagementMetadata(): any {
    if (!selectedContent) return {};
    if (selectedContent.content_type === 'text') {
      const textPanel = document.getElementById('content-text-panel');
      if (textPanel) {
        return {
          scrollTop: textPanel.scrollTop,
          scrollHeight: textPanel.scrollHeight,
          lastViewedAt: new Date().toISOString(),
        };
      }
    }
    if (selectedContent.content_type === 'video') {
      const video: any = document.getElementById('content-video-tag');
      if (video) {
        return {
          currentTime: video.currentTime || 0,
          duration: video.duration || 0,
          paused: video.paused,
          lastViewedAt: new Date().toISOString(),
        };
      }
    }
    return {};
  }

  // --- Save Progress/Analytics to DB ---
  const saveContentProgress = async (isFinal: boolean = false) => {
    if (!user || !selectedContent) return;
    // Use topicId only if present/non-empty
    const effectiveTopicId = topicId && topicId.length > 0 ? topicId : null;
    const percent = getCurrentContentProgress();
    const analytics = getCurrentEngagementMetadata();
    const activeSeconds = activeSecondsRef.current;

    // Only write if percent or analytics meaningfully changed (unless final)
    if (
      !isFinal &&
      percent === lastProgressRef.current &&
      JSON.stringify(analytics) === JSON.stringify(lastEngagementRef.current)
    ) {
      return; // no update
    }
    lastProgressRef.current = percent;
    lastEngagementRef.current = analytics;

    const upsertObj: any = {
      student_id: user.id,
      module_id: moduleId,
      content_id: selectedContent.id,
      content_progress_percentage: percent,
      engagement_metadata: analytics,
      time_spent_active_seconds: activeSeconds,
      last_activity_at: new Date().toISOString(),
      ...(effectiveTopicId ? { topic_id: effectiveTopicId } : {}),
      ...(percent >= 100
        ? {
            content_completed_at: new Date().toISOString(),
          }
        : {})
    };

    await supabase.from('student_progress').upsert(upsertObj, {
      onConflict: effectiveTopicId
        ? 'student_id, module_id, topic_id, content_id'
        : 'student_id, module_id, content_id',
    });
    fetchProgress();
  };

  // --- Timing: Start/stop the progress timer ---
  function startTracking() {
    activityStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      // add active time
      if (activityStartRef.current) {
        activeSecondsRef.current += 5;
      }
      saveContentProgress(false);
    }, 5000); // every 5s
  }
  function stopTracking(saveFinal: boolean = true) {
    // Add last interval
    if (activityStartRef.current) {
      activeSecondsRef.current += Math.round((Date.now() - activityStartRef.current) / 1000);
      activityStartRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (saveFinal) saveContentProgress(true);
  }

  // On content change, stop tracking old and start new
  useEffect(() => {
    stopTracking(false);
    activeSecondsRef.current = 0;
    lastProgressRef.current = 0;
    lastEngagementRef.current = null;
    if (isOpen && selectedContent) {
      startTracking();
    }
    return () => stopTracking(true);
    // eslint-disable-next-line
  }, [selectedContent, isOpen]);

  // On modal close, ensure progress is saved
  useEffect(() => {
    if (!isOpen) {
      stopTracking(true);
    }
    // eslint-disable-next-line
  }, [isOpen]);

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
      // Query progress by student_id/module_id/content_id, topic_id optional
      const { data, error } = await supabase
        .from('student_progress')
        .select('content_id, content_completed_at, time_spent_minutes, topic_id')
        .eq('student_id', user.id)
        .eq('module_id', moduleId)
        .not('content_id', 'is', null);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const markContentComplete = async (contentId: string) => {
    if (!user) return;

    try {
      // Use topicId only if present/non-empty
      const effectiveTopicId = topicId && topicId.length > 0 ? topicId : null;

      const upsertObj: any = {
        student_id: user.id,
        module_id: moduleId,
        content_id: contentId,
        content_completed_at: new Date().toISOString(),
        ...(effectiveTopicId ? { topic_id: effectiveTopicId } : {}),
      };

      const { error } = await supabase
        .from('student_progress')
        .upsert(upsertObj, {
          onConflict: effectiveTopicId
            ? 'student_id, module_id, topic_id, content_id'
            : 'student_id, module_id, content_id',
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Content marked as completed!"
      });

      await fetchProgress();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update progress: ${error.message}`,
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
    // Expecting new format: { rootModelUrl: string, urls: string[] }
    const rootModelUrl = contentData?.rootModelUrl;
    if (!rootModelUrl) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No 3D model root file available for this content.</p>
        </div>
      );
    }
    // Optional preview: list secondary files (e.g. .bin)
    return (
      <div className="flex flex-col h-full w-full">
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
              modelUrl={rootModelUrl}
              // Optionally pass secondary files if needed for future
              modelUrls={contentData?.urls}
              selectedRootUrl={rootModelUrl}
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
        {/* Sidebar */}
        <ContentListSidebar
          contents={contents}
          loading={loading}
          completedCount={completedCount}
          progressPercentage={progressPercentage}
          selectedContent={selectedContent}
          setSelectedContent={setSelectedContent}
          isContentCompleted={isContentCompleted}
        />
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white">
          <ContentViewerHeader
            selectedContent={selectedContent}
            isContentCompleted={isContentCompleted}
            onMarkComplete={() => selectedContent && markContentComplete(selectedContent.id)}
            onClose={onClose}
          />
          <div className="flex-1 p-2 md:p-4 overflow-y-auto relative">
            <ContentDisplay
              selectedContent={selectedContent}
              loading={loading}
              saveContentProgress={saveContentProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleContentViewer;
