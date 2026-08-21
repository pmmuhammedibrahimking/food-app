import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="flex items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl"
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 bg-slate-800 rounded-md ${
                cIdx === 0 ? 'w-20' : cIdx === 1 ? 'w-32' : 'w-24'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="h-3 w-24 bg-slate-800 rounded" />
          <div className="h-8 w-32 bg-slate-800 rounded" />
          <div className="h-3 w-28 bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  );
};
