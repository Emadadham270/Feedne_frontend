import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { ShieldAlert, Mail, X } from 'lucide-react';
import { OTPModal } from './OTPModal';

export function VerificationRequiredModal() {
  const { activeModal, activeModalData, closeModal } = useUIStore();
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  const isOpen = activeModal === 'verificationRequired';
  if (!isOpen && !isOTPModalOpen) return null;

  const handleOpenOTP = () => {
    closeModal();
    setIsOTPModalOpen(true);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1A1D27] rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <ShieldAlert size={32} />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Account Verification Required
              </h2>

              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
                {activeModalData?.message ||
                  'You must verify your email address via OTP before you can create posts, write comments, or send messages.'}
              </p>

              <div className="w-full space-y-3 pt-2">
                <button
                  onClick={handleOpenOTP}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  <span>Verify Account Now (Send OTP)</span>
                </button>

                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Input Modal */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
      />
    </>
  );
}
