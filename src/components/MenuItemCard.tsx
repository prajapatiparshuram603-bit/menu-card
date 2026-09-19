import React, { useState } from 'react';
import { Star, Flame, Utensils, ChevronRight, Award } from 'lucide-react';
import { MenuItem } from '../types/menu';
import { VegNonVegBadge } from './VegNonVegBadge';

interface MenuItemCardProps {
  item: MenuItem;
  currencySymbol: string;
  onClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currencySymbol,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Spicy indicator
  const hasSpicy = item.isSpicy === true || (item.spicyLevel !== undefined && item.spicyLevel > 0);
  const spicyLevel = item.spicyLevel ?? (item.isSpicy ? 1 : 0);

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative bg-stone-900/90 hover:bg-stone-900 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-stone-800/90 hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Food Image with consistent aspect ratio */}
        <div className="relative aspect-[4/3] sm:aspect-16/10 w-full rounded-lg sm:rounded-xl overflow-hidden bg-stone-950 mb-2 border border-stone-800/60">
          {!imageError && item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          ) : (
            /* Tasteful generic restaurant dish placeholder */
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-stone-500 p-2">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-stone-900 border border-amber-500/20 flex items-center justify-center text-amber-500/60 mb-1">
                <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-serif tracking-wider text-amber-400/80 font-medium uppercase text-center line-clamp-1">
                Special Dish
              </span>
            </div>
          )}

          {/* Badges Over Image: Veg/Non-Veg & Chef's Special / Recommended */}
          <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 z-10 max-w-[80%]">
            {/* Veg / Non-Veg Indicator */}
            <div className="bg-stone-950/90 backdrop-blur-sm p-0.5 rounded shadow-sm border border-stone-800 shrink-0">
              <VegNonVegBadge type={item.foodType} size="sm" />
            </div>

            {/* Chef's Special Badge (Only if isChefSpecial is true) */}
            {item.isChefSpecial === true && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-bold text-[9px] sm:text-[10px] shadow-sm tracking-tight shrink-0"
                title="Chef's Special"
              >
                <Star className="w-2.5 h-2.5 fill-stone-950" />
                <span className="truncate">Chef's Special</span>
              </span>
            )}

            {/* Recommended Badge (Only if isRecommended is true and not already showing Chef's Special) */}
            {item.isRecommended === true && item.isChefSpecial !== true && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-600/90 text-stone-100 font-bold text-[9px] sm:text-[10px] shadow-sm tracking-tight shrink-0"
                title="Recommended"
              >
                <Award className="w-2.5 h-2.5 text-amber-300" />
                <span className="truncate">Recommended</span>
              </span>
            )}
          </div>

          {/* Spicy Level Badge Over Image (top-right, only if isSpicy is true or spicyLevel > 0) */}
          {hasSpicy && (
            <div className="absolute top-1.5 right-1.5 z-10 backdrop-blur-sm shadow-sm">
              <span
                className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-stone-950/90 text-orange-400 text-[9px] sm:text-[10px] font-semibold rounded border border-orange-500/30"
                title={`Spicy Level: ${spicyLevel === 1 ? 'Mild' : spicyLevel === 2 ? 'Medium' : 'Hot'}`}
              >
                <Flame className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                {spicyLevel > 1 && <span className="text-[8px] font-bold">x{spicyLevel}</span>}
              </span>
            </div>
          )}
        </div>

        {/* Dish Details: Readable name + short 2-line description */}
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="font-display text-xs sm:text-base font-bold text-stone-100 leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
            {item.name}
          </h3>

          <p className="text-stone-400 text-[10px] sm:text-xs line-clamp-2 leading-relaxed font-light">
            {item.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & Compact Details Button */}
      <div className="pt-2 mt-2 border-t border-stone-800/80 flex items-center justify-between gap-1">
        <div className="flex items-baseline gap-0.5 shrink-0">
          <span className="text-[10px] sm:text-xs font-semibold text-amber-400">{currencySymbol}</span>
          <span className="text-sm sm:text-lg font-black tracking-tight text-white font-sans">
            {item.price}
          </span>
        </div>

        {/* Small Touch-Friendly Details Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick(item);
          }}
          className="inline-flex items-center gap-0.5 px-2 sm:px-2.5 py-1 rounded-full bg-stone-800 group-hover:bg-amber-500 text-stone-300 group-hover:text-stone-950 text-[10px] sm:text-xs font-semibold border border-stone-700/80 group-hover:border-amber-400 transition-all duration-200 active:scale-95 shadow-xs shrink-0"
        >
          <span>Details</span>
          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </div>
  );
};
