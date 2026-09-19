import React, { useRef, useEffect } from 'react';
import { Category } from '../types/menu';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string; // 'all' or categoryId
  onSelectCategory: (categoryId: string) => void;
  categoryItemCounts: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  categoryItemCounts,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active category pill into view without cutting off the first item
  useEffect(() => {
    if (containerRef.current) {
      if (selectedCategoryId === 'all') {
        // Reset to absolute start so 'All Dishes' is never cut off on the left
        containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      const activeEl = containerRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [selectedCategoryId]);

  const totalAllCount = Object.values(categoryItemCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="sticky top-[3.75rem] sm:top-16 z-20 bg-stone-950/95 backdrop-blur-md py-2 border-b border-stone-800/80 shadow-md w-full overflow-hidden">
      <div
        ref={containerRef}
        className="w-full max-w-5xl mx-auto px-3 sm:px-4 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain"
        style={{ scrollPaddingLeft: '0.75rem', scrollPaddingRight: '0.75rem' }}
      >
        {/* All Dishes Option - always cleanly aligned to left padding */}
        <button
          type="button"
          data-active={selectedCategoryId === 'all'}
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
            selectedCategoryId === 'all'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
          }`}
        >
          <span>All Dishes</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedCategoryId === 'all' ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
            }`}
          >
            {totalAllCount}
          </span>
        </button>

        {/* Dynamic Categories from Firebase Firestore */}
        {categories.map((cat) => {
          const count = categoryItemCounts[cat.id] || 0;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              data-active={isSelected}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
              }`}
            >
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Right padding buffer for touch scroll */}
        <div className="w-3 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
};
