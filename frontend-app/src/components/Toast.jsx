import React from 'react';
import { useHotel } from '../context/HotelContext';
import { IconCheckCircle, IconX } from './Icons';

export const Toast = () => {
  const { toasts, removeToast } = useHotel();

  if (!toasts || !toasts.length) return null;

  const typeConfig = {
    success: {
      border: 'border-emerald-500/40',
      bg: 'bg-slate-900/95',
      iconColor: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400'
    },
    error: {
      border: 'border-rose-500/40',
      bg: 'bg-slate-900/95',
      iconColor: 'text-rose-400',
      badge: 'bg-rose-500/10 text-rose-400'
    },
    warning: {
      border: 'border-amber-500/40',
      bg: 'bg-slate-900/95',
      iconColor: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400'
    },
    info: {
      border: 'border-blue-500/40',
      bg: 'bg-slate-900/95',
      iconColor: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400'
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type] || typeConfig.info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${config.border} ${config.bg} shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up`}
          >
            <span className={`mt-0.5 p-1 rounded-lg ${config.badge} flex-shrink-0`}>
              <IconCheckCircle size={16} className={config.iconColor} />
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800/80 flex-shrink-0"
              aria-label="Close Toast"
            >
              <IconX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
