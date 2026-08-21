import React from 'react';
import { IconFilter } from './Icons';

export const EmptyState = ({
  icon: Icon = IconFilter,
  title = 'No Records Found',
  message = 'There are no items matching your criteria. Try adjusting your filters or search terms.',
  actionText = 'Reset Filters',
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-4 my-2">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
        <Icon size={28} />
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="text-base font-bold text-slate-100">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
