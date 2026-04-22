export interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'organize' | 'convert' | 'optimize' | 'edit' | 'security';
  href: string;
  color: string;
}

export interface FileInfo {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  file?: File;
}

export type ToolCategory = 'All' | 'Organize' | 'Convert' | 'Optimize' | 'Edit' | 'Security';
