
import React from 'react';

interface FileExplorerProps {
  files: string[];
  selectedFile: string;
  onSelectFile: (fileName: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, selectedFile, onSelectFile }) => {
  
  const getFileIconInfo = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Handle specific filenames first
    if (fileName === '.gitignore') return { icon: 'fa-git-alt', color: 'text-orange-600', type: 'fab' };
    if (fileName.toLowerCase() === 'package.json') return { icon: 'fa-npm', color: 'text-red-500', type: 'fab' };
    if (fileName.toLowerCase().includes('dockerfile')) return { icon: 'fa-docker', color: 'text-blue-500', type: 'fab' };
    if (fileName.toLowerCase() === 'readme.md') return { icon: 'fa-markdown', color: 'text-slate-200', type: 'fab' };

    switch (extension) {
      // Web Standard
      case 'html': return { icon: 'fa-html5', color: 'text-orange-500', type: 'fab' };
      case 'css': return { icon: 'fa-css3-alt', color: 'text-blue-500', type: 'fab' };
      case 'js': return { icon: 'fa-js', color: 'text-yellow-400', type: 'fab' };
      case 'jsx': return { icon: 'fa-react', color: 'text-cyan-400', type: 'fab' };
      case 'ts': return { icon: 'fa-js', color: 'text-blue-400', type: 'fab' };
      case 'tsx': return { icon: 'fa-react', color: 'text-cyan-400', type: 'fab' };
      
      // Data / Config
      case 'json': return { icon: 'fa-file-code', color: 'text-yellow-600', type: 'fas' };
      case 'xml': return { icon: 'fa-code', color: 'text-orange-400', type: 'fas' };
      case 'yaml': 
      case 'yml': return { icon: 'fa-gears', color: 'text-red-400', type: 'fas' };
      case 'env': return { icon: 'fa-gear', color: 'text-slate-400', type: 'fas' };
      
      // Backend / Other Languages
      case 'php': return { icon: 'fa-php', color: 'text-indigo-400', type: 'fab' };
      case 'py': return { icon: 'fa-python', color: 'text-blue-500', type: 'fab' };
      case 'java': return { icon: 'fa-java', color: 'text-red-500', type: 'fab' };
      case 'rb': return { icon: 'fa-gem', color: 'text-red-600', type: 'fas' };
      case 'go': return { icon: 'fa-golang', color: 'text-cyan-600', type: 'fab' };
      case 'sql': return { icon: 'fa-database', color: 'text-slate-300', type: 'fas' };
      case 'c': 
      case 'cpp': return { icon: 'fa-cuttlefish', color: 'text-blue-600', type: 'fab' };
      
      // Documents
      case 'md': return { icon: 'fa-markdown', color: 'text-slate-300', type: 'fab' };
      case 'txt': return { icon: 'fa-file-lines', color: 'text-slate-400', type: 'fas' };
      case 'pdf': return { icon: 'fa-file-pdf', color: 'text-red-500', type: 'fas' };
      
      // Images
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg': 
      case 'ico': return { icon: 'fa-image', color: 'text-purple-400', type: 'fas' };

      default: return { icon: 'fa-file', color: 'text-slate-500', type: 'fas' };
    }
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <i className="fas fa-folder-open text-blue-400"></i>
        <span className="font-semibold text-sm uppercase tracking-wider text-slate-400">Project Files</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {files.map((file) => {
          const { icon, color, type } = getFileIconInfo(file);

          return (
            <button
              key={file}
              onClick={() => onSelectFile(file)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-slate-800 ${
                selectedFile === file ? 'bg-slate-800 border-l-2 border-blue-500' : ''
              }`}
            >
              <i className={`${type} ${icon} ${color} w-4 text-center`}></i>
              <span className="truncate text-slate-300">{file}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FileExplorer;
