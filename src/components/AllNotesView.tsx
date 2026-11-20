import React, { useState, useMemo } from 'react';
import { Notebook, NotePage, COVER_THEMES } from '../types/notebook';
import { Search, Star, Pin, FileText, ArrowRight, BookOpen } from 'lucide-react';
import { countWordsAndChars } from '../utils/storage';

interface AllNotesViewProps {
  notebooks: Notebook[];
  pages: NotePage[];
  onOpenNote: (notebookId: string, pageId: string) => void;
  onNewNote: () => void;
}

export const AllNotesView: React.FC<AllNotesViewProps> = ({
  notebooks,
  pages,
  onOpenNote,
  onNewNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    pages.forEach((p) => {
      p.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [pages]);

  // Notebook map
  const notebookMap = useMemo(() => {
    const map = new Map<string, Notebook>();
    notebooks.forEach((nb) => map.set(nb.id, nb));
    return map;
  }, [notebooks]);

  // Filtered notes
  const filteredPages = useMemo(() => {
    return pages
      .filter((page) => {
        const matchesNb = selectedNotebookId === 'all' || page.notebookId === selectedNotebookId;
        const matchesTag = selectedTag === 'all' || (page.tags && page.tags.includes(selectedTag));
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q ||
          page.title.toLowerCase().includes(q) ||
          page.contentMarkdown?.toLowerCase().includes(q) ||
          page.tags?.some((t) => t.toLowerCase().includes(q));

        return matchesNb && matchesTag && matchesQuery;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [pages, selectedNotebookId, selectedTag, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-600 font-semibold">Master Index</span>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            All Notes Catalog
          </h1>
          <p className="text-sm text-neutral-700 mt-1">
            Complete chronological and thematic index across all active notebook volumes.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-600">
          <div>
            <span className="block text-xl font-bold text-neutral-900 font-mono tabular-nums">
              {filteredPages.length}
            </span>
            <span>Notes Indexed</span>
          </div>
          <button
            onClick={onNewNote}
            className="cursor-pointer ml-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            + Create Note
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Notebook Filter */}
          <select
            value={selectedNotebookId}
            onChange={(e) => setSelectedNotebookId(e.target.value)}
            className="cursor-pointer text-xs bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700"
          >
            <option value="all">All Notebook Volumes</option>
            {notebooks.map((nb) => (
              <option key={nb.id} value={nb.id}>
                Volume: {nb.title}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="cursor-pointer text-xs bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700"
          >
            <option value="all">All Topic Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search all notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Notes Table Catalog */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-xl">
          <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-800">No notes found</h3>
          <p className="text-xs text-neutral-500 mt-1">Try resetting filters or search query.</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-500 font-semibold">
                <th className="py-3 px-4">Title &amp; Excerpt</th>
                <th className="py-3 px-4 hidden md:table-cell">Notebook Volume</th>
                <th className="py-3 px-4 hidden lg:table-cell">Tags</th>
                <th className="py-3 px-4 text-right">Words</th>
                <th className="py-3 px-4 text-right">Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPages.map((page) => {
                const parentNb = notebookMap.get(page.notebookId);
                const theme = parentNb ? COVER_THEMES[parentNb.coverTheme] : COVER_THEMES.indigo;
                const stats = countWordsAndChars(page.contentHtml || page.contentMarkdown);
                const excerpt = (page.contentMarkdown || '')
                  .replace(/^#+\s+/gm, '')
                  .slice(0, 100);

                return (
                  <tr
                    key={page.id}
                    onClick={() => onOpenNote(page.notebookId, page.id)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex items-start gap-2">
                        {page.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-amber-600 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-neutral-900 group-hover:text-amber-800 transition-colors flex items-center gap-1.5">
                            <span>{page.title || 'Untitled Note'}</span>
                            {page.isFavorite && (
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            )}
                          </div>
                          {excerpt && (
                            <p className="text-neutral-500 text-[11px] line-clamp-1 mt-0.5">
                              {excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell text-neutral-700">
                      {parentNb ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${theme.spineColor}`} />
                          <span className="truncate max-w-[150px]">{parentNb.title}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4 hidden lg:table-cell text-neutral-500">
                      <div className="flex items-center gap-1 flex-wrap">
                        {page.tags?.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[11px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-600">
                      {stats.words.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-500">
                      {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors inline-flex items-center gap-1 font-medium text-[11px]">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
