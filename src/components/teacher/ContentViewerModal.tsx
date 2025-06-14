
import ModuleContentViewer from '@/components/student/ModuleContentViewer';

type ContentViewerModalProps = {
  isOpen: boolean;
  moduleId: string;
  topicId: string;
  onClose: () => void;
};

const ContentViewerModal = ({ isOpen, moduleId, topicId, onClose }: ContentViewerModalProps) => {
  return (
    <ModuleContentViewer
      isOpen={isOpen}
      moduleId={moduleId}
      topicId={topicId}
      onClose={onClose}
    />
  );
};

export default ContentViewerModal;
