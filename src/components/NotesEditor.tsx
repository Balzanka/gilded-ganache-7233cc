import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Notebook, NotePage, COVER_THEMES, PaperStyle, NoteHistoryEntry } from '../types/notebook';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Star, 
  Pin, 
  Trash2, 
  Copy, 
  Download, 
  Printer, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight,
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Highlighter, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code, 
  Table, 
  Minus, 
  History, 
  FileText,
  Clock,
  Sparkles,
  Share2,
  FolderInput,
  Check
} from 'lucide-react';
import { countWordsAndChars, htmlToMarkdown, markdownToHtml, downloadFile, printNote } from '../utils/storage';

interface NotesEditorProps {
  notebook: Notebook;
  allNotebooks: Notebook[];
  pages: NotePage[];
  initialPageId?: string;
  onBackToCatalog: () => void;
  onSavePage: (page: NotePage) => void;
  onCreatePage: (notebookId: string, templateTitle?: string, templateHtml?: string) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (page: NotePage) => void;
  onMovePageToNotebook: (pageId: string, targetNotebookId: string) => void;
  onOpenTemplates: () => void;
  onOpenNotebook: (notebookId: string, pageId?: string) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  notebook,
  allNotebooks,
  pages,
  initialPageId,
  onBackToCatalog,
  onSavePage,
  onCreatePage,
  onDeletePage,
  onDuplicatePage,
  onMovePageToNotebook,
  onOpenTemplates,
  onOpenNotebook,
}) => {
  // Current active page inside this notebook
  const notebookPages = useMemo(() => {
    return pages
      .filter((p) => p.notebookId === notebook.id)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.order - b.order;
      });
  }, [pages, notebook.id]);

  const [activePageId, setActivePageId] = useState<string>(() => {
    if (initialPageId && notebookPages.some((p) => p.id === initialPageId)) {
      return initialPageId;
    }
    return notebookPages[0]?.id || '';
  });

  // Ensure activePageId remains valid when notebookPages changes
  useEffect(() => {
    if (initialPageId && notebookPages.some((p) => p.id === initialPageId)) {
      setActivePageId(initialPageId);
    } else if (notebookPages.length > 0 && !notebookPages.some((p) => p.id === activePageId)) {
      setActivePageId(notebookPages[0].id);
    }
  }, [initialPageId, notebookPages, activePageId]);

  const activePage = useMemo(() => {
    return notebookPages.find((p) => p.id === activePageId) || notebookPages[0] || null;
  }, [notebookPages, activePageId]);

  // Local editable state for performance and debounce
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'split' | 'markdown'>('visual');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>(notebook.paperStyle || 'ruled');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isCatalogDrawerOpen, setIsCatalogDrawerOpen] = useState(true);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const markdownTextareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // Sync state when active page changes
  useEffect(() => {
    if (activePage) {
      setTitle(activePage.title);
      setContentHtml(activePage.contentHtml);
      setTags(activePage.tags || []);
      if (editorRef.current) {
        editorRef.current.innerHTML = activePage.contentHtml;
      }
    } else {
      setTitle('');
      setContentHtml('');
      setTags([]);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [activePageId]);

  // Handle auto-saving with debounce
  const triggerAutoSave = (newTitle: string, newHtml: string, newTags: string[]) => {
    if (!activePage) return;
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      const markdown = htmlToMarkdown(newHtml);
      const now = new Date().toISOString();

      // Check if we should append a history snapshot
      const existingHistory = activePage.history || [];
      const wordStats = countWordsAndChars(newHtml);
      
      const newHistory: NoteHistoryEntry[] = [
        {
          id: `hist-${Date.now()}`,
          timestamp: now,
          title: newTitle || 'Untitled Note',
          wordCount: wordStats.words,
          contentHtml: newHtml,
        },
        ...existingHistory.slice(0, 9), // keep last 10 snapshots
      ];

      const updatedPage: NotePage = {
        ...activePage,
        title: newTitle || 'Untitled Note',
        contentHtml: newHtml,
        contentMarkdown: markdown,
        tags: newTags,
        updatedAt: now,
        history: newHistory,
      };

      onSavePage(updatedPage);
      setSaveStatus('saved');
    }, 500);
  };

  // Content change handler for visual editor
  const handleContentInput = () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    setContentHtml(newHtml);
    triggerAutoSave(title, newHtml, tags);
  };

  // Content change handler for markdown textarea
  const handleMarkdownChange = (newMd: string) => {
    const newHtml = markdownToHtml(newMd);
    setContentHtml(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
    triggerAutoSave(title, newHtml, tags);
  };

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    triggerAutoSave(newTitle, contentHtml, tags);
  };

  // Add tag
  const handleAddTag = () => {
    const val = newTagInput.trim().replace(/^#/, '');
    if (val && !tags.includes(val)) {
      const updated = [...tags, val];
      setTags(updated);
      setNewTagInput('');
      triggerAutoSave(title, contentHtml, updated);
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    triggerAutoSave(title, contentHtml, updated);
  };

  // WYSIWYG Document Commands
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (editorMode === 'markdown') return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleContentInput();
    }
  };

  // Insert custom block elements
  const insertCustomBlock = (type: 'callout-info' | 'callout-tip' | 'callout-warning' | 'table' | 'divider' | 'task-item' | 'code-block') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    let htmlToInsert = '';
    if (type === 'callout-info') {
      htmlToInsert = `<div class="note-callout-info"><strong>Note:</strong> Enter important context or reminder here.</div><p><br/></p>`;
    } else if (type === 'callout-tip') {
      htmlToInsert = `<div class="note-callout-tip"><strong>Tip:</strong> Enter recommendation or key insight here.</div><p><br/></p>`;
    } else if (type === 'callout-warning') {
      htmlToInsert = `<div class="note-callout-warning"><strong>Warning:</strong> Identify constraints or potential failure points here.</div><p><br/></p>`;
    } else if (type === 'table') {
      htmlToInsert = `<table><thead><tr><th>Parameter</th><th>Value</th><th>Notes</th></tr></thead><tbody><tr><td>Metric A</td><td>100</td><td>Nominal</td></tr><tr><td>Metric B</td><td>250</td><td>Benchmark</td></tr></tbody></table><p><br/></p>`;
    } else if (type === 'divider') {
      htmlToInsert = `<hr/><p><br/></p>`;
    } else if (type === 'task-item') {
      htmlToInsert = `<div class="task-item"><input type="checkbox" /> <span>New action item...</span></div><p><br/></p>`;
    } else if (type === 'code-block') {
      htmlToInsert = `<pre><code>// Enter code or snippet here\nconst result = compute();</code></pre><p><br/></p>`;
    }

    document.execCommand('insertHTML', false, htmlToInsert);
    handleContentInput();
  };

  // Toggle checklist checkbox inside contentEditable directly
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const checkbox = target as HTMLInputElement;
      if (checkbox.checked) {
        checkbox.setAttribute('checked', 'true');
      } else {
        checkbox.removeAttribute('checked');
      }
      handleContentInput();
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (activePage) {
        triggerAutoSave(title, contentHtml, tags);
      }
    }
  };

  // Export handlers
  const handleCopyMarkdown = () => {
    const md = htmlToMarkdown(contentHtml);
    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
    setShowExportMenu(false);
  };

  const handleDownloadMarkdown = () => {
    const md = htmlToMarkdown(contentHtml);
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.md`;
    downloadFile(filename, md, 'text/markdown');
    setShowExportMenu(false);
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,sans-serif;line-height:1.7;padding:2rem;max-width:800px;margin:auto;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:8px;}pre{background:#222;color:#eee;padding:12px;border-radius:6px;overflow-x:auto;}</style></head><body><h1>${title}</h1>${contentHtml}</body></html>`;
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.html`;
    downloadFile(filename, fullHtml, 'text/html');
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    printNote(title, contentHtml);
    setShowExportMenu(false);
  };

  // Paper styling class
  const getPaperClass = () => {
    if (paperStyle === 'ruled') return 'paper-ruled';
    if (paperStyle === 'grid') return 'paper-grid';
    if (paperStyle === 'dots') return 'paper-dots';
    return 'bg-white';
  };

  const themeConfig = COVER_THEMES[notebook.coverTheme] || COVER_THEMES.indigo;
  const wordStats = countWordsAndChars(contentHtml);

  // Filtered pages in this notebook for the drawer catalog
  const filteredCatalogPages = useMemo(() => {
    const q = pageSearchQuery.toLowerCase().trim();
    if (!q) return notebookPages;
    return notebookPages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [notebookPages, pageSearchQuery]);

  return (
    <div className={`min-h-[calc(100vh-57px)] flex flex-col bg-neutral-100 ${isZenMode ? 'fixed inset-0 z-50 bg-white' : ''}`} onKeyDown={handleKeyDown}>
      {/* Top Breadcrumb & Control Bar */}
      <div className="bg-white border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-20">
        {/* Left: Breadcrumbs & Drawer Toggle */}
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            onClick={onBackToCatalog}
            className="cursor-pointer p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1 text-xs shrink-0"
            title="Return to Catalog"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Catalog</span>
          </button>

          <span className="text-neutral-300">/</span>

          {/* Notebook switcher pill */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMoveDropdown(!showMoveDropdown)}
              className="cursor-pointer flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors truncate max-w-[200px]"
            >
              <span className={`w-2 h-2 rounded-full ${themeConfig.spineColor}`} />
              <span className="truncate">{notebook.title}</span>
            </button>

            {/* Notebook Switcher Dropdown */}
            {showMoveDropdown && (
              <div 
                className="absolute left-0 mt-1 w-64 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-30 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Switch Notebook
                </div>
                {allNotebooks.map((nb) => {
                  const nbTheme = COVER_THEMES[nb.coverTheme] || COVER_THEMES.indigo;
                  const isCurrent = nb.id === notebook.id;
                  return (
                    <button
                      key={nb.id}
                      onClick={() => {
                        setShowMoveDropdown(false);
                        onOpenNotebook(nb.id);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-100 cursor-pointer ${
                        isCurrent ? 'bg-neutral-50 font-semibold text-neutral-900' : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full ${nbTheme.spineColor} shrink-0`} />
                        <span className="truncate">{nb.title}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span className="text-neutral-300">/</span>

          <span className="text-xs font-medium text-neutral-600 truncate">
            {title || 'Untitled Note'}
          </span>
        </div>

        {/* Right: Actions, Auto-save, Zen mode */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Auto-save quiet indicator */}
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-neutral-600 pr-2">
            <Clock className="w-3 h-3 text-neutral-600" />
            {saveStatus === 'saving' ? 'Saving...' : 'Auto-saved'}
          </span>

          {/* Drawer toggle button */}
          <button
            onClick={() => setIsCatalogDrawerOpen(!isCatalogDrawerOpen)}
            className={`cursor-pointer p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
              isCatalogDrawerOpen ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title={isCatalogDrawerOpen ? 'Collapse notebook index' : 'Show notebook index'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Index ({notebookPages.length})</span>
          </button>

          {/* Pin note button */}
          {activePage && (
            <button
              onClick={() => {
                const updated = { ...activePage, isPinned: !activePage.isPinned };
                onSavePage(updated);
              }}
              className={`cursor-pointer p-1.5 rounded-md transition-colors ${
                activePage.isPinned ? 'text-amber-600 bg-amber-50' : 'text-neutral-400 hover:text-neutral-700'
              }`}
              title={activePage.isPinned ? 'Unpin note' : 'Pin note to top of catalog'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Favorite note button */}
          {activePage && (
            <button
              onClick={() => {
                const updated = { ...activePage, isFavorite: !activePage.isFavorite };
                onSavePage(updated);
              }}
              className={`cursor-pointer p-1.5 rounded-md transition-colors ${
                activePage.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-neutral-400 hover:text-amber-500'
              }`}
              title={activePage.isFavorite ? 'Remove from favorites' : 'Star note'}
            >
              <Star className={`w-3.5 h-3.5 ${activePage.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="cursor-pointer p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1 text-xs"
              title="Export & Share"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-30 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleCopyMarkdown}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 flex items-center gap-2 text-neutral-700 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 flex items-center gap-2 text-neutral-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md File</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 flex items-center gap-2 text-neutral-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .html Page</span>
                </button>
                <div className="border-t border-neutral-100 my-1" />
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 flex items-center gap-2 text-neutral-700 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Clean PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* History modal trigger */}
          {activePage && activePage.history && activePage.history.length > 0 && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="cursor-pointer p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              title="View revision history"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Zen Focus Mode Toggle */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="cursor-pointer p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Fullscreen Focus'}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Markdown copied to clipboard</span>
        </div>
      )}

      {/* Main Container: Split Drawer + Note Editor Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notebook Page Catalog Drawer / Sidebar */}
        {isCatalogDrawerOpen && !isZenMode && (
          <aside className="w-72 bg-white border-r border-neutral-200 flex flex-col shrink-0">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Notebook Pages
                </span>
                <button
                  onClick={() => onCreatePage(notebook.id)}
                  className="cursor-pointer p-1 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded flex items-center gap-1 text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Page</span>
                </button>
              </div>

              {/* Page search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter pages in volume..."
                  value={pageSearchQuery}
                  onChange={(e) => setPageSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-600"
                />
              </div>
            </div>

            {/* Pages List in Notebook */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
              {filteredCatalogPages.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No pages match your filter.
                </div>
              ) : (
                filteredCatalogPages.map((page, index) => {
                  const isActive = page.id === activePageId;
                  const pWordStats = countWordsAndChars(page.contentHtml || page.contentMarkdown);
                  const previewText = (page.contentMarkdown || '')
                    .replace(/^#+\s+/gm, '')
                    .slice(0, 75);

                  return (
                    <div
                      key={page.id}
                      onClick={() => setActivePageId(page.id)}
                      className={`p-3 cursor-pointer transition-colors group relative ${
                        isActive ? 'bg-amber-50/60 border-l-2 border-neutral-900' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {page.isPinned && (
                            <Pin className="w-3 h-3 text-amber-600 shrink-0 fill-amber-600" />
                          )}
                          <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-neutral-900 font-bold' : 'text-neutral-700'}`}>
                            {page.title || 'Untitled Note'}
                          </h4>
                        </div>
                        {page.isFavorite && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>

                      {previewText && (
                        <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                          {previewText}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 font-mono tabular-nums">
                        <span>p. {index + 1}</span>
                        <span>{pWordStats.words} words</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Bottom Bar: Add template or quick actions */}
            <div className="p-3 border-t border-neutral-200 bg-neutral-50/70 flex items-center justify-between text-xs">
              <button
                onClick={onOpenTemplates}
                className="cursor-pointer text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 text-[11px] font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Page Templates</span>
              </button>

              <button
                onClick={() => onCreatePage(notebook.id)}
                className="cursor-pointer text-neutral-900 font-semibold flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3 h-3" />
                <span>Add Note</span>
              </button>
            </div>
          </aside>
        )}

        {/* Editor Central Canvas */}
        <main className="flex-1 flex flex-col bg-neutral-100 overflow-y-auto">
          {activePage ? (
            <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-4">
              {/* Note Formatting Toolbar */}
              <div className="bg-white border border-neutral-200 rounded-xl p-2 shadow-xs flex items-center justify-between gap-2 flex-wrap text-neutral-700 sticky top-1 z-10">
                {/* Visual / Split / Markdown Mode Toggles */}
                <div className="flex items-center border border-neutral-200 rounded-lg p-0.5 bg-neutral-50">
                  <button
                    onClick={() => setEditorMode('visual')}
                    className={`cursor-pointer px-2.5 py-1 text-xs font-medium rounded ${
                      editorMode === 'visual' ? 'bg-white shadow-xs text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setEditorMode('split')}
                    className={`cursor-pointer px-2.5 py-1 text-xs font-medium rounded ${
                      editorMode === 'split' ? 'bg-white shadow-xs text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setEditorMode('markdown')}
                    className={`cursor-pointer px-2.5 py-1 text-xs font-medium rounded ${
                      editorMode === 'markdown' ? 'bg-white shadow-xs text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Markdown
                  </button>
                </div>

                {/* Primary Formatting Controls */}
                <div className="flex items-center gap-1 border-l border-neutral-200 pl-2">
                  <button
                    onClick={() => execCmd('bold')}
                    title="Bold (Ctrl+B)"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 hover:text-neutral-900 cursor-pointer"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => execCmd('italic')}
                    title="Italic (Ctrl+I)"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 hover:text-neutral-900 cursor-pointer"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => execCmd('underline')}
                    title="Underline (Ctrl+U)"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 hover:text-neutral-900 cursor-pointer"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => execCmd('strikeThrough')}
                    title="Strikethrough"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 hover:text-neutral-900 cursor-pointer"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => execCmd('hiliteColor', '#fef08a')}
                    title="Highlight Yellow"
                    className="p-1.5 hover:bg-neutral-100 rounded text-amber-600 hover:text-amber-800 cursor-pointer"
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-1 border-l border-neutral-200 pl-2">
                  <button
                    onClick={() => execCmd('formatBlock', '<h1>')}
                    title="Heading 1"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => execCmd('formatBlock', '<h2>')}
                    title="Heading 2"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => execCmd('formatBlock', '<h3>')}
                    title="Heading 3"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Lists & Task Items */}
                <div className="flex items-center gap-1 border-l border-neutral-200 pl-2">
                  <button
                    onClick={() => execCmd('insertUnorderedList')}
                    title="Bullet List"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => execCmd('insertOrderedList')}
                    title="Numbered List"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertCustomBlock('task-item')}
                    title="Interactive Checklist Item"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Block Inserts */}
                <div className="flex items-center gap-1 border-l border-neutral-200 pl-2">
                  <button
                    onClick={() => execCmd('formatBlock', '<blockquote>')}
                    title="Quote Block"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertCustomBlock('code-block')}
                    title="Code Block"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertCustomBlock('table')}
                    title="Insert 3x2 Table"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <Table className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertCustomBlock('divider')}
                    title="Horizontal Line"
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Paper Ruling Selector */}
                <div className="border-l border-neutral-200 pl-2">
                  <select
                    value={paperStyle}
                    onChange={(e) => setPaperStyle(e.target.value as PaperStyle)}
                    className="cursor-pointer text-[11px] bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-600 focus:outline-none"
                    title="Change paper texture ruling"
                  >
                    <option value="ruled">Ruled Paper</option>
                    <option value="grid">Grid Texture</option>
                    <option value="dots">Dot Matrix</option>
                    <option value="blank">Blank White</option>
                  </select>
                </div>
              </div>

              {/* Note Paper Sheet */}
              <div className={`bg-white border border-neutral-300 rounded-xl shadow-sm p-8 sm:p-12 relative min-h-[600px] flex flex-col ${getPaperClass()}`}>
                {/* Note Header: Title & Metadata */}
                <div className="mb-6 pb-4 border-b border-neutral-200">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Note Title..."
                    className="w-full text-2xl sm:text-3xl font-bold text-neutral-900 bg-transparent border-none outline-none placeholder:text-neutral-300 tracking-tight"
                  />

                  {/* Clean unboxed metadata strip */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                    <span className="font-mono tabular-nums">{wordStats.words} words</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{wordStats.chars} chars</span>
                    <span aria-hidden="true">·</span>
                    <span>{wordStats.readTimeMin} min read</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {new Date(activePage.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                    {/* Move to another notebook button */}
                    <span aria-hidden="true">·</span>
                    <div className="relative inline-block">
                      <select
                        value={activePage.notebookId}
                        onChange={(e) => onMovePageToNotebook(activePage.id, e.target.value)}
                        className="cursor-pointer text-[11px] bg-neutral-100 hover:bg-neutral-200 rounded px-2 py-0.5 text-neutral-600 focus:outline-none"
                        title="Move note to another notebook"
                      >
                        {allNotebooks.map((nb) => (
                          <option key={nb.id} value={nb.id}>
                            Folder: {nb.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Inline Tag Manager (Anti-slop, clean unboxed text) */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 cursor-pointer ml-0.5"
                          title="Remove tag"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="+ add tag"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="text-[11px] bg-transparent border-b border-dashed border-neutral-300 focus:border-neutral-900 outline-none px-1 py-0.5 text-neutral-700 w-20"
                      />
                    </div>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex flex-col">
                  {editorMode === 'visual' && (
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleContentInput}
                      onClick={handleEditorClick}
                      className="prose-editor flex-1 outline-none min-h-[450px]"
                    />
                  )}

                  {editorMode === 'markdown' && (
                    <textarea
                      ref={markdownTextareaRef}
                      value={htmlToMarkdown(contentHtml)}
                      onChange={(e) => handleMarkdownChange(e.target.value)}
                      placeholder="Type markdown syntax here..."
                      className="w-full flex-1 p-4 font-mono text-sm leading-relaxed bg-neutral-900 text-neutral-100 rounded-lg outline-none resize-none min-h-[450px]"
                    />
                  )}

                  {editorMode === 'split' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[450px]">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-neutral-400 mb-1">
                          Markdown Syntax
                        </span>
                        <textarea
                          value={htmlToMarkdown(contentHtml)}
                          onChange={(e) => handleMarkdownChange(e.target.value)}
                          className="w-full flex-1 p-4 font-mono text-xs leading-relaxed bg-neutral-900 text-neutral-100 rounded-lg outline-none resize-none min-h-[400px]"
                        />
                      </div>
                      <div className="flex flex-col border-l border-neutral-200 pl-6">
                        <span className="text-[11px] font-semibold text-neutral-400 mb-1">
                          Live Rendered Document
                        </span>
                        <div
                          ref={editorRef}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={handleContentInput}
                          onClick={handleEditorClick}
                          className="prose-editor flex-1 outline-none min-h-[400px]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sheet Bottom Footer info */}
                <div className="mt-8 pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDuplicatePage(activePage)}
                      className="cursor-pointer hover:text-neutral-700 transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicate Note</span>
                    </button>
                    <span aria-hidden="true">·</span>
                    <button
                      onClick={() => onDeletePage(activePage.id)}
                      className="cursor-pointer hover:text-rose-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Note</span>
                    </button>
                  </div>

                  <span className="font-mono tabular-nums text-[11px]">
                    Created {new Date(activePage.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <FileText className="w-12 h-12 text-neutral-300 mb-3" />
              <h3 className="text-base font-semibold text-neutral-800">No note selected</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Select an existing note from this volume's catalog or create a fresh note page to start writing.
              </p>
              <button
                onClick={() => onCreatePage(notebook.id)}
                className="cursor-pointer mt-4 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Note</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Revision History Modal */}
      {showHistoryModal && activePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div 
            className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Auto-Save Snapshots</h3>
                <p className="text-xs text-neutral-500">Restore a previous revision of this note.</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4 space-y-2 divide-y divide-neutral-100">
              {activePage.history?.map((entry) => (
                <div key={entry.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-neutral-800 block">
                      {entry.title}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                      {new Date(entry.timestamp).toLocaleTimeString()} · {entry.wordCount} words
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTitle(entry.title);
                      setContentHtml(entry.contentHtml);
                      if (editorRef.current) {
                        editorRef.current.innerHTML = entry.contentHtml;
                      }
                      triggerAutoSave(entry.title, entry.contentHtml, tags);
                      setShowHistoryModal(false);
                    }}
                    className="cursor-pointer px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="cursor-pointer px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
