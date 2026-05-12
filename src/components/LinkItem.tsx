import React from 'react';
import { ExternalLink, Trash2, Edit2 } from 'lucide-react';
import { Link } from '../types';
import { cn } from '../lib/utils';

interface LinkItemProps {
  link: Link;
  onOpen: (link: Link) => void;
  onDelete: (id: string) => void;
  onEdit: (link: Link) => void;
}

export const LinkItem: React.FC<LinkItemProps> = ({ link, onOpen, onDelete, onEdit }) => {
  const handleMouseEnter = () => {
    const linkTag = document.createElement('link');
    linkTag.rel = 'preconnect';
    linkTag.href = new URL(link.url).origin;
    document.head.appendChild(linkTag);
  };

  return (
    <div 
      className="group relative glass-card p-3 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 cursor-pointer flex items-center justify-between"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onOpen(link);
      }}
      onMouseEnter={handleMouseEnter}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:border-accent/30 transition-colors">
            {link.icon ? (
              <img src={link.icon} alt="" className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
            ) : (
              <ExternalLink className="w-4 h-4 text-slate-600" />
            )}
          </div>
          {/* Status Dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
        </div>
        
        <div className="min-w-0 overflow-hidden">
          <h3 className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
            {link.title}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5 uppercase tracking-tighter">
            {new URL(link.url).hostname}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Edit Module"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(link);
          }}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
          title="Delete Module"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(link.id);
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
