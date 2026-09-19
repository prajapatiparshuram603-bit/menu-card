import React from 'react';
import { Search, X, Flame, Star } from 'lucide-react';
import { DietaryFilter } from '../types/menu';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: DietaryFilter;
  onFilterChange: (filter: DietaryFilter) => void;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalCount,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Search Input Box */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4 text-amber-400/80" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search dishes..."
          className="w-full pl-10 pr-10 py-2.5 bg-stone-900 text-stone-100 placeholder-stone-400 text-xs sm:text-sm rounded-xl border border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-200 transition-colors"
            title="Clear search"
          >
            <div className="p-1 rounded-full bg-stone-800 hover:bg-stone-700">
              <X className="w-3.5 h-3.5" />
            </div>
          </button>
        )}
      </div>

      {/* Quick Dietary and Preference Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 text-xs overscroll-x-contain">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
            activeFilter === 'all'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
              : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          All ({totalCount})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange(activeFilter === 'veg' ? 'all' : 'veg')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
            activeFilter === 'veg'
              ? 'bg-emerald-600 text-white font-bold shadow-sm ring-1 ring-emerald-400'
              : 'bg-stone-900 text-emerald-400 hover:bg-stone-800 border border-emerald-900/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Veg</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange(activeFilter === 'non-veg' ? 'all' : 'non-veg')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
            activeFilter === 'non-veg'
              ? 'bg-rose-600 text-white font-bold shadow-sm ring-1 ring-rose-400'
              : 'bg-stone-900 text-rose-400 hover:bg-stone-800 border border-rose-900/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Non-Veg</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange(activeFilter === 'recommended' ? 'all' : 'recommended')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
            activeFilter === 'recommended'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
              : 'bg-stone-900 text-amber-400 hover:bg-stone-800 border border-amber-900/50'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Chef's Special</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange(activeFilter === 'spicy' ? 'all' : 'spicy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium shrink-0 transition-all ${
            activeFilter === 'spicy'
              ? 'bg-orange-600 text-white font-bold shadow-sm'
              : 'bg-stone-900 text-orange-400 hover:bg-stone-800 border border-orange-900/50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Spicy</span>
        </button>
      </div>
    </div>
  );
};
