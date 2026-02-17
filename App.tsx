
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateWebsite } from './services/geminiService';
import { Project, ViewMode, ChatMessage } from './types';
import FileExplorer from './components/FileExplorer';
import PreviewFrame from './components/PreviewFrame';

const App: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Split);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const userMsg: ChatMessage = { role: 'user', content: prompt };
    setChatHistory(prev => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);

    try {
      // Map history for Gemini format
      const history = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const generatedProject = await generateWebsite(prompt, history);
      setProject(generatedProject);
      
      const fileNames = Object.keys(generatedProject.files);
      if (fileNames.length > 0 && (!selectedFile || !fileNames.includes(selectedFile))) {
        setSelectedFile(fileNames.includes('index.html') ? 'index.html' : fileNames[0]);
      }

      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `I've updated your project: "${generatedProject.name}". Check the editor to see the full-stack code including the backend logic.` 
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error while building your site. Please check your API key and try again." 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!project) return;
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-source.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [project]);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar - Chat / AI Builder */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900 shadow-xl z-20">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-blue-600/20 to-transparent">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <i className="fas fa-hammer text-blue-500"></i>
            ForgeAI
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Full-Stack Builder</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center py-10 px-4">
              <i className="fas fa-magic text-4xl text-blue-500 mb-4 animate-pulse"></i>
              <h2 className="text-lg font-medium text-slate-200">Start Your Project</h2>
              <p className="text-sm text-slate-400 mt-2">Describe the website you want to build. I'll handle the frontend, backend, and database logic.</p>
              <div className="mt-6 space-y-2">
                <button onClick={() => setPrompt("E-commerce site with a Node.js API and MongoDB connection")} className="w-full text-left text-xs bg-slate-800 hover:bg-slate-700 p-2 rounded transition-colors text-slate-300">
                  "E-commerce with Node.js & MongoDB"
                </button>
                <button onClick={() => setPrompt("SaaS Landing Page with user registration and PostgreSQL")} className="w-full text-left text-xs bg-slate-800 hover:bg-slate-700 p-2 rounded transition-colors text-slate-300">
                  "SaaS Landing with PostgreSQL"
                </button>
              </div>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleGenerate} className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should we build today?"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-3 right-3 text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <i className="fas fa-circle-notch animate-spin text-lg"></i>
              ) : (
                <i className="fas fa-paper-plane text-lg"></i>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header/Toolbar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button 
                onClick={() => setViewMode(ViewMode.Editor)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === ViewMode.Editor ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fas fa-code mr-1.5"></i> Code
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.Split)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === ViewMode.Split ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fas fa-columns mr-1.5"></i> Split
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.Preview)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === ViewMode.Preview ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fas fa-eye mr-1.5"></i> Preview
              </button>
            </div>
            {project && <span className="text-sm font-medium text-slate-300 truncate max-w-xs">{project.name}</span>}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownload}
              disabled={!project}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <i className="fas fa-download"></i> Download Code
            </button>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
              <i className="fas fa-rocket"></i> Deploy
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 flex overflow-hidden">
          {project ? (
            <>
              {/* File List + Editor */}
              {(viewMode === ViewMode.Editor || viewMode === ViewMode.Split) && (
                <div className={`flex flex-1 ${viewMode === ViewMode.Split ? 'border-r border-slate-800' : ''}`}>
                  <FileExplorer 
                    files={Object.keys(project.files)} 
                    selectedFile={selectedFile} 
                    onSelectFile={setSelectedFile} 
                  />
                  <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                    <div className="h-10 bg-slate-900 flex items-center px-4 border-b border-slate-800 gap-2 overflow-x-auto">
                      <div className="bg-slate-800 px-3 py-1 rounded text-xs flex items-center gap-2 border border-slate-700">
                        <span className="text-slate-300">{selectedFile}</span>
                      </div>
                    </div>
                    <pre className="flex-1 p-6 text-sm font-mono text-slate-300 overflow-auto selection:bg-blue-500/30">
                      <code>{project.files[selectedFile]}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Preview */}
              {(viewMode === ViewMode.Preview || viewMode === ViewMode.Split) && (
                <div className="flex-1 bg-slate-800 p-6 flex items-center justify-center overflow-auto">
                   <div className="w-full h-full max-w-5xl">
                      <PreviewFrame files={project.files} />
                   </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-10 text-center">
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-blue-600/20 blur-2xl rounded-full"></div>
                <i className="fas fa-code-branch text-6xl text-blue-500 relative"></i>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Forge Your Digital Reality</h2>
              <p className="text-slate-400 max-w-md">
                Enter a description in the chat sidebar to generate a full-stack web application. 
                Our AI uses Gemini 3 Pro to architect the frontend, backend, and data models instantly.
              </p>
              <div className="mt-10 flex gap-4">
                 <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <i className="fab fa-js text-yellow-400 text-2xl"></i>
                    <div className="text-left">
                       <p className="text-xs font-bold text-slate-500 uppercase">Frontend</p>
                       <p className="text-sm text-slate-300">HTML5/Tailwind/Vanilla JS</p>
                    </div>
                 </div>
                 <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <i className="fab fa-node-js text-green-400 text-2xl"></i>
                    <div className="text-left">
                       <p className="text-xs font-bold text-slate-500 uppercase">Backend</p>
                       <p className="text-sm text-slate-300">Node.js / Express API</p>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
