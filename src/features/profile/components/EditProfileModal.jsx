import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { getErrorMessage } from '@/services/api';
import { Lock } from 'lucide-react';

export function EditProfileModal() {
  const { activeModal, closeModal } = useUIStore();
  const { user, refreshUser }       = useAuthStore();

  const [bio, setBio]             = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [isPrivateAccount, setIsPrivateAccount] = useState(user?.settings?.isPrivateAccount || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  const isOpen = activeModal === 'editProfile';

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setIsPrivateAccount(user.settings?.isPrivateAccount || false);
    }
  }, [user]);

  const handleClose = () => {
    closeModal();
    setBio(user?.bio || '');
    setAvatarFile(null);
    setPreview(null);
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (bio !== (user?.bio || '')) formData.append('bio', bio);
      if (avatarFile) formData.append('media', avatarFile);

      if (formData.has('bio') || formData.has('media')) {
        await userService.updateProfile(formData);
      }

      if (isPrivateAccount !== (user?.settings?.isPrivateAccount || false)) {
        await userService.updateSettings({ isPrivateAccount });
      }

      await refreshUser();
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profile" size="md">
      <div className="p-6 space-y-4">
        {/* Avatar preview */}
        {preview && (
          <div className="flex items-center gap-4">
            <img
              src={preview}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-300"
            />
            <button
              onClick={() => { setAvatarFile(null); setPreview(null); }}
              className="text-sm text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        {/* Avatar upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>

        <Textarea
          label="Bio"
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
        />

        {/* Private Account toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Private Account</p>
              <p className="text-xs text-neutral-500">When enabled, only people you approve can see your posts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivateAccount(!isPrivateAccount)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isPrivateAccount ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                isPrivateAccount ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 gap-3">
        <Button variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}
