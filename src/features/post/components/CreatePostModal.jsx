import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/store/uiStore';
import { usePostStore } from '@/store/postStore';
import { useGroupStore } from '@/store/groupStore';
import { useAuthStore } from '@/store/authStore';
import { postService } from '@/services/postService';
import { groupService } from '@/services/groupService';
import { getErrorMessage } from '@/services/api';
import { Image, X, Users, Share2, Check } from 'lucide-react';

export function CreatePostModal() {
  const { activeModal, activeModalData, closeModal } = useUIStore();
  const { addPost } = usePostStore();
  const { myGroups } = useGroupStore();
  const { user } = useAuthStore();

  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isOpen = activeModal === 'createPost';
  const targetGroupFromModal = activeModalData?.group;
  const shareFromPost = activeModalData?.shareFromPost;

  const handleClose = () => {
    closeModal();
    setContent('');
    setFile(null);
    setPreview(null);
    setSelectedGroupId('');
    setError(null);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      let newPost;

      if (shareFromPost) {
        // Reshare with optional caption
        newPost = await postService.sharePost(shareFromPost.id, content.trim() || undefined);
      } else {
        const formData = new FormData();
        if (content.trim()) formData.append('caption', content.trim());
        if (file) formData.append('media', file);

        const effectiveGroupId = targetGroupFromModal?.id || selectedGroupId;

        if (effectiveGroupId) {
          newPost = await groupService.createGroupPost(effectiveGroupId, formData);
          if (useGroupStore.getState().activeGroup?.id === effectiveGroupId) {
            useGroupStore.getState().selectGroup(effectiveGroupId);
          }
        } else {
          newPost = await postService.createPost(formData);
        }
      }

      if (newPost) addPost(newPost);
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={shareFromPost ? 'Reshare Post' : 'Create New Post'}
      size="md"
    >
      <div className="p-6 space-y-4">
        {/* Posting destination indicator / selector */}
        {targetGroupFromModal ? (
          <div className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-semibold">
            <Users size={16} />
            <span>Posting in <strong>{targetGroupFromModal.name}</strong></span>
          </div>
        ) : (
          !shareFromPost && myGroups.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Post Destination
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2 text-xs outline-none text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
              >
                <option value="">Public Feed</option>
                {myGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    Group: {g.name}
                  </option>
                ))}
              </select>
            </div>
          )
        )}

        <Textarea
          label={shareFromPost ? 'Add a caption (optional)' : "What's on your mind?"}
          placeholder={shareFromPost ? 'Say something about this post...' : 'Share your thoughts...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />

        {/* Reshare Preview Box */}
        {shareFromPost && (
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex items-center gap-2">
              <Avatar
                src={shareFromPost.author?.avatar || shareFromPost.author?.profile?.imgUrl}
                name={shareFromPost.author?.username || 'User'}
                size="xs"
                isVerified={shareFromPost.author?.isVerified}
              />
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                <span>{shareFromPost.author?.username || shareFromPost.author?.displayName}</span>
                {shareFromPost.author?.isVerified && (
                  <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center inline-flex">
                    <Check size={8} strokeWidth={3.5} />
                  </span>
                )}
              </span>
            </div>
            {shareFromPost.caption && (
              <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3">
                {shareFromPost.caption}
              </p>
            )}
            {shareFromPost.mediaUrl && (
              <img
                src={shareFromPost.mediaUrl}
                alt="Original media"
                className="w-full max-h-40 object-cover rounded-xl mt-1"
              />
            )}
          </div>
        )}

        {/* Media upload (only if not resharing) */}
        {!shareFromPost && !file && (
          <label className="flex items-center gap-3 cursor-pointer px-4 py-3 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-primary-400 transition-colors">
            <Image size={20} className="text-neutral-400" />
            <span className="text-sm text-neutral-500">Add photo or video (optional, max 10 MB)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {/* Preview */}
        {!shareFromPost && preview && (
          <div className="relative rounded-xl overflow-hidden">
            {file?.type.startsWith('video/') ? (
              <video src={preview} className="w-full max-h-64 object-cover rounded-xl" controls />
            ) : (
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
            )}
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 gap-3">
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          onClick={handleSubmit}
          disabled={!shareFromPost && !content.trim() && !file}
        >
          {shareFromPost ? 'Reshare' : 'Post'}
        </Button>
      </div>
    </Modal>
  );
}
