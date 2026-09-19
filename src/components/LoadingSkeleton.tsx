import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-950 animate-pulse text-stone-300">
      {/* Top bar skeleton */}
      <div className="h-16 bg-stone-900 border-b border-stone-800 w-full" />

      {/* Compact Hero skeleton */}
      <div className="py-6 px-4 border-b border-stone-800/80 max-w-xl mx-auto flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-stone-900 mb-2 border border-stone-800" />
        <div className="w-48 h-6 bg-stone-900 rounded mb-2" />
        <div className="w-32 h-3.5 bg-stone-900 rounded mb-2" />
        <div className="w-28 h-8 bg-stone-900 rounded-full" />
      </div>

      {/* Search & filters skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        <div className="w-full h-10 bg-stone-900 rounded-xl border border-stone-800" />
        <div className="flex gap-2 overflow-x-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-20 h-7 bg-stone-900 rounded-full shrink-0 border border-stone-800" />
          ))}
        </div>
      </div>

      {/* Food cards grid skeleton */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-stone-900 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-stone-800 space-y-2">
            <div className="aspect-[4/3] sm:aspect-16/10 w-full bg-stone-950 rounded-lg sm:rounded-xl" />
            <div className="w-3/4 h-4 bg-stone-800 rounded" />
            <div className="w-full h-3 bg-stone-800 rounded" />
            <div className="flex justify-between items-center pt-1">
              <div className="w-10 sm:w-12 h-4 sm:h-5 bg-stone-800 rounded" />
              <div className="w-12 sm:w-14 h-4 sm:h-5 bg-stone-800 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
