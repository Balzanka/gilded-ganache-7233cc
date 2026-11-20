import React from 'react';
import { Plus, BookOpen, FileText, Star, Sparkles } from 'lucide-react';

interface TopBarProps {
  currentView: 'catalog' | 'editor' | 'all-notes' | 'favorites';
  onNavigate: (view: 'catalog' | 'all-notes' | 'favorites') => void;
  onNewNote: () => void;
  onOpenTemplates: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  onNewNote,
  onOpenTemplates,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('catalog')}
          className="text-lg font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer text-left"
        >
          <span className="w-7 h-7 rounded-md bg-neutral-900 text-amber-100 flex items-center justify-center font-serif text-sm font-semibold shadow-xs">
            F
          </span>
          <span>Folio Notebooks</span>
        </button>

        {/* Zone 2: 4-5 Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <button
            onClick={() => onNavigate('catalog')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 pb-0.5 ${
              currentView === 'catalog'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Notebook Catalog</span>
          </button>

          <button
            onClick={() => onNavigate('all-notes')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 pb-0.5 ${
              currentView === 'all-notes'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Notes</span>
          </button>

          <button
            onClick={() => onNavigate('favorites')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 pb-0.5 ${
              currentView === 'favorites'
                ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Favorites</span>
          </button>

          <button
            onClick={onOpenTemplates}
            className="cursor-pointer whitespace-nowrap shrink-0 hover:text-neutral-900 transition-colors flex items-center gap-1.5 pb-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Templates</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewNote}
            className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>
      </div>
    </header>
  );
};
