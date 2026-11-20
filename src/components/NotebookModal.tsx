import React, { useState, useEffect } from 'react';
import { Notebook, CoverTheme, PaperStyle, COVER_THEMES } from '../types/notebook';
import { X, Check } from 'lucide-react';

interface NotebookModalProps {
  isOpen: boolean;
  notebookToEdit?: Notebook | null;
  onClose: () => void;
  onSave: (notebookData: Partial<Notebook>) => void;
}

const CATEGORIES = [
  'Engineering',
  'Product Design',
  'Research',
  'Personal Journal',
  'Architecture',
  'Strategy',
  'Operations',
];

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  notebookToEdit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverTheme, setCoverTheme] = useState<CoverTheme>('indigo');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ruled');
  const [category, setCategory] = useState('Engineering');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (notebookToEdit) {
      setTitle(notebookToEdit.title);
      setDescription(notebookToEdit.description || '');
      setCoverTheme(notebookToEdit.coverTheme);
      setPaperStyle(notebookToEdit.paperStyle);
      setCategory(notebookToEdit.category || 'Engineering');
      setTagsInput(notebookToEdit.tags ? notebookToEdit.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setCoverTheme('indigo');
      setPaperStyle('ruled');
      setCategory('Engineering');
      setTagsInput('');
    }
  }, [notebookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description: description.trim(),
      coverTheme,
      paperStyle,
      category,
      tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {notebookToEdit ? 'Edit Notebook Volume' : 'Create New Notebook'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Configure binding theme, paper ruling, and metadata.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Notebook Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Storage Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Description / Objective
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of what this notebook contains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white resize-none"
            />
          </div>

          {/* Theme Palette */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Binding Cover Color
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {(Object.keys(COVER_THEMES) as CoverTheme[]).map((thm) => {
                const conf = COVER_THEMES[thm];
                const isSelected = coverTheme === thm;
                return (
                  <button
                    key={thm}
                    type="button"
                    onClick={() => setCoverTheme(thm)}
                    title={conf.name}
                    className={`cursor-pointer h-10 rounded-lg ${conf.spineColor} flex items-center justify-center transition-all relative border ${
                      isSelected ? 'ring-2 ring-neutral-900 ring-offset-2 scale-105' : 'hover:opacity-90'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paper Style & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Paper Texture Ruling
              </label>
              <select
                value={paperStyle}
                onChange={(e) => setPaperStyle(e.target.value as PaperStyle)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
              >
                <option value="ruled">Ruled Lines (Classic)</option>
                <option value="grid">Engineering Graph (Grid)</option>
                <option value="dots">Bullet Journal (Dots)</option>
                <option value="blank">Smooth Blank Paper</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Category
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <datalist id="category-suggestions">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed, Systems, Ingress"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              {notebookToEdit ? 'Save Changes' : 'Create Notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
