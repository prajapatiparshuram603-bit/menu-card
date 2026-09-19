import React from 'react';
import { UtensilsCrossed, Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'empty-category' | 'error' | 'not-found';
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  onAction,
  actionLabel,
}) => {
  const configs = {
    'no-results': {
      icon: Search,
      title: 'No Dishes Found',
      defaultMsg: 'We couldn’t find any dishes matching your search. Try another dish name or reset filters.',
      btnLabel: 'Clear Search & Filters',
    },
    'empty-category': {
      icon: UtensilsCrossed,
      title: 'Category Empty',
      defaultMsg: 'There are currently no active dishes available in this section.',
      btnLabel: 'View All Dishes',
    },
    error: {
      icon: AlertCircle,
      title: 'Unable to Load Menu',
      defaultMsg: 'We encountered an issue retrieving the live menu from Firebase Firestore. Please check your connection.',
      btnLabel: 'Retry',
    },
    'not-found': {
      icon: UtensilsCrossed,
      title: 'Restaurant Menu Not Found',
      defaultMsg: 'This restaurant menu URL does not exist or has not been configured yet.',
      btnLabel: 'Load Default Menu',
    },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div className="py-12 px-4 text-center max-w-md mx-auto">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-stone-900 text-amber-400 border border-stone-800 flex items-center justify-center shadow-md">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-stone-100 mb-1.5 font-display">
        {current.title}
      </h3>
      <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-5">
        {message || current.defaultMsg}
      </p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs tracking-wide transition-all shadow-md active:scale-95"
        >
          {actionLabel || current.btnLabel}
        </button>
      )}
    </div>
  );
};
