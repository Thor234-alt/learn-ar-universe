
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play, FileText, Video, Image, FileIcon, Link, Box } from 'lucide-react';
import { getContentIcon } from './moduleContentViewerUtils';

interface ContentListSidebarProps {
  contents: any[];
  loading: boolean;
  completedCount: number;
  progressPercentage: number;
  selectedContent: any;
  setSelectedContent: (content: any) => void;
  isContentCompleted: (id: string) => boolean;
}

const icons = { FileText, Video, Image, FileIcon, Link, Box };

const ContentListSidebar = ({
  contents,
  loading,
  completedCount,
  progressPercentage,
  selectedContent,
  setSelectedContent,
  isContentCompleted
}: ContentListSidebarProps) => (
  <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r bg-gray-50 p-4 overflow-y-auto">
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
                  {getContentIcon(content.content_type, icons)}
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
);

export default ContentListSidebar;
