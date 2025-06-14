
import { Button } from '@/components/ui/button';
import { getContentIcon } from './moduleContentViewerUtils';
import { FileText, Video, Image, FileIcon, Link, Box } from 'lucide-react';

interface ContentViewerHeaderProps {
  selectedContent: any;
  isContentCompleted: (id: string) => boolean;
  onMarkComplete: () => void;
  onClose: () => void;
}

const icons = { FileText, Video, Image, FileIcon, Link, Box };

const ContentViewerHeader = ({
  selectedContent,
  isContentCompleted,
  onMarkComplete,
  onClose
}: ContentViewerHeaderProps) => (
  <div className="border-b p-4 flex items-center justify-between bg-gray-50 md:bg-white">
    <div className="flex items-center space-x-2 min-w-0">
      {selectedContent && <div className="text-gray-700">{getContentIcon(selectedContent.content_type, icons)}</div>}
      <h2 className="text-xl font-semibold truncate">{selectedContent?.title || 'Module Content'}</h2>
    </div>
    <div className="flex items-center space-x-2">
      {selectedContent && !isContentCompleted(selectedContent.id) && (
        <Button 
          onClick={onMarkComplete}
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
);

export default ContentViewerHeader;
