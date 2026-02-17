
export interface ProjectFile {
  name: string;
  language: string;
  content: string;
}

export interface Project {
  name: string;
  description: string;
  files: Record<string, string>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum ViewMode {
  Editor = 'EDITOR',
  Preview = 'PREVIEW',
  Split = 'SPLIT'
}
