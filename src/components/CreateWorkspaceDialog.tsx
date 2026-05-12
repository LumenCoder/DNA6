import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Check } from 'lucide-react';
import { Link, Workspace } from '../types';
import { cn } from '../lib/utils';

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  links: Link[];
  onAdd: (name: string, linkIds: string[]) => void;
  workspaceToEdit?: Workspace | null;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({ 
  isOpen, 
  onClose, 
  links, 
  onAdd,
  workspaceToEdit
}) => {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  React.useEffect(() => {
    if (workspaceToEdit) {
      setName(workspaceToEdit.name);
      setSelectedIds(workspaceToEdit.linkIds);
    } else {
      setName('');
      setSelectedIds([]);
    }
  }, [workspaceToEdit, isOpen]);

  const toggleLink = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedIds.length === 0) return;
    onAdd(name, selectedIds);
    setName('');
    setSelectedIds([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.form
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onSubmit={handleSubmit}
            className="relative w-full max-w-lg bg-zinc-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="px-8 py-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight">{workspaceToEdit ? 'Update Cluster' : 'Create Cluster'}</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">{workspaceToEdit ? 'Group Recalibration' : 'Group Configuration'}</p>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Group Name</label>
                <div className="relative group">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-accent" />
                  <input
                    autoFocus
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-accent/50 group-hover:border-white/10 transition-all"
                    placeholder="e.g. Daily Stack"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Select Modules ({selectedIds.length})</label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                  {links.map(link => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => toggleLink(link.id)}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg border transition-all text-left",
                        selectedIds.includes(link.id) 
                          ? "bg-accent/10 border-accent/40 text-white" 
                          : "bg-zinc-900 border-white/5 text-slate-500 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        selectedIds.includes(link.id) ? "bg-accent border-accent" : "border-slate-700"
                      )}>
                        {selectedIds.includes(link.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[10px] font-medium truncate">{link.title}</span>
                    </button>
                  ))}
                  {links.length === 0 && (
                     <p className="col-span-full text-center text-xs text-slate-600 py-4 italic">No links available to cluster.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-zinc-900/50 border-t border-white/5 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name || selectedIds.length === 0}
                className="bg-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                {workspaceToEdit ? 'Sync Group' : 'Confirm Setup'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
};
