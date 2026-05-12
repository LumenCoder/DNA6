import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe } from 'lucide-react';
import { Link, Category } from '../types';

interface AddLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (url: string, title: string, categoryId: string) => void;
  linkToEdit?: Link | null;
  initialValues?: { url: string, title: string } | null;
}

export const AddLinkDialog: React.FC<AddLinkDialogProps> = ({ isOpen, onClose, categories, onAdd, linkToEdit, initialValues }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'default');

  React.useEffect(() => {
    if (linkToEdit) {
      setUrl(linkToEdit.url);
      setTitle(linkToEdit.title);
      setCategoryId(linkToEdit.categoryId);
    } else if (initialValues) {
      setUrl(initialValues.url);
      setTitle(initialValues.title);
      setCategoryId(categories[0]?.id || 'default');
    } else {
      setUrl('');
      setTitle('');
      setCategoryId(categories[0]?.id || 'default');
    }
  }, [linkToEdit, initialValues, categories, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;
    onAdd(url, title, categoryId);
    setUrl('');
    setTitle('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-zinc-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="px-8 py-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight">{linkToEdit ? 'Update Module' : 'Deploy Module'}</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">{linkToEdit ? 'Link Recalibration' : 'Link Configuration'}</p>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Network Address (URL)</label>
                <div className="relative group">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 transition-colors group-focus-within:text-accent" />
                  <input
                    autoFocus
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-accent/50 group-hover:border-white/10 transition-all"
                    placeholder="https://dna6.dev/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Identifier (Title)</label>
                <input
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-accent/50 group-hover:border-white/10 transition-all"
                  placeholder="The DNA6 Project"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Partition (Category)</label>
                <select
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-accent/50 group-hover:border-white/10 transition-all appearance-none cursor-pointer"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.name}</option>
                  ))}
                </select>
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
                className="bg-accent hover:bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                {linkToEdit ? 'Sync Changes' : 'Confirm Deployment'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
};
