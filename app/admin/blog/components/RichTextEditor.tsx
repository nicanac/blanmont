'use client';

import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps): React.ReactElement {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = (): void => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string): void => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="rounded-lg border border-gray-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-300 bg-gray-50 p-2">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="rounded p-2 hover:bg-gray-200"
          title="Gras"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 3h7.5a4.5 4.5 0 110 9H3V3zM3 12h8.5a4.5 4.5 0 110 9H3v-9z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="rounded p-2 hover:bg-gray-200"
          title="Italique"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 3h8l-1 2H9.5L7 15h3l-1 2H3l1-2h2.5L9 5H6l1-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="rounded p-2 hover:bg-gray-200"
          title="Souligné"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3v8a5 5 0 1010 0V3h-2v8a3 3 0 01-6 0V3H5zM3 17h14v2H3v-2z" />
          </svg>
        </button>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="rounded px-2 py-1 text-sm font-medium hover:bg-gray-200"
          title="Titre"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="rounded px-2 py-1 text-sm font-medium hover:bg-gray-200"
          title="Sous-titre"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="rounded px-2 py-1 text-sm hover:bg-gray-200"
          title="Paragraphe"
        >
          P
        </button>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="rounded p-2 hover:bg-gray-200"
          title="Liste à puces"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 5a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 5a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zM3 9a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="rounded p-2 hover:bg-gray-200"
          title="Liste numérotée"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h.01a1 1 0 110 2H4a1 1 0 01-1-1zm4 0a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 5a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 5a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zM3 9a1 1 0 011-1h.01a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h.01a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <button
          type="button"
          onClick={() => {
            const url = prompt('URL du lien:');
            if (url) execCommand('createLink', url);
          }}
          className="rounded p-2 hover:bg-gray-200"
          title="Lien"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('URL de l\'image:');
            if (url) execCommand('insertImage', url);
          }}
          className="rounded p-2 hover:bg-gray-200"
          title="Image"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="prose prose-sm max-w-none min-h-[250px] p-4 focus:outline-none"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
}
