/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Notebook, NotePage, NoteTemplate } from './types/notebook';
import { loadNotebooks, saveNotebooks, loadPages, savePages, htmlToMarkdown } from './utils/storage';
import { TopBar } from './components/TopBar';
import { NotebookCatalog } from './components/NotebookCatalog';
import { NotesEditor } from './components/NotesEditor';
import { AllNotesView } from './components/AllNotesView';
import { FavoritesView } from './components/FavoritesView';
import { NotebookModal } from './components/NotebookModal';
import { TemplatesModal } from './components/TemplatesModal';

export default function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => loadNotebooks());
  const [pages, setPages] = useState<NotePage[]>(() => loadPages());

  const [currentView, setCurrentView] = useState<'catalog' | 'editor' | 'all-notes' | 'favorites'>('catalog');
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>(() => {
    return notebooks[0]?.id || '';
  });
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);

  // Modal states
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [notebookToEdit, setNotebookToEdit] = useState<Notebook | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Persist notebooks on change
  useEffect(() => {
    saveNotebooks(notebooks);
  }, [notebooks]);

  // Persist pages on change
  useEffect(() => {
    savePages(pages);
  }, [pages]);

  // Current active notebook object
  const activeNotebook = notebooks.find((nb) => nb.id === selectedNotebookId) || notebooks[0];

  // Navigation handlers
  const handleOpenNotebook = (notebookId: string, pageId?: string) => {
    setSelectedNotebookId(notebookId);
    setSelectedPageId(pageId);
    setCurrentView('editor');
  };

  const handleOpenNote = (notebookId: string, pageId: string) => {
    setSelectedNotebookId(notebookId);
    setSelectedPageId(pageId);
    setCurrentView('editor');
  };

  // Notebook CRUD
  const handleCreateNotebook = () => {
    setNotebookToEdit(null);
    setIsNotebookModalOpen(true);
  };

  const handleEditNotebook = (notebook: Notebook) => {
    setNotebookToEdit(notebook);
    setIsNotebookModalOpen(true);
  };

  const handleSaveNotebook = (notebookData: Partial<Notebook>) => {
    const now = new Date().toISOString();
    if (notebookToEdit) {
      // Update
      const updated = notebooks.map((nb) =>
        nb.id === notebookToEdit.id
          ? { ...nb, ...notebookData, updatedAt: now }
          : nb
      );
      setNotebooks(updated);
    } else {
      // Create new
      const newId = `nb-${Date.now()}`;
      const newNb: Notebook = {
        id: newId,
        title: notebookData.title || 'Untitled Notebook',
        description: notebookData.description || '',
        coverTheme: notebookData.coverTheme || 'indigo',
        paperStyle: notebookData.paperStyle || 'ruled',
        category: notebookData.category || 'General',
        tags: notebookData.tags || [],
        createdAt: now,
        updatedAt: now,
      };
      setNotebooks([newNb, ...notebooks]);

      // Automatically create a first blank note in this notebook
      const firstPage: NotePage = {
        id: `page-${Date.now()}`,
        notebookId: newId,
        title: 'Initial Note',
        contentHtml: '<h1>Initial Note</h1><p>Start recording your thoughts, diagrams, or requirements here...</p>',
        contentMarkdown: '# Initial Note\n\nStart recording your thoughts, diagrams, or requirements here...',
        tags: [],
        order: 0,
        createdAt: now,
        updatedAt: now,
      };
      setPages([firstPage, ...pages]);

      // Open new notebook in editor
      setSelectedNotebookId(newId);
      setSelectedPageId(firstPage.id);
      setCurrentView('editor');
    }
  };

  const handleDuplicateNotebook = (notebook: Notebook) => {
    const now = new Date().toISOString();
    const newNbId = `nb-${Date.now()}`;
    const duplicatedNb: Notebook = {
      ...notebook,
      id: newNbId,
      title: `${notebook.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };

    // Duplicate all pages belonging to this notebook
    const notebookSourcePages = pages.filter((p) => p.notebookId === notebook.id);
    const duplicatedPages: NotePage[] = notebookSourcePages.map((p, index) => ({
      ...p,
      id: `page-${Date.now()}-${index}`,
      notebookId: newNbId,
      createdAt: now,
      updatedAt: now,
    }));

    setNotebooks([duplicatedNb, ...notebooks]);
    setPages([...duplicatedPages, ...pages]);
  };

  const handleDeleteNotebook = (notebookId: string) => {
    if (notebooks.length <= 1) {
      // Keep at least one notebook
      return;
    }
    const updatedNotebooks = notebooks.filter((n) => n.id !== notebookId);
    const updatedPages = pages.filter((p) => p.notebookId !== notebookId);
    setNotebooks(updatedNotebooks);
    setPages(updatedPages);

    if (selectedNotebookId === notebookId) {
      setSelectedNotebookId(updatedNotebooks[0]?.id || '');
      setSelectedPageId(undefined);
      setCurrentView('catalog');
    }
  };

  const handleToggleFavoriteNotebook = (notebookId: string) => {
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === notebookId ? { ...nb, isFavorite: !nb.isFavorite } : nb
      )
    );
  };

  // Page CRUD
  const handleCreatePage = (
    targetNotebookId?: string,
    templateTitle?: string,
    templateHtml?: string
  ) => {
    const nId = targetNotebookId || selectedNotebookId || notebooks[0]?.id;
    if (!nId) return;

    const now = new Date().toISOString();
    const newPageId = `page-${Date.now()}`;
    const newTitle = templateTitle || 'Untitled Note';
    const newHtml = templateHtml || '<h1>Untitled Note</h1><p>Start writing here...</p>';
    const newMd = htmlToMarkdown(newHtml);

    const targetPages = pages.filter((p) => p.notebookId === nId);

    const newPage: NotePage = {
      id: newPageId,
      notebookId: nId,
      title: newTitle,
      contentHtml: newHtml,
      contentMarkdown: newMd,
      tags: [],
      order: targetPages.length,
      createdAt: now,
      updatedAt: now,
    };

    setPages([newPage, ...pages]);

    // Update notebook updatedAt
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === nId ? { ...nb, updatedAt: now } : nb))
    );

    setSelectedNotebookId(nId);
    setSelectedPageId(newPageId);
    setCurrentView('editor');
  };

  const handleSavePage = (updatedPage: NotePage) => {
    setPages((prev) =>
      prev.map((p) => (p.id === updatedPage.id ? updatedPage : p))
    );

    // Update parent notebook updated timestamp
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === updatedPage.notebookId
          ? { ...nb, updatedAt: updatedPage.updatedAt }
          : nb
      )
    );
  };

  const handleDeletePage = (pageId: string) => {
    const updated = pages.filter((p) => p.id !== pageId);
    setPages(updated);

    // If deleted current active page, select another
    const remainingInNb = updated.filter((p) => p.notebookId === selectedNotebookId);
    if (remainingInNb.length > 0) {
      setSelectedPageId(remainingInNb[0].id);
    } else {
      setSelectedPageId(undefined);
    }
  };

  const handleDuplicatePage = (page: NotePage) => {
    const now = new Date().toISOString();
    const duplicated: NotePage = {
      ...page,
      id: `page-${Date.now()}`,
      title: `${page.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    setPages([duplicated, ...pages]);
    setSelectedPageId(duplicated.id);
  };

  const handleMovePageToNotebook = (pageId: string, targetNotebookId: string) => {
    const now = new Date().toISOString();
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, notebookId: targetNotebookId, updatedAt: now } : p
      )
    );
    setSelectedNotebookId(targetNotebookId);
  };

  const handleApplyTemplate = (template: NoteTemplate, targetNotebookId: string) => {
    handleCreatePage(targetNotebookId, template.title, template.contentHtml);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col antialiased">
      {/* Strict 3-Zone Top Bar */}
      <TopBar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onNewNote={() => handleCreatePage(selectedNotebookId)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
      />

      {/* Main Content Router */}
      <div className="flex-1 flex flex-col">
        {currentView === 'catalog' && (
          <NotebookCatalog
            notebooks={notebooks}
            pages={pages}
            onOpenNotebook={handleOpenNotebook}
            onCreateNotebook={handleCreateNotebook}
            onEditNotebook={handleEditNotebook}
            onDuplicateNotebook={handleDuplicateNotebook}
            onDeleteNotebook={handleDeleteNotebook}
            onToggleFavorite={handleToggleFavoriteNotebook}
          />
        )}

        {currentView === 'editor' && activeNotebook && (
          <NotesEditor
            notebook={activeNotebook}
            allNotebooks={notebooks}
            pages={pages}
            initialPageId={selectedPageId}
            onBackToCatalog={() => setCurrentView('catalog')}
            onSavePage={handleSavePage}
            onCreatePage={handleCreatePage}
            onDeletePage={handleDeletePage}
            onDuplicatePage={handleDuplicatePage}
            onMovePageToNotebook={handleMovePageToNotebook}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            onOpenNotebook={(nbId, pageId) => {
              setSelectedNotebookId(nbId);
              setSelectedPageId(pageId);
            }}
          />
        )}

        {currentView === 'all-notes' && (
          <AllNotesView
            notebooks={notebooks}
            pages={pages}
            onOpenNote={handleOpenNote}
            onNewNote={() => handleCreatePage()}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            notebooks={notebooks}
            pages={pages}
            onOpenNotebook={handleOpenNotebook}
            onOpenNote={handleOpenNote}
          />
        )}
      </div>

      {/* Modals */}
      <NotebookModal
        isOpen={isNotebookModalOpen}
        notebookToEdit={notebookToEdit}
        onClose={() => {
          setIsNotebookModalOpen(false);
          setNotebookToEdit(null);
        }}
        onSave={handleSaveNotebook}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        notebooks={notebooks}
        defaultNotebookId={selectedNotebookId}
        onClose={() => setIsTemplatesModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
}
