import React, { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Image, Code, Eye } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('rich-text-area') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    const text = prompt('Enter link text:') || 'Link';
    if (url) {
      insertText(`[${text}](${url})`);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    const alt = prompt('Enter image description:') || 'Image';
    if (url) {
      insertText(`![${alt}](${url})`);
    }
  };

  const formatButtons = [
    { icon: Bold, action: () => insertText('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), title: 'Italic' },
    { icon: Underline, action: () => insertText('<u>', '</u>'), title: 'Underline' },
    { icon: List, action: () => insertText('\n- '), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('\n1. '), title: 'Numbered List' },
    { icon: Link, action: insertLink, title: 'Insert Link' },
    { icon: Image, action: insertImage, title: 'Insert Image' },
    { icon: Code, action: () => insertText('`', '`'), title: 'Inline Code' },
  ];

  const renderPreview = (text: string) => {
    // Simple markdown-like rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2" />')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="border border-gray-300 rounded-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1">
          {formatButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={button.action}
                title={button.title}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            {viewMode === 'edit' ? 'Preview' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'edit' ? (
        <textarea
          id="rich-text-area"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border-0 focus:outline-none focus:ring-0 resize-none"
          rows={12}
          style={{ minHeight: '300px' }}
        />
      ) : (
        <div 
          className="p-3 prose max-w-none"
          style={{ minHeight: '300px' }}
          dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
        />
      )}

      {/* Help Text */}
      <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <div className="flex flex-wrap gap-4">
          <span><strong>**bold**</strong></span>
          <span><em>*italic*</em></span>
          <span><code>`code`</code></span>
          <span>[link](url)</span>
          <span>![image](url)</span>
          <span>- list item</span>
          <span>1. numbered list</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;