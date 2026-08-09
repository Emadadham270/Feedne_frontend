import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * ConfirmModal — Popup confirmation modal for delete and critical actions.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center space-y-4">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle size={24} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 text-white"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
