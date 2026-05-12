import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Command, Search, Plus, ExternalLink, Hash, Folder, Zap } from 'lucide-react';
import { Link, Category } from '../types';
import { cn } from '../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  links: Link[];
  categories: Category[];
  workspaces: Workspace[];
  onOpenLink: (link: Link) => void;
  onLaunchWorkspace: (id: string) => void;
  onAddLink: () => void;
  onSetActiveCategory: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  links,
  categories,
  workspaces,
  onOpenLink,
  onLaunchWorkspace,
  onAddLink,
  onSetActiveCategory,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredLinks = query.trim() === '' 
    ? links.slice(0, 3) 
    : links.filter(l => 
        l.title.toLowerCase().includes(query.toLowerCase()) || 
        l.url.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

  const filteredWorkspaces = query.trim() === ''
    ? workspaces.slice(0, 2)
    : workspaces.filter(w => w.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  const filteredCategories = query.trim() === ''
    ? []
    : categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  const totalItems = filteredLinks.length + filteredWorkspaces.length + filteredCategories.length + 3; // +3 for system commands

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter') {
        executeCommand(selectedIndex);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredLinks, filteredWorkspaces, filteredCategories, selectedIndex, totalItems]);

  const executeCommand = (index: number) => {
    let current = 0;

    // Links
    if (index < filteredLinks.length) {
      onOpenLink(filteredLinks[index]);
      return;
    }
    current += filteredLinks.length;

    // Workspaces
    if (index < current + filteredWorkspaces.length) {
      onLaunchWorkspace(filteredWorkspaces[index - current].id);
      onClose();
      return;
    }
    current += filteredWorkspaces.length;

    // Categories
    if (index < current + filteredCategories.length) {
      onSetActiveCategory(filteredCategories[index - current].id);
      document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' });
      onClose();
      return;
    }
    current += filteredCategories.length;

    // System Commands
    if (index === current) {
      document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' });
      onClose();
    } else if (index === current + 1) {
      document.getElementById('clusters-section')?.scrollIntoView({ behavior: 'smooth' });
      onClose();
    } else if (index === current + 2) {
      onAddLink();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-zinc-800 border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden backdrop-blur-2xl"
          >
            <div className="flex items-center px-5 py-4 border-b border-white/5 bg-white/5">
              <Search className="w-5 h-5 text-slate-500 mr-3" />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-600 font-medium text-base"
                placeholder="Search links or execute DNA6.cmd"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
              />
              <div className="flex items-center gap-1.5">
                 <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-500 font-bold border border-white/10 uppercase tracking-tighter">ESC</kbd>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-3 space-y-4">
              {/* Links Section */}
              {filteredLinks.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center justify-between">
                    <span>Identified Links</span>
                    <span className="font-mono opacity-50">#vault</span>
                  </div>
                  {filteredLinks.map((link, idx) => (
                    <button
                      key={link.id}
                      className={cn(
                        "w-full flex items-center px-3 py-2.5 rounded-xl transition-all group text-left border border-transparent",
                        selectedIndex === idx ? "bg-white/10 border-white/10 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                      onClick={() => onOpenLink(link)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center mr-3 border border-white/5 group-hover:border-accent/30 transition-colors">
                        {link.icon ? (
                           <img src={link.icon} alt="" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{link.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{link.url}</div>
                      </div>
                      <div className={cn(
                        "ml-auto flex items-center gap-2 transition-all",
                        selectedIndex === idx ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                      )}>
                        <kbd className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Enter to Open</kbd>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Workspaces Section */}
              {filteredWorkspaces.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center justify-between">
                    <span>Link Clusters</span>
                    <span className="font-mono opacity-50">#clusters</span>
                  </div>
                  {filteredWorkspaces.map((ws, idx) => {
                    const actualIdx = filteredLinks.length + idx;
                    return (
                      <button
                        key={ws.id}
                        className={cn(
                          "w-full flex items-center px-3 py-2.5 rounded-xl transition-all group text-left border border-transparent",
                          selectedIndex === actualIdx ? "bg-white/10 border-white/10 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        )}
                        onClick={() => {
                          onLaunchWorkspace(ws.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(actualIdx)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center mr-3 border border-white/5 group-hover:border-indigo-400/30 transition-colors">
                          <Zap className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{ws.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{ws.linkIds.length} modules attached</div>
                        </div>
                        <div className={cn(
                          "ml-auto flex items-center gap-2 transition-all",
                          selectedIndex === actualIdx ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                        )}>
                          <kbd className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Launch All</kbd>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Categories Section */}
              {filteredCategories.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center justify-between">
                    <span>Partitions</span>
                    <span className="font-mono opacity-50">#categories</span>
                  </div>
                  {filteredCategories.map((cat, idx) => {
                    const actualIdx = filteredLinks.length + filteredWorkspaces.length + idx;
                    return (
                      <button
                        key={cat.id}
                        className={cn(
                          "w-full flex items-center px-3 py-2.5 rounded-xl transition-all group text-left border border-transparent",
                          selectedIndex === actualIdx ? "bg-white/10 border-white/10 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        )}
                        onClick={() => {
                          onSetActiveCategory(cat.id);
                          document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' });
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(actualIdx)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center mr-3 border border-white/5 group-hover:border-emerald-400/30 transition-colors">
                          <Folder className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{cat.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">Jump to partition</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!query && filteredLinks.length === 0 && filteredWorkspaces.length === 0 && (
                <div className="px-3 py-10 text-center">
                  <Command className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">Type to search modules or execute commands</p>
                </div>
              )}

              {query && filteredLinks.length === 0 && filteredWorkspaces.length === 0 && filteredCategories.length === 0 && (
                <div className="px-3 py-10 text-center text-slate-500 text-sm italic">
                  Search query "{query}" returned no matching identifiers.
                </div>
              )}

              {/* System Commands Bar */}
              <div className="pt-2 border-t border-white/5 space-y-1">
                 <div className="px-3 py-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Global Overview</div>
                 
                 <div className="grid grid-cols-2 gap-2 px-1">
                    <button
                      className={cn(
                        "flex items-center px-3 py-2 rounded-xl transition-all group text-left border border-transparent",
                        selectedIndex === filteredLinks.length + filteredWorkspaces.length + filteredCategories.length ? "bg-white/10 border-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                      onClick={() => {
                        document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' });
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(filteredLinks.length + filteredWorkspaces.length + filteredCategories.length)}
                    >
                      <Layers className="w-4 h-4 mr-3 text-accent" />
                      <span className="text-xs font-bold uppercase tracking-widest">Vault</span>
                    </button>

                    <button
                      className={cn(
                        "flex items-center px-3 py-2 rounded-xl transition-all group text-left border border-transparent",
                        selectedIndex === filteredLinks.length + filteredWorkspaces.length + filteredCategories.length + 1 ? "bg-white/10 border-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                      onClick={() => {
                        document.getElementById('clusters-section')?.scrollIntoView({ behavior: 'smooth' });
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(filteredLinks.length + filteredWorkspaces.length + filteredCategories.length + 1)}
                    >
                      <Zap className="w-4 h-4 mr-3 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">Clusters</span>
                    </button>
                 </div>

                 <button
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 rounded-xl transition-all group text-left border border-transparent mt-2",
                      selectedIndex === filteredLinks.length + filteredWorkspaces.length + filteredCategories.length + 2 ? "bg-accent/10 border-accent/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                    onClick={onAddLink}
                    onMouseEnter={() => setSelectedIndex(filteredLinks.length + filteredWorkspaces.length + filteredCategories.length + 2)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center mr-3 border border-accent/30 group-hover:bg-accent/30 transition-colors">
                      <Plus className="w-4 h-4 text-accent" />
                    </div>
                    <div className="text-sm font-semibold text-accent/80 group-hover:text-accent transition-colors tracking-tight">Add New Module</div>
                    <div className={cn(
                        "ml-auto flex items-center gap-2 transition-all",
                        selectedIndex === filteredLinks.length + filteredWorkspaces.length + filteredCategories.length + 2 ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                      )}>
                        <kbd className="text-[9px] font-bold text-accent/60 uppercase tracking-tighter">Execute</kbd>
                      </div>
                  </button>
              </div>
            </div>

            <div className="bg-zinc-900 px-5 py-3 border-t border-white/5 flex items-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                <span>Arrow Keys Navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                <span>Enter to Open</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
