import { Notebook, NotePage, INITIAL_NOTEBOOKS, INITIAL_PAGES } from '../types/notebook';

const NOTEBOOKS_KEY = 'folio_notebooks_v1';
const PAGES_KEY = 'folio_pages_v1';

export function loadNotebooks(): Notebook[] {
  try {
    const raw = localStorage.getItem(NOTEBOOKS_KEY);
    if (!raw) {
      saveNotebooks(INITIAL_NOTEBOOKS);
      return INITIAL_NOTEBOOKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTEBOOKS;
  }
}

export function saveNotebooks(notebooks: Notebook[]): void {
  try {
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(notebooks));
  } catch (e) {
    console.error('Failed to save notebooks to localStorage', e);
  }
}

export function loadPages(): NotePage[] {
  try {
    const raw = localStorage.getItem(PAGES_KEY);
    if (!raw) {
      savePages(INITIAL_PAGES);
      return INITIAL_PAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAGES;
  }
}

export function savePages(pages: NotePage[]): void {
  try {
    localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
  } catch (e) {
    console.error('Failed to save pages to localStorage', e);
  }
}

export function countWordsAndChars(textOrHtml: string): { words: number; chars: number; readTimeMin: number } {
  // Strip HTML tags
  const clean = textOrHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) {
    return { words: 0, chars: 0, readTimeMin: 0 };
  }
  const words = clean.split(/\s+/).filter(Boolean).length;
  const chars = clean.length;
  const readTimeMin = Math.max(1, Math.ceil(words / 200));
  return { words, chars, readTimeMin };
}

// Convert HTML to clean readable Markdown
export function htmlToMarkdown(html: string): string {
  let md = html;

  // Headings
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');

  // Bold & Italic
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<strike>(.*?)<\/strike>/gi, '~~$1~~');
  md = md.replace(/<s>(.*?)<\/s>/gi, '~~$1~~');

  // Code
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');

  // Blockquotes
  md = md.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (_match, p1) => {
    return p1.trim().split('\n').map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n';
  });

  // Callouts
  md = md.replace(/<div class="note-callout-[^"]*">([\s\S]*?)<\/div>/gi, (_match, p1) => {
    return `> ${p1.trim().replace(/<[^>]*>/g, '')}\n\n`;
  });

  // Task items
  md = md.replace(/<div class="task-item">\s*<input type="checkbox"( checked)?\s*\/?>\s*<span>(.*?)<\/span>\s*<\/div>/gi, (_m, checked, label) => {
    return `- [${checked ? 'x' : ' '}] ${label.trim()}\n`;
  });

  // Lists
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_match, p1) => {
    return p1.replace(/<li>(.*?)<\/li>/gi, '* $1\n').trim() + '\n\n';
  });
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_match, p1) => {
    let index = 1;
    return p1.replace(/<li>(.*?)<\/li>/gi, () => `${index++}. $1\n`).trim() + '\n\n';
  });

  // Paragraphs & Breaks
  md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');

  // Clean residual tags
  md = md.replace(/<[^>]*>/g, '');
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');

  return md.trim();
}

// Convert basic markdown back to clean HTML
export function markdownToHtml(md: string): string {
  let html = md;

  // Escape basic HTML entities to avoid broken tags
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Checklists
  html = html.replace(/^- \[x\] (.*$)/gim, '<div class="task-item"><input type="checkbox" checked /> <span>$1</span></div>');
  html = html.replace(/^- \[ \] (.*$)/gim, '<div class="task-item"><input type="checkbox" /> <span>$1</span></div>');

  // Bullet Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<strike>$1</strike>');

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // Paragraphs
  const blocks = html.split(/\n{2,}/);
  const formatted = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') ||
        trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<ul') ||
        trimmed.startsWith('<div class="task-item"')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return formatted;
}

export function downloadFile(filename: string, content: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printNote(title: string, contentHtml: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            color: #171717;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-size: 2rem; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { font-size: 1.4rem; margin-top: 24px; }
          h3 { font-size: 1.15rem; margin-top: 18px; }
          code, pre { font-family: monospace; background: #f5f5f5; padding: 2px 5px; border-radius: 4px; }
          pre code { padding: 0; }
          pre { padding: 12px; overflow-x: auto; }
          blockquote { border-left: 3px solid #d4d4d4; padding-left: 12px; font-style: italic; color: #525252; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #d4d4d4; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .task-item { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
          .note-callout-info, .note-callout-tip, .note-callout-warning {
            border: 1px solid #e5e5e5; padding: 12px; border-radius: 6px; margin: 12px 0;
          }
        </style>
      </head>
      <body>
        ${contentHtml}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
