import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { ShieldCheck, Mail, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { getErrorMessage } from '@/services/api';

export function OTPModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    setIsSending(true);
    setError(null);
    try {
      await authService.sendOTP();
      setIsSent(true);
      setCountdown(300); // 5 minute countdown
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (code.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      await authService.verifyOTP(code.trim());
      setSuccess(true);
      await refreshUser();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A1D27] rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="py-8 flex flex-col items-center text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold">Account Verified!</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Congratulations! Your email address has been verified. All restrictions have been lifted and your verified badge is active.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 mb-1">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Verify Your Account</h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
                Enter the 6-digit verification code sent to <strong className="text-neutral-800 dark:text-neutral-200">{user?.email}</strong>.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {!isSent ? (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleSendOTP}
                  disabled={isSending}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      <span>Send 6-Digit Code to Gmail</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-3.5 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-neutral-400"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                  <span>
                    {countdown > 0 ? (
                      `Code expires in ${formatTime(countdown)}`
                    ) : (
                      'Code expired'
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isSending || countdown > 240}
                    className="text-blue-500 hover:underline font-semibold disabled:opacity-40"
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || code.trim().length !== 6}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <span>Verify & Unlock Account</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
