import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { getErrorMessage } from '@/services/api';
import { ShieldCheck, Mail, Lock, User as UserIcon, Check, KeyRound, Clock, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

export function SettingsPage() {
  const { user, logout, refreshUser, updateUser } = useAuthStore();

  // User fields state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isPrivateAccount, setIsPrivateAccount] = useState(user?.isPrivate || false);

  const [savingAccount, setSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState(null);
  const [accountError, setAccountError] = useState(null);

  // OTP Verification state
  const [sendingVerifyOTP, setSendingVerifyOTP] = useState(false);
  const [verifyOtpCode, setVerifyOtpCode] = useState('');
  const [showVerifyOtpInput, setShowVerifyOtpInput] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  // Password OTP state
  const [sendingPassOTP, setSendingPassOTP] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [passOtpCode, setPassOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(null);
  const [passError, setPassError] = useState(null);

  // Handle Account Privacy Toggle
  const handlePrivacyToggle = async () => {
    const nextVal = !isPrivateAccount;
    setIsPrivateAccount(nextVal);
    updateUser({ isPrivate: nextVal });
    try {
      await userService.updateSettings({ isPrivateAccount: nextVal });
    } catch (err) {
      setIsPrivateAccount(!nextVal);
      updateUser({ isPrivate: !nextVal });
      setAccountError(getErrorMessage(err));
    }
  };

  // Handle Account Verification via OTP
  const handleSendVerifyOTP = async () => {
    setSendingVerifyOTP(true);
    setVerifyError(null);
    setVerifyMessage(null);
    try {
      const res = await authService.sendOTP();
      setVerifyMessage(res.message);
      setShowVerifyOtpInput(true);
    } catch (err) {
      setVerifyError(getErrorMessage(err));
    } finally {
      setSendingVerifyOTP(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!verifyOtpCode.trim()) return;
    setVerifyingOtp(true);
    setVerifyError(null);
    try {
      await authService.verifyOTP(verifyOtpCode.trim());
      setVerifyMessage('Account successfully verified!');
      setShowVerifyOtpInput(false);
      await refreshUser();
    } catch (err) {
      setVerifyError(getErrorMessage(err));
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle Password Reset via OTP
  const handleSendPasswordOTP = async () => {
    setSendingPassOTP(true);
    setPassError(null);
    setPassSuccess(null);
    try {
      const res = await authService.sendPasswordOTP();
      setPassSuccess(res.message);
      setShowPassForm(true);
    } catch (err) {
      setPassError(getErrorMessage(err));
    } finally {
      setSendingPassOTP(false);
    }
  };

  const handleUpdatePasswordWithOTP = async (e) => {
    e.preventDefault();
    if (!passOtpCode.trim() || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long');
      return;
    }

    setUpdatingPass(true);
    setPassError(null);
    setPassSuccess(null);

    try {
      const res = await authService.resetPasswordOTP(passOtpCode.trim(), newPassword);
      setPassSuccess(res.message || 'Password updated successfully!');
      setShowPassForm(false);
      setPassOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(getErrorMessage(err));
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <MainLayout showRightPanel={false}>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Account Settings</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage your account profile and credentials</p>
        </div>

        {/* 1. Account Details Card */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <UserIcon size={18} className="text-primary-500" />
            <h2 className="font-bold text-neutral-900 dark:text-white text-base">Account Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  readOnly
                  className="w-full bg-neutral-100 dark:bg-neutral-800/80 rounded-xl px-3.5 py-2 text-sm text-neutral-800 dark:text-neutral-200 outline-none border border-neutral-200 dark:border-neutral-700 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 mb-1 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-neutral-100 dark:bg-neutral-800/80 rounded-xl px-3.5 py-2 text-sm text-neutral-800 dark:text-neutral-200 outline-none border border-neutral-200 dark:border-neutral-700 font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-medium">Role:</span>
              <span className="px-2.5 py-1 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {user?.role || 'USER'}
              </span>
            </div>

            {user?.createdAt && (
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Clock size={14} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Verification Status Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" />
              <h2 className="font-bold text-neutral-900 dark:text-white text-base">Account Verification</h2>
            </div>
            {user?.isVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Check size={12} strokeWidth={3} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400">
                Unverified
              </span>
            )}
          </div>

          {!user?.isVerified && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-neutral-500">
                Verify your account to perform verbal actions (creating posts, commenting, sending messages).
              </p>

              {!showVerifyOtpInput ? (
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={sendingVerifyOTP}
                  onClick={handleSendVerifyOTP}
                  className="gap-2"
                >
                  <Mail size={14} />
                  <span>Send Verification Code to Email</span>
                </Button>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-3 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                  <Input
                    label="Enter 6-digit Code sent to your email"
                    placeholder="123456"
                    value={verifyOtpCode}
                    onChange={(e) => setVerifyOtpCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" isLoading={verifyingOtp}>
                      Verify Code
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowVerifyOtpInput(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {verifyMessage && <p className="text-xs text-green-500 font-medium">{verifyMessage}</p>}
              {verifyError && <p className="text-xs text-red-500 font-medium">{verifyError}</p>}
            </div>
          )}
        </div>

        {/* 3. Edit Password using OTP Message Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <KeyRound size={18} className="text-amber-500" />
            <div>
              <h2 className="font-bold text-neutral-900 dark:text-white text-base">Security & Password</h2>
              <p className="text-xs text-neutral-400">Change your password securely using email OTP verification</p>
            </div>
          </div>

          {!showPassForm ? (
            <div className="pt-2">
              <Button
                variant="outlined"
                size="sm"
                isLoading={sendingPassOTP}
                onClick={handleSendPasswordOTP}
                className="gap-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <Mail size={14} />
                <span>Send Password Reset OTP Code</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePasswordWithOTP} className="space-y-4 bg-neutral-50 dark:bg-neutral-800/50 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <div className="space-y-3">
                <Input
                  label="6-Digit Verification Code (Sent to Email)"
                  placeholder="123456"
                  value={passOtpCode}
                  onChange={(e) => setPassOtpCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" isLoading={updatingPass}>
                  Update Password
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {passSuccess && <p className="text-xs text-green-500 font-semibold">{passSuccess}</p>}
          {passError && <p className="text-xs text-red-500 font-semibold">{passError}</p>}
        </div>

        {/* 4. Privacy Settings Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-neutral-900 dark:text-white text-base">Account Privacy</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Control whether your profile & posts are public or private</p>
            </div>
            <Toggle
              id="privateAcc"
              checked={isPrivateAccount}
              onChange={handlePrivacyToggle}
            />
          </div>
        </div>

        {/* 5. Danger Zone */}
        <div className="card p-6 space-y-3 border border-red-100 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10">
          <h2 className="font-bold text-red-600 text-base">Sign Out</h2>
          <p className="text-xs text-neutral-500">Log out of your current session on this device.</p>
          <Button variant="danger" size="sm" onClick={logout}>Sign Out</Button>
        </div>
      </div>
    </MainLayout>
  );
}
