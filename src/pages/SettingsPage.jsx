import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { userService } from '@/services/userService';
import { getErrorMessage } from '@/services/api';

export function SettingsPage() {
  const { user, logout, refreshUser } = useAuthStore();
  const { theme, toggleTheme, openModal } = useUIStore();

  const [settings, setSettings] = useState({
    privateAccount:  user?.isPrivate   ?? false,
    notifications:   true,
    isDarkMode:      theme === 'dark',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = async (key, backendKey) => {
    const newValue = !settings[key];
    setSettings((s) => ({ ...s, [key]: newValue }));

    // Special case: dark mode is handled locally via uiStore
    if (key === 'isDarkMode') {
      toggleTheme();
    }

    // Persist to backend
    try {
      await userService.updateSettings({ [backendKey]: newValue });
    } catch (err) {
      // Revert on failure
      setSettings((s) => ({ ...s, [key]: !newValue }));
      setSaveError(getErrorMessage(err));
    }
  };

  return (
    <MainLayout showRightPanel={false}>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Settings</h1>

        {/* Profile section */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">Profile</h2>
          <div className="flex items-center gap-4">
            <Avatar src={user?.avatar} name={user?.displayName || user?.username} size="lg" />
            <div>
              <p className="font-semibold">{user?.displayName || user?.username}</p>
              <p className="text-sm text-neutral-400">{user?.handle || `@${user?.username}`}</p>
            </div>
            <Button
              variant="outlined"
              size="sm"
              className="ml-auto"
              onClick={() => openModal('editProfile')}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">Appearance</h2>
          <Toggle
            id="darkMode"
            label="Dark Mode"
            checked={theme === 'dark'}
            onChange={() => handleToggle('isDarkMode', 'isDarkMode')}
          />
        </div>

        {/* Notifications */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">Notifications</h2>
          <Toggle
            id="pushNotif"
            label="Push Notifications"
            checked={settings.notifications}
            onChange={() => handleToggle('notifications', 'notifications')}
          />
        </div>

        {/* Privacy */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">Privacy & Security</h2>
          <Toggle
            id="privateAcc"
            label="Private Account"
            checked={settings.privateAccount}
            onChange={() => handleToggle('privateAccount', 'isPrivateAccount')}
          />
          <p className="text-xs text-neutral-400">
            When enabled, only approved followers can see your posts.
          </p>
        </div>

        {saveError && (
          <p className="text-sm text-red-500">{saveError}</p>
        )}

        {/* Danger zone */}
        <div className="card p-6 space-y-3 border border-red-100 dark:border-red-900/30">
          <h2 className="font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-neutral-500">These actions are permanent and cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="danger" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
