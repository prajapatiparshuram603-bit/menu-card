import React from 'react';
import { Utensils } from 'lucide-react';
import { Restaurant } from '../types/menu';

interface FooterProps {
  restaurant: Restaurant;
}

export const Footer: React.FC<FooterProps> = ({ restaurant }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 text-stone-400 py-8 px-4 border-t border-stone-800 text-center">
      <div className="max-w-md mx-auto space-y-3">
        {/* Restaurant Logo & Name */}
        <div className="flex flex-col items-center justify-center gap-2">
          {restaurant.logoUrl ? (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-10 h-10 rounded-full object-cover border border-amber-500/40 p-0.5"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          )}

          <h4 className="font-display text-base font-bold text-stone-100 tracking-wide">
            {restaurant.name}
          </h4>
        </div>

        {/* View Only Badge */}
        <p className="text-xs text-amber-400 font-medium tracking-wide">
          Digital Menu • View Only
        </p>

        {/* Minimal Copyright */}
        <p className="text-[11px] text-stone-500 pt-1">
          © {currentYear} {restaurant.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
