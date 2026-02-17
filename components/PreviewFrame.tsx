
import React, { useMemo } from 'react';

interface PreviewFrameProps {
  files: Record<string, string>;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ files }) => {
  const srcDoc = useMemo(() => {
    let html = files['index.html'] || '<html><body><h1>No index.html found</h1></body></html>';
    const css = files['style.css'] || '';
    const js = files['main.js'] || files['script.js'] || '';

    // Inject CSS
    if (css) {
      const styleTag = `<style>${css}</style>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${styleTag}</head>`);
      } else {
        html = `${styleTag}${html}`;
      }
    }

    // Inject JS
    if (js) {
      const scriptTag = `<script>${js}<\/script>`;
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}</body>`);
      } else {
        html = `${html}${scriptTag}`;
      }
    }

    return html;
  }, [files]);

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-2xl">
      <div className="bg-slate-100 border-b p-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 mx-4 bg-white border rounded px-2 py-0.5 text-xs text-slate-500 flex items-center">
          <i className="fas fa-lock mr-2 scale-75"></i>
          https://preview.forge-ai.local/
        </div>
      </div>
      <iframe
        title="preview"
        srcDoc={srcDoc}
        className="w-full h-[calc(100%-40px)] border-none"
        sandbox="allow-scripts allow-modals allow-forms allow-popups"
      />
    </div>
  );
};

export default PreviewFrame;
