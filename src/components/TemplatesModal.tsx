import React, { useState } from 'react';
import { NOTE_TEMPLATES, NoteTemplate, Notebook, COVER_THEMES } from '../types/notebook';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  notebooks: Notebook[];
  defaultNotebookId?: string;
  onClose: () => void;
  onApplyTemplate: (template: NoteTemplate, targetNotebookId: string) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  notebooks,
  defaultNotebookId,
  onClose,
  onApplyTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate>(NOTE_TEMPLATES[0]);
  const [targetNotebookId, setTargetNotebookId] = useState<string>(
    defaultNotebookId || notebooks[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleUseTemplate = () => {
    if (!targetNotebookId) return;
    onApplyTemplate(selectedTemplate, targetNotebookId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">Note Page Templates</h2>
              <p className="text-xs text-neutral-500">
                Instantiate structured architectural, meeting, research, and planning layouts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-200">
          {/* Left: Templates List */}
          <div className="w-full md:w-72 p-4 overflow-y-auto space-y-2 bg-neutral-50/50">
            {NOTE_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplate.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-neutral-900 shadow-xs'
                      : 'bg-white/80 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      {tmpl.category}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 mt-1">{tmpl.title}</h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Template Preview & Target Notebook Selection */}
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-white">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                    Previewing Layout
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                    {selectedTemplate.title}
                  </h3>
                </div>

                {/* Target notebook selector */}
                <div className="text-right">
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Destination Notebook
                  </label>
                  <select
                    value={targetNotebookId}
                    onChange={(e) => setTargetNotebookId(e.target.value)}
                    className="text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                  >
                    {notebooks.map((nb) => (
                      <option key={nb.id} value={nb.id}>
                        {nb.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rendered Preview Box */}
              <div className="bg-neutral-50/70 border border-neutral-200 rounded-lg p-5 font-sans text-xs text-neutral-800 prose-editor max-h-72 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: selectedTemplate.contentHtml }} />
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Template includes formatted headers, tables &amp; checklists
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUseTemplate}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs flex items-center gap-2"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
