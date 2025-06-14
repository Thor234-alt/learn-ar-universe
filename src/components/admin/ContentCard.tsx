
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Video, Image, FileIcon, Link, Box } from "lucide-react";
import { ModuleContent } from "./ContentManagement";

type ContentCardProps = {
  content: ModuleContent;
  deleteContent: (id: string) => void;
};

const getContentIcon = (type: string) => {
  switch (type) {
    case "text":
      return <FileText className="w-4 h-4" />;
    case "video":
      return <Video className="w-4 h-4" />;
    case "image":
      return <Image className="w-4 h-4" />;
    case "pdf":
      return <FileIcon className="w-4 h-4" />;
    case "url":
      return <Link className="w-4 h-4" />;
    case "3d_model":
      return <Box className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const ContentCard: React.FC<ContentCardProps> = ({ content, deleteContent }) => (
  <Card className="bg-slate-800 border-slate-700">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getContentIcon(content.content_type)}
          <CardTitle className="text-white text-lg">{content.title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 capitalize bg-slate-700 px-2 py-1 rounded">
            {content.content_type.replace("_", " ")}
          </span>
          <Button
            onClick={() => deleteContent(content.id)}
            variant="outline"
            size="sm"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {content.description && (
        <CardDescription className="text-gray-400 mt-1">{content.description}</CardDescription>
      )}
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-gray-400">Order: </span>
          <span className="text-white">{content.order_index}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Status: </span>
          <span className={content.is_active ? "text-green-400" : "text-gray-400"}>
            {content.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        {content.content_type === "text" && content.content_data?.text && (
          <div className="text-sm">
            <span className="text-gray-400">Preview: </span>
            <p className="text-white mt-1 p-2 bg-slate-700 rounded text-xs">
              {content.content_data?.text?.substring(0, 100)}...
            </p>
          </div>
        )}
        {(content.content_type === "video" ||
          content.content_type === "image" ||
          content.content_type === "pdf" ||
          content.content_type === "url" ||
          content.content_type === "3d_model") &&
          content.content_data?.url && (
            <div className="text-sm">
              <span className="text-gray-400">
                {content.content_type === "3d_model" ? "Model URL: " : "URL: "}
              </span>
              <a
                href={content.content_data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 break-all"
              >
                {content.content_data.url}
              </a>
            </div>
          )}
      </div>
    </CardContent>
  </Card>
);

export default ContentCard;
