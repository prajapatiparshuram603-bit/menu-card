import React from 'react';
import { FoodType } from '../types/menu';

interface VegNonVegBadgeProps {
  type: FoodType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VegNonVegBadge: React.FC<VegNonVegBadgeProps> = ({
  type,
  size = 'md',
  showLabel = false,
}) => {
  const isVeg = type === 'veg';
  const isEgg = type === 'egg';

  const sizeStyles = {
    sm: 'w-3.5 h-3.5 p-0.5 border-[1.5px]',
    md: 'w-4 h-4 p-0.5 border-[2px]',
    lg: 'w-5 h-5 p-1 border-[2px]',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const colorStyles = isVeg
    ? {
        border: 'border-emerald-700 bg-emerald-50',
        dot: 'bg-emerald-600',
        text: 'text-emerald-800',
        label: 'Pure Veg',
      }
    : isEgg
    ? {
        border: 'border-amber-600 bg-amber-50',
        dot: 'bg-amber-600',
        text: 'text-amber-800',
        label: 'Contains Egg',
      }
    : {
        border: 'border-red-700 bg-red-50',
        dot: 'bg-red-600',
        text: 'text-red-800',
        label: 'Non-Veg',
      };

  return (
    <div className="inline-flex items-center gap-1.5" title={colorStyles.label}>
      <div
        className={`flex items-center justify-center rounded-[3px] shrink-0 ${sizeStyles[size]} ${colorStyles.border}`}
      >
        <div className={`rounded-full ${dotSizes[size]} ${colorStyles.dot}`} />
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold uppercase tracking-wider ${colorStyles.text}`}>
          {colorStyles.label}
        </span>
      )}
    </div>
  );
};
