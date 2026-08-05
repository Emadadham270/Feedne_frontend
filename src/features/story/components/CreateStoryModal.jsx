import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { useUIStore } from '@/store/uiStore';
import { useStoryStore } from '@/store/storyStore';
import { getErrorMessage } from '@/services/api';
import { Image, Video, X, UploadCloud } from 'lucide-react';

export function CreateStoryModal() {
  const { activeModal, closeModal } = useUIStore();
  const { createStory, isUploading } = useStoryStore();

  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const isOpen = activeModal === 'createStory';

  const handleClose = () => {
    closeModal();
    setCaption('');
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate size (10MB max limit enforce by backend)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum allowed size is 10 MB.');
      return;
    }

    // Validate mime type
    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setError('Invalid file type. Only images and videos are supported.');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('A media file (image or video) is required to create a story.');
      return;
    }

    setError(null);
    try {
      const formData = new FormData();
      formData.append('media', file);
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      await createStory(formData);
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Story" size="md">
      <div className="p-6 space-y-5">
        {/* Upload area or Preview */}
        {!preview ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl cursor-pointer bg-neutral-50 dark:bg-neutral-800/40 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Supports photos (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-black max-h-[380px] flex items-center justify-center group">
            {file?.type.startsWith('video/') ? (
              <video src={preview} controls className="w-full max-h-[380px] object-contain rounded-2xl" />
            ) : (
              <img src={preview} alt="Story Preview" className="w-full max-h-[380px] object-contain rounded-2xl" />
            )}
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition-colors"
              title="Remove media"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Caption */}
        <Textarea
          label="Caption (optional)"
          placeholder="Add a caption to your story..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 gap-3">
        <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          isLoading={isUploading}
          onClick={handleSubmit}
          disabled={!file || isUploading}
        >
          Share Story
        </Button>
      </div>
    </Modal>
  );
}
