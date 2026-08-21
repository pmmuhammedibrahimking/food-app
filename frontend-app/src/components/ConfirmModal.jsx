import React from 'react';
import { IconX } from './Icons';

export const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'primary'
  isLoading = false,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  const confirmBtnStyles = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-900/30',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-900/30',
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-900/30'
  };

  const badgeStyles = {
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    primary: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 sm:space-y-5 transform transition-all scale-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyles[type]}`}>
              {type === 'danger' ? 'Warning' : type === 'warning' ? 'Notice' : 'Confirmation'}
            </span>
            <h3 className="text-base font-bold text-slate-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <IconX size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          {/* Grey Secondary Action Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 disabled:opacity-50"
          >
            {cancelText}
          </button>

          {/* Styled Action Button (Red for Danger, Green for Primary) */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 ${confirmBtnStyles[type]}`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
