
export function getContentIcon(type: string, IconSet: any) {
  const { FileText, Video, Image, FileIcon, Link, Box } = IconSet;
  switch (type) {
    case 'text': return <FileText className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'image': return <Image className="w-4 h-4" />;
    case 'pdf': return <FileIcon className="w-4 h-4" />;
    case 'url': return <Link className="w-4 h-4" />;
    case '3d_model': return <Box className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
}
