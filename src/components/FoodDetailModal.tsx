import React, { useState, useEffect } from 'react';
import { X, Star, Award, Flame, Utensils, CheckCircle2 } from 'lucide-react';
import { MenuItem } from '../types/menu';
import { VegNonVegBadge } from './VegNonVegBadge';

interface FoodDetailModalProps {
  item: MenuItem | null;
  currencySymbol: string;
  categoryName?: string;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  currencySymbol,
  categoryName,
  onClose,
}) => {
  const [imgError, setImgError] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const spicyLevel = item.spicyLevel ?? (item.isSpicy ? 1 : 0);
  const spicyLabels: Record<number, { label: string; desc: string; count: number }> = {
    0: { label: 'Not Spicy', desc: 'Mild & balanced flavours', count: 0 },
    1: { label: 'Mild Spiced', desc: 'Delicate warmth of aromatic herbs', count: 1 },
    2: { label: 'Medium Spiced', desc: 'Standard authentic spice level', count: 2 },
    3: { label: 'Hot & Fiery', desc: 'Intense chilli warmth for spice lovers', count: 3 },
  };

  const spicyInfo = spicyLabels[spicyLevel] || spicyLabels[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-stone-900 text-stone-100 rounded-3xl overflow-hidden shadow-2xl z-10 border border-stone-800 my-8">
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-950/80 hover:bg-stone-950 text-stone-300 hover:text-white flex items-center justify-center backdrop-blur-md border border-stone-700/80 transition-all active:scale-90 shadow-md cursor-pointer"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Food Photography or Tasteful Restaurant Fallback */}
        <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-stone-950 overflow-hidden border-b border-stone-800">
          {!imgError && item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-stone-500 p-8">
              <div className="w-14 h-14 rounded-full bg-stone-900 border border-amber-500/20 flex items-center justify-center text-amber-500/70 mb-2">
                <Utensils className="w-7 h-7" />
              </div>
              <p className="text-sm font-serif tracking-wider text-amber-400/90 uppercase font-medium">
                Traditional Recipe
              </p>
              <p className="text-xs text-stone-500 mt-0.5">Prepared fresh upon dining</p>
            </div>
          )}

          {/* Badges Over Image */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[80%]">
            <div className="bg-stone-950/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-md border border-stone-800">
              <VegNonVegBadge type={item.foodType} size="md" showLabel={true} />
            </div>
            {item.isChefSpecial === true && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs shadow-md">
                <Star className="w-3.5 h-3.5 fill-stone-950" />
                <span>Chef's Special</span>
              </span>
            )}
            {item.isRecommended === true && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600/90 text-stone-100 font-bold text-xs shadow-md">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Recommended</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header with Title and Price */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-3.5">
            <div className="space-y-1">
              {categoryName && (
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  {categoryName}
                </span>
              )}
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                {item.name}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-baseline justify-end gap-0.5">
                <span className="text-base font-bold text-amber-400">{currencySymbol}</span>
                <span className="text-2xl sm:text-3xl font-black text-white font-sans">
                  {item.price}
                </span>
              </div>
              <span className="text-[10px] text-stone-400">View-only menu</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Dish Description
            </h4>
            <p className="text-stone-300 text-sm leading-relaxed font-light">
              {item.description}
            </p>
          </div>

          {/* Spicy Meter (Shown for all dishes with level indicator) */}
          <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-200">{spicyInfo.label}</p>
                <p className="text-[10px] text-stone-400">{spicyInfo.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`w-2 h-5 rounded-full transition-colors ${
                    level <= spicyLevel
                      ? 'bg-orange-500'
                      : 'bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Key Ingredients Breakdown */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Key Ingredients
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-800 text-stone-300 text-xs font-medium rounded-lg border border-stone-700/80"
                  >
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clear Close Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 active:scale-[0.98] text-stone-200 font-semibold text-xs sm:text-sm rounded-xl border border-stone-700 transition-all cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
