import React from 'react';
import { Layers, Plus, Play, Trash2, Edit2 } from 'lucide-react';
import { Workspace, Link } from '../types';
import { cn } from '../lib/utils';

interface WorkspaceManagerProps {
  workspaces: Workspace[];
  links: Link[];
  onAddWorkspace: (name: string, linkIds: string[]) => void;
  onLaunch: (workspaceId: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onEditWorkspace: (workspace: Workspace) => void;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ 
  workspaces, 
  links, 
  onLaunch, 
  onAddWorkspace,
  onDeleteWorkspace,
  onEditWorkspace
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Link Clusters</h2>
            <p className="text-xs text-slate-600 font-mono">02. Active Groups</p>
          </div>
        </div>

      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {workspaces.map((ws, index) => (
          <div 
            key={ws.id}
            className={cn(
              "group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer border",
              index === 0 
                ? "bg-gradient-to-br from-blue-600/20 to-zinc-900/50 border-blue-500/30 hover:bg-blue-600/30 shadow-[0_10px_30px_rgba(59,130,246,0.1)]" 
                : "bg-white/5 border-white/10 hover:bg-white/10"
            )}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              onLaunch(ws.id);
            }}
          >
            {/* Action Buttons Overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditWorkspace(ws);
                }}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 hover:text-white"
                title="Edit Group"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteWorkspace(ws.id);
                }}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-400"
                title="Delete Group"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunch(ws.id);
                }}
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg shadow-blue-500/50 hover:bg-blue-600"
                title="Launch Cluster"
              >
                <Play className="w-3 h-3 text-white fill-white" />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-base font-bold text-white group-hover:translate-x-1 transition-transform">
                {ws.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1 transition-opacity group-hover:opacity-100">
                {ws.linkIds.map(id => links.find(l => l.id === id)?.title).join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                index === 0 ? "bg-blue-500/30 text-blue-200" : "bg-white/10 text-slate-400"
              )}>
                {ws.linkIds.length} Modules Loaded
              </span>
            </div>
          </div>
        ))}
        
        <div 
          onClick={() => onAddWorkspace('', [])}
          className="group border border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer min-h-[140px]"
        >
          <Plus className="w-6 h-6 text-slate-600 group-hover:text-white group-hover:scale-110 transition-all mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">Make New Group</span>
        </div>
      </div>
    </div>
  );
};
