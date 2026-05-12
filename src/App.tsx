/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Terminal, Zap, Github, Layers, Filter, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbStore } from './lib/db';
import { Link, Category, Workspace } from './types';
import { CommandPalette } from './components/CommandPalette';
import { AddLinkDialog } from './components/AddLinkDialog';
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog';
import { LinkItem } from './components/LinkItem';
import { WorkspaceManager } from './components/WorkspaceManager';
import { TampermonkeyGuide } from './components/TampermonkeyGuide';
import { cn } from './lib/utils';

export default function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [initialLinkValues, setInitialLinkValues] = useState<{url: string, title: string} | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [allLinks, allCats, allWS] = await Promise.all([
        dbStore.getAllLinks(),
        dbStore.getAllCategories(),
        dbStore.getAllWorkspaces()
      ]);
      setLinks(allLinks);
      setCategories(allCats.sort((a, b) => a.order - b.order));
      setWorkspaces(allWS);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Handle deep linking for Quick Save from Tampermonkey
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') {
      const url = params.get('url');
      const title = params.get('title');
      if (url && title) {
        setInitialLinkValues({ url, title });
        setEditingLink(null);
        setIsAddDialogOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [loadData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsAddDialogOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddLink = async (url: string, title: string, categoryId: string) => {
    const updatedLink: Link = editingLink ? {
      ...editingLink,
      url: url.startsWith('http') ? url : `https://${url}`,
      title,
      categoryId,
      icon: `https://www.google.com/s2/favicons?domain=${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}&sz=64`
    } : {
      id: crypto.randomUUID(),
      url: url.startsWith('http') ? url : `https://${url}`,
      title,
      categoryId,
      lastUsed: Date.now(),
      icon: `https://www.google.com/s2/favicons?domain=${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}&sz=64`
    };
    await dbStore.putLink(updatedLink);
    setEditingLink(null);
    await loadData();
  };

  const handleDeleteLink = async (id: string) => {
    await dbStore.deleteLink(id);
    await loadData();
  };

  const handleOpenLink = (link: Link) => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
    dbStore.putLink({ ...link, lastUsed: Date.now() });
    setIsPaletteOpen(false);
  };

  const handleLaunchWorkspace = (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (!ws) return;
    ws.linkIds.forEach(id => {
      const link = links.find(l => l.id === id);
      if (link) window.open(link.url, '_blank', 'noopener,noreferrer');
    });
  };

  const handleAddCategory = async () => {
    const name = prompt('Enter category name:');
    if (!name) return;
    const newCat: Category = {
      id: crypto.randomUUID(),
      name,
      order: categories.length
    };
    await dbStore.putCategory(newCat);
    await loadData();
  };

  const handleEditCategory = async (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    if (cat.id === 'default') return;
    const newName = prompt('Enter new category name:', cat.name);
    if (!newName || newName === cat.name) return;
    await dbStore.putCategory({ ...cat, name: newName });
    await loadData();
  };

  const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'default') return;
    if (!confirm('Dissolve this partition? Active links will need recalibration.')) return;
    await dbStore.deleteCategory(id);
    await loadData();
  };

  const handleCreateWorkspace = async (name: string, linkIds: string[]) => {
    const updatedWorkspace: Workspace = editingWorkspace ? {
      ...editingWorkspace,
      name,
      linkIds
    } : {
      id: crypto.randomUUID(),
      name,
      linkIds
    };
    await dbStore.putWorkspace(updatedWorkspace);
    setEditingWorkspace(null);
    await loadData();
  };

  const handleDeleteWorkspace = async (id: string) => {
    await dbStore.deleteWorkspace(id);
    await loadData();
  };

  const filteredLinks = links.filter(link => {
    const matchesCategory = activeCategory === 'all' || link.categoryId === activeCategory;
    const matchesSearch = !searchQuery || 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      link.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/20 border-2 border-accent flex items-center justify-center">
             <Zap className="w-6 h-6 text-accent fill-accent" />
          </div>
          <span className="text-zinc-600 font-mono text-[10px] tracking-[0.3em] uppercase">Initializing DNA6</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-300 relative overflow-hidden pb-24">
      {/* Background Glows */}
      <div className="glow-bg top-[-100px] left-[-100px] bg-blue-900/40"></div>
      <div className="glow-bg bottom-[-100px] right-[-100px] bg-indigo-900/40"></div>

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">DNA6<span className="text-blue-500">.dev</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sync Active</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono hidden md:block uppercase tracking-wider">v1.4.2 // Local IDB</div>
          
          <button 
            onClick={() => {
              setEditingLink(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-accent hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10 hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            New Link
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-8 space-y-12">
        {/* Navigation & Search Area */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Command Bar / Search */}
          <div className="relative group flex-1 w-full max-w-3xl">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl group-focus-within:bg-blue-500/20 transition-all duration-500"></div>
            <div className="relative flex items-center bg-zinc-800 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
              <Search className="w-6 h-6 text-slate-500 ml-2" />
              <input 
                type="text"
                placeholder="Search links or type a command..."
                className="bg-transparent border-none focus:ring-0 outline-none text-xl px-4 w-full text-slate-100 placeholder-slate-600 font-light"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsPaletteOpen(true);
                }}
              />
              <div 
                className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-slate-400 font-mono mr-2 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsPaletteOpen(true)}
              >
                <span className="px-1 bg-white/10 rounded">ALT</span>
                <span>+</span>
                <span className="px-1 bg-white/10 rounded">L</span>
              </div>
            </div>
          </div>

          {/* Quick Access Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="glass-card px-5 py-3 flex items-center gap-3 hover:bg-white/10 transition-all group"
            >
              <Layers className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Vault Collection</span>
            </button>
            <button 
              onClick={() => document.getElementById('clusters-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="glass-card px-5 py-3 flex items-center gap-3 hover:bg-white/10 transition-all group"
            >
              <Zap className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Link Clusters</span>
            </button>
          </div>
        </div>

        {/* Workspaces Section */}
        <section id="clusters-section">
           <WorkspaceManager 
              workspaces={workspaces}
              links={links}
              onLaunch={handleLaunchWorkspace}
              onAddWorkspace={() => {
                setEditingWorkspace(null);
                setIsCreateWorkspaceOpen(true);
              }} 
              onDeleteWorkspace={handleDeleteWorkspace}
              onEditWorkspace={(ws) => {
                setEditingWorkspace(ws);
                setIsCreateWorkspaceOpen(true);
              }}
            />
        </section>

        {/* Links Section */}
        <section id="vault-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-accent" />
               </div>
               <div>
                 <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Vault Collection</h2>
                 <p className="text-xs text-slate-600 font-mono">01. {filteredLinks.length} Items Indexed</p>
               </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/50 border border-white/5 rounded-full overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveCategory('all')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  activeCategory === 'all' ? "bg-accent text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                All Modules
              </button>
              {categories.map(cat => (
                <div key={cat.id} className="relative group/cat">
                  <button 
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2",
                      activeCategory === cat.id ? "bg-accent text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {cat.name}
                    {cat.id !== 'default' && (
                      <div className="flex items-center gap-1.5 ml-1">
                        <Edit2 
                          className="w-3 h-3 opacity-0 group-hover/cat:opacity-100 hover:text-white transition-all cursor-pointer" 
                          onClick={(e) => handleEditCategory(cat, e)}
                        />
                        <X 
                          className="w-3 h-3 opacity-0 group-hover/cat:opacity-100 hover:text-red-400 transition-all cursor-pointer" 
                          onClick={(e) => handleDeleteCategory(cat.id, e)}
                        />
                      </div>
                    )}
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddCategory}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                title="Add Partition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {filteredLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredLinks.map((link) => (
                  <motion.div
                    key={link.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LinkItem 
                      link={link} 
                      onOpen={handleOpenLink}
                      onDelete={handleDeleteLink}
                      onEdit={(l) => {
                        setEditingLink(l);
                        setIsAddDialogOpen(true);
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-24 glass-card border-dashed flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                  <Filter className="w-6 h-6 text-slate-700" />
               </div>
               <h3 className="text-slate-300 font-medium">No results found in partition</h3>
               <p className="text-slate-600 text-xs mt-1 max-w-[200px]">The current query returned no matching link identifiers.</p>
            </div>
          )}
        </section>

        <TampermonkeyGuide />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-white/5 px-8 flex items-center justify-between z-40 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">Tampermonkey Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{links.length} Links Preloaded</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-[10px] flex items-center gap-4 text-slate-500 font-mono tracking-tight">
            <span><b className="text-slate-300">ALT+L</b> Command Palette</span>
            <span><b className="text-slate-300">CTRL+A</b> New Link</span>
            <span><b className="text-slate-300">F1</b> Local Settings</span>
          </div>
        </div>
      </footer>

      {/* Global Modals remain functional */}
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        links={links}
        categories={categories}
        workspaces={workspaces}
        onOpenLink={handleOpenLink}
        onLaunchWorkspace={handleLaunchWorkspace}
        onSetActiveCategory={setActiveCategory}
        onAddLink={() => {
          setIsPaletteOpen(false);
          setIsAddDialogOpen(true);
        }}
      />

      <AddLinkDialog 
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingLink(null);
          setInitialLinkValues(null);
        }}
        categories={categories}
        onAdd={handleAddLink}
        linkToEdit={editingLink}
        initialValues={initialLinkValues}
      />

      <CreateWorkspaceDialog
        isOpen={isCreateWorkspaceOpen}
        onClose={() => {
          setIsCreateWorkspaceOpen(false);
          setEditingWorkspace(null);
        }}
        links={links}
        onAdd={handleCreateWorkspace}
        workspaceToEdit={editingWorkspace}
      />
    </div>
  );
}
