/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RichTextEditor from '@/app/admin/blog/components/RichTextEditor';

// Mock useImageUpload hook
vi.mock('@/app/hooks/useImageUpload', () => ({
  useImageUpload: () => ({
    uploadImage: vi.fn().mockResolvedValue('https://res.cloudinary.com/test-cloud/image/upload/v123/blog/test.jpg'),
    isUploading: false,
    progress: 0,
    error: null,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('RichTextEditor component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.execCommand = vi.fn();
  });

  it('renders formatting toolbar and contenteditable area', () => {
    const handleChange = vi.fn();
    render(<RichTextEditor value="<p>Test</p>" onChange={handleChange} />);

    expect(screen.getByRole('button', { name: /mettre en gras/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /format titre h2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /format paragraphe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /liste à puces/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /insérer une image cloudinary/i })).toBeInTheDocument();

    const editorArea = document.querySelector('.prose-editor');
    expect(editorArea).toBeInTheDocument();
    expect(editorArea).toHaveAttribute('contenteditable', 'true');
  });

  it('executes formatting commands when toolbar buttons are clicked', () => {
    const handleChange = vi.fn();
    render(<RichTextEditor value="" onChange={handleChange} />);

    const boldBtn = screen.getByRole('button', { name: /mettre en gras/i });
    fireEvent.click(boldBtn);
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);

    const h2Btn = screen.getByRole('button', { name: /format titre h2/i });
    fireEvent.click(h2Btn);
    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h2>');
  });

  it('opens Cloudinary image modal when image button is clicked', () => {
    const handleChange = vi.fn();
    render(<RichTextEditor value="" onChange={handleChange} />);

    const imageBtn = screen.getByRole('button', { name: /insérer une image cloudinary/i });
    fireEvent.click(imageBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/insérer une image \(cloudinary\)/i)).toBeInTheDocument();
    expect(screen.getByText(/téléverser sur cloudinary/i)).toBeInTheDocument();
    expect(screen.getByText(/coller une url/i)).toBeInTheDocument();
  });

  it('allows inserting an image via external URL tab', async () => {
    const handleChange = vi.fn();
    render(<RichTextEditor value="" onChange={handleChange} />);

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /insérer une image cloudinary/i }));

    // Switch to URL tab
    fireEvent.click(screen.getByText(/coller une url/i));

    // Fill URL and alt
    const urlInput = screen.getByLabelText(/url de l'image/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://res.cloudinary.com/test/photo.jpg' },
    });

    const insertBtn = screen.getByRole('button', { name: /insérer l'url/i });
    fireEvent.click(insertBtn);

    // Modal should close and image should be inserted
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(handleChange).toHaveBeenCalled();
  });
});
