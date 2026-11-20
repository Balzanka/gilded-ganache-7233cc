import React from 'react';
import { Notebook, NotePage, COVER_THEMES } from '../types/notebook';
import { Star, BookOpen, FileText, ArrowRight } from 'lucide-react';
import { countWordsAndChars } from '../utils/storage';

interface FavoritesViewProps {
  notebooks: Notebook[];
  pages: NotePage[];
  onOpenNotebook: (notebookId: string, pageId?: string) => void;
  onOpenNote: (notebookId: string, pageId: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  notebooks,
  pages,
  onOpenNotebook,
  onOpenNote,
}) => {
  const favoriteNotebooks = notebooks.filter((n) => n.isFavorite);
  const favoritePages = pages.filter((p) => p.isFavorite);

  const notebookMap = new Map<string, Notebook>();
  notebooks.forEach((nb) => notebookMap.set(nb.id, nb));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Starred &amp; Favorites
          </h1>
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          Quick-access shelf for essential notebook volumes and high-priority notes.
        </p>
      </div>

      {/* Favorite Notebooks Section */}
      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Favorite Notebook Volumes ({favoriteNotebooks.length})</span>
        </h2>

        {favoriteNotebooks.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center text-xs text-neutral-400">
            No notebook volumes have been starred yet. Star a notebook from the catalog to pin it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoriteNotebooks.map((nb) => {
              const theme = COVER_THEMES[nb.coverTheme] || COVER_THEMES.indigo;
              const nbPages = pages.filter((p) => p.notebookId === nb.id);
              const wordCount = nbPages.reduce(
                (sum, p) => sum + countWordsAndChars(p.contentHtml || p.contentMarkdown).words,
                0
              );

              return (
                <div
                  key={nb.id}
                  onClick={() => onOpenNotebook(nb.id)}
                  className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className={`p-4 bg-gradient-to-r ${theme.bgGradient} text-white`}>
                    <div className="flex items-center justify-between text-[11px] text-white/70">
                      <span>{nb.category || 'General'}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 line-clamp-1">{nb.title}</h3>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {nb.description}
                    </p>
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-mono tabular-nums">
                      <span>{nbPages.length} pages</span>
                      <span>{wordCount.toLocaleString()} words</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Favorite Notes Section */}
      <div className="mt-12">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Starred Note Pages ({favoritePages.length})</span>
        </h2>

        {favoritePages.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center text-xs text-neutral-400">
            No note pages have been starred yet. Click the star icon on any note to bookmark it.
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden shadow-xs">
            {favoritePages.map((page) => {
              const nb = notebookMap.get(page.notebookId);
              const stats = countWordsAndChars(page.contentHtml || page.contentMarkdown);
              return (
                <div
                  key={page.id}
                  onClick={() => onOpenNote(page.notebookId, page.id)}
                  className="p-4 hover:bg-neutral-50/80 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-amber-800 transition-colors">
                        {page.title || 'Untitled Note'}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                        {nb && <span>Volume: {nb.title}</span>}
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{stats.words} words</span>
                        <span aria-hidden="true">·</span>
                        <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-neutral-900 transition-colors shrink-0">
                    <span>Open Note</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
