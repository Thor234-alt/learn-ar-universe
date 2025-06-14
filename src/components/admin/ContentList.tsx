
import React from "react";
import { Card } from "@/components/ui/card";
import ContentCard from "./ContentCard";
import { ModuleContent, Module } from "./ContentManagement";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContentListProps = {
  contents: ModuleContent[];
  loading: boolean;
  selectedModule: Module | undefined;
  deleteContent: (contentId: string) => void;
  setIsCreateContentOpen: (open: boolean) => void;
  // New prop: Sub info editing
  onEditSubInfo?: (id: string, subInfo: string | null | undefined) => void;
};

const ContentList: React.FC<ContentListProps> = ({
  contents,
  loading,
  selectedModule,
  deleteContent,
  setIsCreateContentOpen,
  onEditSubInfo
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!selectedModule) {
    return null;
  }

  return (
    <div className="grid gap-4">
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          deleteContent={deleteContent}
          onEditSubInfo={onEditSubInfo}
        />
      ))}
      {contents.length === 0 && !loading && (
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No content yet</h3>
            <p className="text-gray-400 mb-4">
              Start by adding some learning content to this module.
            </p>
            <Button
              onClick={() => setIsCreateContentOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Add First Content
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ContentList;
