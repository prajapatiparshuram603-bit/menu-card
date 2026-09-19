import React, { useState } from 'react';
import { Utensils, Phone, MapPin, X, Menu as MenuIcon } from 'lucide-react';
import { Restaurant } from '../types/menu';

interface NavbarProps {
  restaurant: Restaurant | null;
  onScrollToSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  restaurant,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cleanPhone = restaurant?.phone?.replace(/[^0-9+]/g, '') || '';

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 text-stone-100 transition-all shadow-md">
      <div className="max-w-4xl mx-auto px-4 min-h-[3.75rem] sm:h-16 py-1.5 sm:py-0 flex items-center justify-between gap-2.5">
        {/* Left: Restaurant Logo + Name + Live Digital Menu indicator */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {restaurant?.logoUrl ? (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-amber-500/50 shrink-0 shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}

          {/* Two-line compact layout so restaurant name never looks awkwardly truncated */}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xs sm:text-base font-bold text-stone-100 tracking-wide leading-tight line-clamp-2">
              {restaurant?.name || 'Digital Restaurant Menu'}
            </h1>
            <p className="text-[9px] sm:text-[11px] text-amber-400 font-medium tracking-wider uppercase flex items-center gap-1 mt-0.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
              <span>LIVE DIGITAL MENU • VIEW ONLY</span>
            </p>
          </div>
        </div>

        {/* Right: Minimal customer quick-action control */}
        <div className="flex items-center gap-1.5 shrink-0">
          {restaurant?.phone && (
            <a
              href={`tel:${cleanPhone}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-full text-xs font-semibold border border-stone-800 hover:border-amber-500/40 transition-colors"
              title="Call Restaurant"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          )}

          {/* Minimal Mobile Navigation / Info Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <MenuIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Minimal Mobile Drawer for fast jumping to menu or contact info */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-800/80 bg-stone-950/98 px-4 py-3 sm:hidden text-xs space-y-2 shadow-xl">
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleNavClick('menu-section')}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-stone-900 text-stone-200 hover:text-amber-400 font-medium text-left"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Browse Food Menu</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('restaurant-info-section')}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-stone-900 text-stone-200 hover:text-amber-400 font-medium text-left"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Location & Opening Hours</span>
            </button>
            {restaurant?.phone && (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 font-medium"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Restaurant ({restaurant.phone})</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
