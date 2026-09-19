import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Restaurant, Category, MenuItem, DietaryFilter } from './types/menu';
import {
  subscribeRestaurant,
  subscribeCategories,
  subscribeMenuItems,
  seedRestaurantDatabase,
} from './services/menuService';
import {
  DEFAULT_RESTAURANT_ID,
  initialRestaurantData,
  initialCategories,
  initialMenuItemsData,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroWelcome } from './components/HeroWelcome';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { MenuItemCard } from './components/MenuItemCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { RestaurantInfo } from './components/RestaurantInfo';
import { Footer } from './components/Footer';
import { AdminAuthGuard } from './components/AdminAuthGuard';
import { TableQrModal } from './components/TableQrModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';

function checkIsAdminRoute(): boolean {
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.get('admin') === 'true') return true;

  const adminPaths = ['/admin', '/dashboard', '/categories', '/restaurant', '/qr-code', '/settings', '/login'];
  return adminPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`) || hash.startsWith(`#${p}`));
}

export default function App() {
  // Extract restaurant ID from /menu/:id or query param
  const [restaurantId, setRestaurantId] = useState<string>(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get('restaurant')) {
      return searchParams.get('restaurant')!;
    }

    const pathMatch = pathname.match(/\/menu\/([^/?#]+)/);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }

    const hashMatch = hash.match(/#\/menu\/([^/?#]+)/);
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1];
    }

    return DEFAULT_RESTAURANT_ID;
  });

  // Fallback initial categories with deterministic IDs
  const defaultCategories: Category[] = useMemo(() => {
    return initialCategories.map((c, i) => ({
      id: `cat-${i + 1}`,
      ...c,
    }));
  }, []);

  // Fallback initial menu items linked with category IDs
  const defaultMenuItems: MenuItem[] = useMemo(() => {
    return initialMenuItemsData.map((item, idx) => {
      const cat = defaultCategories.find((c) => c.name === item.categoryName);
      return {
        id: `item-${idx + 1}`,
        categoryId: cat ? cat.id : 'cat-1',
        restaurantId: item.restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        foodType: item.foodType,
        isAvailable: item.isAvailable,
        isChefSpecial: item.isRecommended ?? false,
        isRecommended: item.isRecommended ?? false,
        isSpicy: (item.spicyLevel ?? 0) > 1,
        spicyLevel: item.spicyLevel,
        ingredients: item.ingredients,
        displayOrder: item.displayOrder,
      };
    });
  }, [defaultCategories]);

  // State from Firebase Firestore with instant initial data fallback
  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => {
    return restaurantId === DEFAULT_RESTAURANT_ID ? initialRestaurantData : null;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    return restaurantId === DEFAULT_RESTAURANT_ID ? defaultCategories : [];
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    return restaurantId === DEFAULT_RESTAURANT_ID ? defaultMenuItems : [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return restaurantId !== DEFAULT_RESTAURANT_ID;
  });
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<DietaryFilter>('all');

  // Food details modal state
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  // QR Code Modal
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Protected Admin Route Guard state
  const [isAdminView, setIsAdminView] = useState<boolean>(checkIsAdminRoute);

  const menuSectionRef = useRef<HTMLDivElement>(null);
  const autoSeededRef = useRef<boolean>(false);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    setError(null);

    let unsubRest: (() => void) | null = null;
    let unsubCats: (() => void) | null = null;
    let unsubItems: (() => void) | null = null;

    try {
      // 1. Restaurant listener
      unsubRest = subscribeRestaurant(
        restaurantId,
        async (restData) => {
          if (restData) {
            setRestaurant(restData);
          } else if (restaurantId === DEFAULT_RESTAURANT_ID) {
            setRestaurant(initialRestaurantData);
            if (!autoSeededRef.current) {
              autoSeededRef.current = true;
              seedRestaurantDatabase(restaurantId).catch(() => {});
            }
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Restaurant subscription notice:', err.message);
          if (restaurantId === DEFAULT_RESTAURANT_ID && !restaurant) {
            setRestaurant(initialRestaurantData);
          }
          setLoading(false);
        }
      );

      // 2. Categories listener
      unsubCats = subscribeCategories(
        restaurantId,
        (cats) => {
          if (cats && cats.length > 0) {
            setCategories(cats);
          } else if (restaurantId === DEFAULT_RESTAURANT_ID) {
            setCategories(defaultCategories);
          }
        },
        (err) => {
          console.warn('Categories subscription notice:', err.message);
          if (restaurantId === DEFAULT_RESTAURANT_ID) {
            setCategories(defaultCategories);
          }
        }
      );

      // 3. Menu items listener
      unsubItems = subscribeMenuItems(
        restaurantId,
        (items) => {
          if (items && items.length > 0) {
            setMenuItems(items);
          } else if (restaurantId === DEFAULT_RESTAURANT_ID) {
            setMenuItems(defaultMenuItems);
          }
        },
        (err) => {
          console.warn('Items subscription notice:', err.message);
          if (restaurantId === DEFAULT_RESTAURANT_ID) {
            setMenuItems(defaultMenuItems);
          }
        },
        true // Load items to support instant updates
      );
    } catch (e: any) {
      console.warn('Firestore connection notice:', e.message);
      if (restaurantId === DEFAULT_RESTAURANT_ID) {
        setRestaurant(initialRestaurantData);
        setCategories(defaultCategories);
        setMenuItems(defaultMenuItems);
      }
      setLoading(false);
    }

    return () => {
      if (unsubRest) unsubRest();
      if (unsubCats) unsubCats();
      if (unsubItems) unsubItems();
    };
  }, [restaurantId, defaultCategories, defaultMenuItems]);

  // Sync public URL /menu/{restaurantId} when in customer view
  useEffect(() => {
    if (!isAdminView) {
      const targetPath = `/menu/${restaurantId}`;
      if (window.location.pathname !== targetPath && !window.location.pathname.startsWith('/menu/')) {
        window.history.replaceState(null, '', targetPath);
      }
    }
  }, [restaurantId, isAdminView]);

  // Smooth scroll to menu section
  const handleScrollToMenu = () => {
    if (menuSectionRef.current) {
      menuSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Map category IDs to category names
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Customer menu displays ONLY available dishes, sorted by displayOrder
  const availableMenuItems = useMemo(() => {
    return menuItems
      .filter((item) => item.isAvailable === true)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [menuItems]);

  // Filtered dishes based on category, search query, and dietary tags
  const filteredDishes = useMemo(() => {
    return availableMenuItems.filter((item) => {
      // 1. Category filter
      if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
        return false;
      }

      // 2. Dietary filter chips
      if (activeFilter === 'veg' && item.foodType !== 'veg') return false;
      if (activeFilter === 'non-veg' && item.foodType !== 'non-veg' && item.foodType !== 'nonveg') return false;
      if (activeFilter === 'recommended' && !item.isRecommended && !item.isChefSpecial) return false;
      if (activeFilter === 'spicy' && (!item.spicyLevel || item.spicyLevel < 1) && !item.isSpicy) return false;

      // 3. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query);
        const catName = categoryMap.get(item.categoryId)?.toLowerCase() || '';
        const catMatch = catName.includes(query);
        const ingredientMatch = item.ingredients?.some((ing) => ing.toLowerCase().includes(query));

        if (!nameMatch && !descMatch && !catMatch && !ingredientMatch) {
          return false;
        }
      }

      return true;
    });
  }, [availableMenuItems, selectedCategoryId, activeFilter, searchQuery, categoryMap]);

  // Calculate available item counts per category
  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableMenuItems.forEach((item) => {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });
    return counts;
  }, [availableMenuItems]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setSelectedCategoryId('all');
  };

  // Close Admin View Handler
  const handleCloseAdmin = () => {
    setIsAdminView(false);
    const targetUrl = `/menu/${restaurantId}`;
    window.history.pushState(null, '', targetUrl);
  };

  // Dedicated Admin view PROTECTED by Firebase Authentication
  if (isAdminView && restaurant) {
    return (
      <>
        <AdminAuthGuard
          restaurant={restaurant}
          categories={categories}
          menuItems={menuItems}
          onClose={handleCloseAdmin}
          onOpenQr={() => setShowQrModal(true)}
        />
        {showQrModal && (
          <TableQrModal
            restaurant={restaurant}
            onClose={() => setShowQrModal(false)}
          />
        )}
      </>
    );
  }

  // Loading Skeleton State
  if (loading && !restaurant) {
    return <LoadingSkeleton />;
  }

  // Error State
  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <EmptyState
          type="error"
          message={error}
          onAction={() => window.location.reload()}
          actionLabel="Refresh Page"
        />
      </div>
    );
  }

  // Restaurant Not Found Fallback
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <EmptyState
          type="not-found"
          onAction={() => {
            setRestaurantId(DEFAULT_RESTAURANT_ID);
          }}
          actionLabel="Load Default Restaurant"
        />
      </div>
    );
  }

  const currency = restaurant.currencySymbol || '₹';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950">
      {/* 1. Clean Customer Header (View-Only, No admin links) */}
      <Navbar
        restaurant={restaurant}
        onScrollToSection={handleScrollToSection}
      />

      {/* 2. Compact Hero Section (Reaches menu fast) */}
      <HeroWelcome
        restaurant={restaurant}
        onExploreMenu={handleScrollToMenu}
      />

      {/* 3. Main Menu Content Area */}
      <main id="menu-section" ref={menuSectionRef} className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 pt-4 pb-10">
        {/* Search Bar & Dietary Filter Chips */}
        <section className="mb-3.5">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            totalCount={availableMenuItems.length}
          />
        </section>

        {/* Horizontally Scrollable Category Navigation */}
        <section className="mb-5 -mx-3 sm:-mx-4">
          <CategoryNav
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            categoryItemCounts={categoryItemCounts}
          />
        </section>

        {/* Food Items Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <section className="space-y-4">
          {filteredDishes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredDishes.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  currencySymbol={currency}
                  onClick={(clickedItem) => setSelectedDish(clickedItem)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type={searchQuery || activeFilter !== 'all' ? 'no-results' : 'empty-category'}
              onAction={handleResetFilters}
            />
          )}
        </section>

        {/* 4. Compact Restaurant Information Section */}
        <RestaurantInfo restaurant={restaurant} />
      </main>

      {/* 5. Simple Professional View-Only Footer */}
      <Footer restaurant={restaurant} />

      {/* Food Details Modal */}
      {selectedDish && (
        <FoodDetailModal
          item={selectedDish}
          currencySymbol={currency}
          categoryName={categoryMap.get(selectedDish.categoryId)}
          onClose={() => setSelectedDish(null)}
        />
      )}

      {/* Universal Table QR Modal */}
      {showQrModal && (
        <TableQrModal
          restaurant={restaurant}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}
