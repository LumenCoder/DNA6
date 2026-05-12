import React from 'react';
import { Terminal, Copy } from 'lucide-react';

export const TampermonkeyGuide: React.FC = () => {
  const scriptContent = `// ==UserScript==
// @name         DNA6 Command Center
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  DNA6.dev: Alt+L for Overview, Alt+S to Quick Save current site
// @author       DNA6
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    const DNA6_URL = 'https://dna6.dev'; // Update with your actual deployment URL

    document.addEventListener('keydown', (e) => {
        // Alt+L: Open Overview
        if(e.altKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            window.open(DNA6_URL, '_blank');
        }
        
        // Alt+S: Quick Save Module (Opens Add Link dialog with current URL)
        if(e.altKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            const currentUrl = encodeURIComponent(window.location.href);
            const currentTitle = encodeURIComponent(document.title);
            window.open(\`\${DNA6_URL}?action=add&url=\${currentUrl}&title=\${currentTitle}\`, '_blank');
        }
    });

    console.log('DNA6 Integration Active: ALT+L (Overview), ALT+S (Quick Save)');
})();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptContent);
  };

  return (
    <div className="mt-12 pt-8 border-t border-zinc-900">
      <div className="flex items-center gap-3 mb-6">
        <Terminal className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-zinc-200">Tampermonkey Integration</h2>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <button onClick={copyToClipboard} className="text-zinc-500 hover:text-white flex items-center gap-2 text-xs font-medium">
             <Copy className="w-3 h-3" />
             Copy Script
           </button>
        </div>
        <pre className="text-[10px] text-zinc-500 font-mono leading-relaxed overflow-x-auto">
          {scriptContent}
        </pre>
      </div>
    </div>
  );
};
