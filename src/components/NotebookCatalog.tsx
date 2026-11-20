import React, { useState, useMemo } from 'react';
import { 
  Notebook, 
  NotePage, 
  COVER_THEMES, 
  CoverTheme 
} from '../types/notebook';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Star, 
  BookOpen, 
  MoreVertical, 
  Edit3, 
  Copy, 
  Trash2, 
  Archive,
  ArrowRight,
  FileText
} from 'lucide-react';
import { countWordsAndChars } from '../utils/storage';

interface NotebookCatalogProps {
  notebooks: Notebook[];
  pages: NotePage[];
  onOpenNotebook: (notebookId: string, pageId?: string) => void;
  onCreateNotebook: () => void;
  onEditNotebook: (notebook: Notebook) => void;
  onDuplicateNotebook: (notebook: Notebook) => void;
  onDeleteNotebook: (notebookId: string) => void;
  onToggleFavorite: (notebookId: string) => void;
}

export const NotebookCatalog: React.FC<NotebookCatalogProps> = ({
  notebooks,
  pages,
  onOpenNotebook,
  onCreateNotebook,
  onEditNotebook,
  onDuplicateNotebook,
  onDeleteNotebook,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'pages'>('updated');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    notebooks.forEach((nb) => {
      if (nb.category) set.add(nb.category);
    });
    return ['All', ...Array.from(set)];
  }, [notebooks]);

  // Aggregate stats
  const catalogStats = useMemo(() => {
    const totalNotebooks = notebooks.length;
    const totalPages = pages.length;
    const totalWords = pages.reduce((sum, p) => sum + countWordsAndChars(p.contentHtml || p.contentMarkdown).words, 0);
    const activeFavorites = notebooks.filter(n => n.isFavorite).length;

    return { totalNotebooks, totalPages, totalWords, activeFavorites };
  }, [notebooks, pages]);

  // Filtered notebooks
  const filteredNotebooks = useMemo(() => {
    return notebooks
      .filter((nb) => {
        const matchesCat = selectedCategory === 'All' || nb.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q || 
          nb.title.toLowerCase().includes(q) ||
          nb.description.toLowerCase().includes(q) ||
          nb.tags.some((t) => t.toLowerCase().includes(q));
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'pages') {
          const aCount = pages.filter((p) => p.notebookId === a.id).length;
          const bCount = pages.filter((p) => p.notebookId === b.id).length;
          return bCount - aCount;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notebooks, pages, selectedCategory, searchQuery, sortBy]);

  const getNotebookPages = (notebookId: string) => {
    return pages.filter((p) => p.notebookId === notebookId);
  };

  const getNotebookWordCount = (notebookId: string) => {
    const nPages = getNotebookPages(notebookId);
    return nPages.reduce((acc, p) => acc + countWordsAndChars(p.contentHtml || p.contentMarkdown).words, 0);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" onClick={() => setActiveMenuId(null)}>
      {/* Editorial Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-600 font-semibold">Library &amp; Archives</span>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            Notebook Catalog
          </h1>
          <p className="text-sm text-neutral-700 mt-1 max-w-xl">
            Curated fieldbooks, research logs, and working drafts organized into thematic volumes.
          </p>
        </div>

        {/* Quantitative Metrics Bar (Anti-slop, unboxed, tabular-nums) */}
        <div className="flex items-center gap-6 text-xs text-neutral-600 shrink-0">
          <div>
            <span className="block text-xl font-bold text-neutral-900 font-mono tabular-nums">
              {catalogStats.totalNotebooks}
            </span>
            <span>Notebooks</span>
          </div>
          <span className="text-neutral-300">/</span>
          <div>
            <span className="block text-xl font-bold text-neutral-900 font-mono tabular-nums">
              {catalogStats.totalPages}
            </span>
            <span>Note Pages</span>
          </div>
          <span className="text-neutral-300">/</span>
          <div>
            <span className="block text-xl font-bold text-neutral-900 font-mono tabular-nums">
              {catalogStats.totalWords.toLocaleString()}
            </span>
            <span>Words Logged</span>
          </div>
          <div className="pl-2">
            <button
              onClick={onCreateNotebook}
              className="cursor-pointer px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Notebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search, Sort and View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search catalog or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-600"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="cursor-pointer text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700"
          >
            <option value="updated">Recently Updated</option>
            <option value="title">Alphabetical (A-Z)</option>
            <option value="pages">Most Note Pages</option>
          </select>

          <div className="flex items-center border border-neutral-200 rounded-lg p-0.5 bg-neutral-100">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid Catalog"
              className={`cursor-pointer p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Table List"
              className={`cursor-pointer p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Display */}
      {filteredNotebooks.length === 0 ? (
        <div className="text-center py-20 bg-white border border-neutral-200 rounded-xl px-4">
          <BookOpen className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No notebooks match your query</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or clear the category filter to view all notebook volumes.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="cursor-pointer mt-4 px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotebooks.map((nb) => {
            const nbPages = getNotebookPages(nb.id);
            const wordCount = getNotebookWordCount(nb.id);
            const theme = COVER_THEMES[nb.coverTheme] || COVER_THEMES.indigo;

            return (
              <div
                key={nb.id}
                className="group relative bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Book Spine Accent Header */}
                <div
                  className={`h-24 bg-gradient-to-r ${theme.bgGradient} p-4 flex flex-col justify-between relative cursor-pointer`}
                  onClick={() => onOpenNotebook(nb.id)}
                >
                  {/* Spine edge illusion */}
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/25 border-r border-white/10" />

                  <div className="flex items-center justify-between pl-2">
                    <span className="text-[11px] font-medium text-white/70 tracking-wide uppercase">
                      {nb.category || 'General'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(nb.id);
                      }}
                      className="cursor-pointer text-white/70 hover:text-amber-300 transition-colors p-1"
                      title={nb.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                    >
                      <Star className={`w-3.5 h-3.5 ${nb.isFavorite ? 'fill-amber-300 text-amber-300' : ''}`} />
                    </button>
                  </div>

                  <div className="pl-2">
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-amber-100 transition-colors">
                      {nb.title}
                    </h3>
                  </div>
                </div>

                {/* Notebook Body Information */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {nb.description || 'No description added yet for this notebook.'}
                    </p>

                    {/* Paper Texture and Page Info */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono tabular-nums text-neutral-700 font-medium">
                          {nbPages.length} {nbPages.length === 1 ? 'page' : 'pages'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{wordCount.toLocaleString()} words</span>
                      </div>
                      <span className="capitalize text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">
                        {nb.paperStyle}
                      </span>
                    </div>

                    {/* Tags preview (clean unboxed metadata) */}
                    {nb.tags && nb.tags.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[11px] text-neutral-400">
                        {nb.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="hover:text-neutral-700 transition-colors">
                            #{t}
                          </span>
                        ))}
                        {nb.tags.length > 3 && (
                          <span>+{nb.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      {formatDate(nb.updatedAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Menu trigger */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === nb.id ? null : nb.id);
                          }}
                          className="cursor-pointer p-1 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-100"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === nb.id && (
                          <div 
                            className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-20 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditNotebook(nb);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 flex items-center gap-2 text-neutral-700 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onDuplicateNotebook(nb);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 flex items-center gap-2 text-neutral-700 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            <div className="border-t border-neutral-100 my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteNotebook(nb.id);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onOpenNotebook(nb.id)}
                        className="cursor-pointer text-xs font-medium text-neutral-800 hover:text-neutral-950 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold">
                <th className="py-3 px-4">Notebook Title</th>
                <th className="py-3 px-4 hidden md:table-cell">Category</th>
                <th className="py-3 px-4 text-center">Pages</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">Words</th>
                <th className="py-3 px-4 hidden lg:table-cell">Paper Style</th>
                <th className="py-3 px-4 text-right">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredNotebooks.map((nb) => {
                const nbPages = getNotebookPages(nb.id);
                const wordCount = getNotebookWordCount(nb.id);
                const theme = COVER_THEMES[nb.coverTheme] || COVER_THEMES.indigo;

                return (
                  <tr
                    key={nb.id}
                    onClick={() => onOpenNotebook(nb.id)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 rounded-sm ${theme.spineColor} shrink-0`} />
                        <div>
                          <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                            <span>{nb.title}</span>
                            {nb.isFavorite && (
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            )}
                          </div>
                          <p className="text-neutral-500 text-[11px] line-clamp-1 max-w-sm mt-0.5">
                            {nb.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-neutral-600">
                      {nb.category || '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-neutral-700 font-medium">
                      {nbPages.length}
                    </td>
                    <td className="py-3 px-4 text-right hidden sm:table-cell font-mono tabular-nums text-neutral-600">
                      {wordCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell capitalize text-neutral-600">
                      {nb.paperStyle}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-500">
                      {formatDate(nb.updatedAt)}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onToggleFavorite(nb.id)}
                          className="p-1 text-neutral-400 hover:text-amber-500 rounded cursor-pointer"
                          title="Star"
                        >
                          <Star className={`w-3.5 h-3.5 ${nb.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onEditNotebook(nb)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 rounded cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNotebook(nb.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
