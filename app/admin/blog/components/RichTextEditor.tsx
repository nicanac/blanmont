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
    <div className="rounded-md border border-[#e4e0d8] bg-white overflow-hidden focus-within:border-[#e03e3e] shadow-xs transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#e4e0d8] bg-[#f2efe9] p-2 text-xs text-[#101216]">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="rounded px-2.5 py-1.5 font-bold hover:bg-white transition-colors"
          title="Gras (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="rounded px-2.5 py-1.5 italic font-serif hover:bg-white transition-colors"
          title="Italique (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="rounded px-2.5 py-1.5 underline hover:bg-white transition-colors"
          title="Souligné (Ctrl+U)"
        >
          U
        </button>

        <div className="mx-1 h-5 w-px bg-[#e4e0d8]" />

        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="rounded px-2.5 py-1.5 font-extrabold uppercase text-[0.6875rem] tracking-wider hover:bg-white transition-colors"
          title="Titre de section H2"
        >
          Titre H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="rounded px-2.5 py-1.5 font-bold uppercase text-[0.6875rem] tracking-wider hover:bg-white transition-colors"
          title="Sous-titre H3"
        >
          Sous-titre H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="rounded px-2.5 py-1.5 text-[0.6875rem] font-semibold hover:bg-white transition-colors"
          title="Paragraphe standard"
        >
          Texte
        </button>

        <div className="mx-1 h-5 w-px bg-[#e4e0d8]" />

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="rounded px-2.5 py-1.5 hover:bg-white transition-colors"
          title="Liste à puces"
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="rounded px-2.5 py-1.5 hover:bg-white transition-colors"
          title="Liste numérotée"
        >
          1. Liste
        </button>

        <div className="mx-1 h-5 w-px bg-[#e4e0d8]" />

        <button
          type="button"
          onClick={() => {
            const url = prompt('URL du lien (ex: https://strava.com/...) :');
            if (url) execCommand('createLink', url);
          }}
          className="rounded px-2.5 py-1.5 font-semibold text-[#e03e3e] hover:bg-white transition-colors"
          title="Insérer un lien hypertexte"
        >
          🔗 Lien
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('URL de l\'image (https://...) :');
            if (url) execCommand('insertImage', url);
          }}
          className="rounded px-2.5 py-1.5 font-semibold hover:bg-white transition-colors"
          title="Insérer une image dans le corps du texte"
        >
          🖼️ Image
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="prose prose-sm max-w-none min-h-[260px] p-5 text-sm text-[#3a3f4a] bg-white focus:outline-none leading-relaxed"
        style={{ minHeight: '260px' }}
      />
    </div>
  );
}
