'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import { toast } from 'sonner';
import {
  PhotoIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MinusIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps): React.ReactElement {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const { uploadImage, isUploading, progress } = useImageUpload();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Synchronize incoming value with editor content without resetting cursor unnecessarily
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if actually different to prevent focus jumping
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleInput = useCallback((): void => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const saveSelection = (): void => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = (): void => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  const execCommand = (command: string, val?: string): void => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const insertImageHtml = (src: string, altText: string = ''): void => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();

    const cleanSrc = src.trim();
    const cleanAlt = (altText || 'Photo de l\'article').replace(/"/g, '&quot;');
    const htmlSnippet = `<p><img src="${cleanSrc}" alt="${cleanAlt}" class="rounded-lg border border-line shadow-xs my-4 max-w-full h-auto" /></p><p><br></p>`;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      try {
        const success = document.execCommand('insertHTML', false, htmlSnippet);
        if (!success) {
          insertViaRange(htmlSnippet, sel);
        }
      } catch {
        insertViaRange(htmlSnippet, sel);
      }
    } else {
      editorRef.current.innerHTML += htmlSnippet;
    }

    handleInput();
  };

  const insertViaRange = (html: string, sel: Selection): void => {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const div = document.createElement('div');
    div.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: ChildNode | null;
    while ((node = div.firstChild)) {
      frag.appendChild(node);
    }
    range.insertNode(frag);
  };

  const handleFileSelection = (file: File): void => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadAndInsert = async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('Veuillez d\'abord choisir une image.');
      return;
    }

    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `blog/uploads/${date}-${filename}`;

      const uploadedUrl = await uploadImage(selectedFile, path);
      insertImageHtml(uploadedUrl, imageAlt);
      toast.success('Image téléversée avec succès sur Cloudinary !');

      // Reset state and close modal
      setIsImageModalOpen(false);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setImageAlt('');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Échec du téléversement';
      toast.error(`Erreur lors du téléversement Cloudinary : ${msg}`);
    }
  };

  const handleInsertUrl = (): void => {
    if (!imageUrl.trim()) {
      toast.error('Veuillez saisir une URL d\'image.');
      return;
    }
    insertImageHtml(imageUrl.trim(), imageAlt);
    toast.success('Image insérée dans l\'article.');
    setIsImageModalOpen(false);
    setImageUrl('');
    setImageAlt('');
  };

  const handleEditorDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        saveSelection();
        try {
          toast.info('Téléversement de l\'image vers Cloudinary...');
          const date = new Date().toISOString().split('T')[0];
          const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const path = `blog/uploads/${date}-${filename}`;
          const uploadedUrl = await uploadImage(file, path);
          insertImageHtml(uploadedUrl, file.name);
          toast.success('Image téléversée sur Cloudinary et insérée !');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Erreur';
          toast.error(`Échec du téléversement Cloudinary : ${msg}`);
        }
      }
    }
  };

  const handleEditorPaste = async (e: React.ClipboardEvent<HTMLDivElement>): Promise<void> => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            saveSelection();
            try {
              toast.info('Téléversement de la capture d\'écran vers Cloudinary...');
              const date = new Date().toISOString().split('T')[0];
              const path = `blog/uploads/${date}-paste-${Date.now()}.png`;
              const uploadedUrl = await uploadImage(file, path);
              insertImageHtml(uploadedUrl, 'Image collée');
              toast.success('Image collée téléversée sur Cloudinary !');
              return;
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Erreur';
              toast.error(`Échec du téléversement Cloudinary : ${msg}`);
            }
          }
        }
      }
    }
  };

  const openImageModal = (): void => {
    saveSelection();
    setIsImageModalOpen(true);
  };

  return (
    <div className="rounded-md border border-line bg-white overflow-hidden focus-within:border-brand shadow-xs transition-colors">
      {/* ──── Toolbar ──── */}
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-paper-2 p-2 text-xs text-ink">
        {/* Text Weight & Styles */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded px-2.5 py-1.5 font-bold hover:bg-white hover:text-brand transition-colors"
          title="Gras (Ctrl+B)"
          aria-label="Mettre en gras"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded px-2.5 py-1.5 italic font-serif hover:bg-white hover:text-brand transition-colors"
          title="Italique (Ctrl+I)"
          aria-label="Mettre en italique"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded px-2.5 py-1.5 underline hover:bg-white hover:text-brand transition-colors"
          title="Souligné (Ctrl+U)"
          aria-label="Souligner le texte"
        >
          U
        </button>

        <div className="mx-1 h-5 w-px bg-line" />

        {/* Headings & Blocks */}
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="min-h-[32px] inline-flex items-center justify-center rounded px-2.5 py-1.5 font-extrabold uppercase text-xs tracking-wider hover:bg-white hover:text-brand transition-colors"
          title="Titre de section H2"
          aria-label="Format Titre H2"
        >
          Titre H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="min-h-[32px] inline-flex items-center justify-center rounded px-2.5 py-1.5 font-bold uppercase text-xs tracking-wider hover:bg-white hover:text-brand transition-colors"
          title="Sous-titre H3"
          aria-label="Format Sous-titre H3"
        >
          Sous-titre H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="min-h-[32px] inline-flex items-center justify-center rounded px-2.5 py-1.5 text-xs font-semibold hover:bg-white transition-colors"
          title="Paragraphe standard"
          aria-label="Format Paragraphe"
        >
          Texte
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          className="min-h-[32px] inline-flex items-center justify-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium hover:bg-white transition-colors"
          title="Citation en encadré"
          aria-label="Insérer une citation"
        >
          <ChatBubbleBottomCenterTextIcon className="h-3.5 w-3.5 text-ink-3" />
          <span>Citation</span>
        </button>

        <div className="mx-1 h-5 w-px bg-line" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="min-h-[32px] inline-flex items-center justify-center gap-1 rounded px-2.5 py-1.5 hover:bg-white transition-colors"
          title="Liste à puces"
          aria-label="Liste à puces"
        >
          <ListBulletIcon className="h-3.5 w-3.5 text-brand" />
          <span>Liste</span>
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="min-h-[32px] inline-flex items-center justify-center gap-1 rounded px-2.5 py-1.5 hover:bg-white transition-colors"
          title="Liste numérotée"
          aria-label="Liste numérotée"
        >
          <NumberedListIcon className="h-3.5 w-3.5 text-brand" />
          <span>1. Liste</span>
        </button>

        <div className="mx-1 h-5 w-px bg-line" />

        {/* Links & Images */}
        <button
          type="button"
          onClick={() => {
            saveSelection();
            const url = prompt('URL du lien (ex: https://strava.com/...) :');
            if (url) {
              restoreSelection();
              execCommand('createLink', url);
            }
          }}
          className="min-h-[32px] inline-flex items-center justify-center gap-1 rounded px-2.5 py-1.5 font-semibold text-brand hover:bg-white transition-colors"
          title="Insérer un lien hypertexte"
          aria-label="Insérer un lien"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>Lien</span>
        </button>

        {/* Cloudinary Image Upload Button */}
        <button
          type="button"
          onClick={openImageModal}
          disabled={isUploading}
          className="min-h-[32px] inline-flex items-center justify-center gap-1.5 rounded bg-white px-3 py-1.5 font-bold text-brand border border-line hover:border-brand shadow-2xs hover:bg-paper transition-colors disabled:opacity-50"
          title="Insérer ou téléverser une image (Cloudinary)"
          aria-label="Insérer une image Cloudinary"
        >
          <PhotoIcon className="h-3.5 w-3.5 text-brand" />
          <span>Image (Cloudinary)</span>
        </button>

        <div className="mx-1 h-5 w-px bg-line" />

        {/* Divider & History */}
        <button
          type="button"
          onClick={() => execCommand('insertHorizontalRule')}
          className="min-h-[32px] inline-flex items-center justify-center rounded px-2 py-1.5 text-ink-3 hover:bg-white transition-colors"
          title="Ligne de séparation"
          aria-label="Insérer une ligne de séparation"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('undo')}
          className="min-h-[32px] inline-flex items-center justify-center rounded px-2 py-1.5 text-ink-3 hover:bg-white transition-colors"
          title="Annuler (Ctrl+Z)"
          aria-label="Annuler la dernière action"
        >
          <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('redo')}
          className="min-h-[32px] inline-flex items-center justify-center rounded px-2 py-1.5 text-ink-3 hover:bg-white transition-colors"
          title="Rétablir (Ctrl+Y)"
          aria-label="Rétablir la dernière action"
        >
          <ArrowUturnRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Uploading Banner */}
      {isUploading && (
        <div className="bg-brand-tint border-b border-brand/20 px-4 py-2 text-xs flex items-center justify-between text-brand">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <span className="font-semibold">Téléversement de l&apos;image vers Cloudinary... ({progress}%)</span>
          </div>
          <div className="h-1.5 w-28 rounded-full bg-white overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ──── Editor Content Area ──── */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onDrop={handleEditorDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onPaste={handleEditorPaste}
        data-placeholder={placeholder}
        className={`prose prose-sm prose-editor max-w-none min-h-[300px] p-6 text-sm text-ink-2 bg-white focus:outline-none leading-relaxed transition-colors ${
          isDraggingOver ? 'bg-brand-tint/30 ring-2 ring-dashed ring-brand' : ''
        }`}
        style={{ minHeight: '300px' }}
      />

      {/* Drag overlay hint */}
      {isDraggingOver && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-brand/10 py-2 text-center text-xs font-bold text-brand">
          Déposez l&apos;image ici pour la téléverser directement sur Cloudinary
        </div>
      )}

      {/* ──── Cloudinary Image Insertion Modal ──── */}
      {isImageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-line bg-white shadow-2xl overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-brand-tint text-brand">
                  <PhotoIcon className="h-4 w-4" />
                </div>
                <h3 id="image-modal-title" className="text-sm font-bold uppercase tracking-wider text-ink">
                  Insérer une Image (Cloudinary)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImageModalOpen(false);
                  setSelectedFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md p-1.5 text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
                aria-label="Fermer la boîte de dialogue"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-line bg-paper-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`min-h-[44px] flex-1 py-2.5 px-4 text-center transition-colors border-b-2 ${
                  imageTab === 'upload'
                    ? 'border-brand bg-white text-brand font-bold'
                    : 'border-transparent text-ink-3 hover:text-ink'
                }`}
              >
                Téléverser sur Cloudinary
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`min-h-[44px] flex-1 py-2.5 px-4 text-center transition-colors border-b-2 ${
                  imageTab === 'url'
                    ? 'border-brand bg-white text-brand font-bold'
                    : 'border-transparent text-ink-3 hover:text-ink'
                }`}
              >
                Coller une URL
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {imageTab === 'upload' ? (
                <div className="space-y-4">
                  {/* File Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-line hover:border-brand rounded-lg p-6 text-center bg-paper hover:bg-brand-tint/20 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelection(e.target.files[0]);
                        }
                      }}
                    />
                    <ArrowUpTrayIcon className="h-8 w-8 text-brand" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-ink">
                        Cliquez ou déposez votre photo ici
                      </p>
                      <p className="text-xs text-ink-3 mt-0.5">
                        Formats supportés : JPG, PNG, WebP (téléversé automatiquement sur Cloudinary)
                      </p>
                    </div>
                  </div>

                  {/* Selected Preview */}
                  {selectedFile && previewUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-md border border-line bg-white">
                      <div className="relative h-14 w-20 rounded overflow-hidden bg-black shrink-0 border border-line">
                        <Image
                          src={previewUrl}
                          alt="Prévisualisation"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-ink truncate">{selectedFile.name}</p>
                        <p className="text-ink-3 mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} Ko
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                        }}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-ink-3 hover:text-brand transition-colors"
                        aria-label="Retirer l'image sélectionnée"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Alt text input */}
                  <div>
                    <label htmlFor="image-alt-input" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                      Légende ou description de l&apos;image (Alt text)
                    </label>
                    <input
                      id="image-alt-input"
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Ex: Le groupe réuni au sommet de la côte"
                      className="w-full rounded-md border border-line bg-paper px-3.5 py-2 text-xs text-ink placeholder:text-snow-3 focus:border-brand focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Progress */}
                  {isUploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-ink font-semibold">
                        <span>Émission vers Cloudinary...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-paper-2 overflow-hidden">
                        <div
                          className="h-full bg-brand transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="image-url-input" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                      URL de l&apos;image *
                    </label>
                    <input
                      id="image-url-input"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/... ou https://..."
                      className="w-full rounded-md border border-line bg-paper px-3.5 py-2 text-xs text-ink placeholder:text-snow-3 focus:border-brand focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="image-url-alt-input" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                      Légende ou description (Alt text)
                    </label>
                    <input
                      id="image-url-alt-input"
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Ex: Vue sur le Brabant wallon"
                      className="w-full rounded-md border border-line bg-paper px-3.5 py-2 text-xs text-ink placeholder:text-snow-3 focus:border-brand focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-line bg-paper px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  setIsImageModalOpen(false);
                  setSelectedFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                disabled={isUploading}
                className="min-h-[44px] rounded-md border border-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-paper-2 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              {imageTab === 'upload' ? (
                <button
                  type="button"
                  onClick={handleUploadAndInsert}
                  disabled={!selectedFile || isUploading}
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand-strong px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-xs disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>{isUploading ? 'Téléversement...' : 'Téléverser et Insérer'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInsertUrl}
                  disabled={!imageUrl.trim()}
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand-strong px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-xs disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Insérer l&apos;URL</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
