import React from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Restaurant } from '../types/menu';

interface HeroWelcomeProps {
  restaurant: Restaurant;
  onExploreMenu: () => void;
}

export const HeroWelcome: React.FC<HeroWelcomeProps> = ({
  restaurant,
  onExploreMenu,
}) => {
  return (
    <section className="relative overflow-hidden bg-stone-950 text-white border-b border-stone-800/80">
      {/* Background subtle cover photography with dark gradient */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {restaurant.coverImageUrl && (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/95 to-stone-950" />
      </div>

      {/* Warm luxury glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Compact Hero Container */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-5 sm:py-6 text-center flex flex-col items-center">
        {/* Restaurant Logo */}
        {restaurant.logoUrl && (
          <div className="mb-2 relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-amber-500/60 shadow-md bg-stone-900 p-0.5">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Restaurant Name */}
        <h2 className="font-display text-lg sm:text-2xl font-bold tracking-wide text-stone-100 mb-1 leading-snug">
          {restaurant.name}
        </h2>

        {/* Tagline */}
        {restaurant.tagline && (
          <p className="text-amber-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0 text-amber-400" />
            <span>{restaurant.tagline}</span>
          </p>
        )}

        {/* Short Description */}
        {restaurant.description && (
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl mb-3 line-clamp-2 font-light">
            {restaurant.description}
          </p>
        )}

        {/* Compact Explore Menu Button */}
        <button
          type="button"
          onClick={onExploreMenu}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-full shadow-md shadow-amber-500/20 active:scale-95 transition-all text-xs tracking-wide"
        >
          <span>Explore Menu</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
