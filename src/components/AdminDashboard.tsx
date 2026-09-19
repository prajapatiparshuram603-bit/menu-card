import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Eye,
  Utensils,
  FolderTree,
  Store,
  Star,
  Award,
  Flame,
  QrCode,
  LogOut,
  Upload,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Restaurant, Category, MenuItem, FoodType } from '../types/menu';
import {
  updateMenuItem,
  addMenuItem,
  deleteMenuItem,
  updateRestaurant,
  addCategory,
  deleteCategory,
  seedRestaurantDatabase,
} from '../services/menuService';
import { uploadRestaurantImage, StorageCategory } from '../services/storageService';
import { logout } from '../services/authService';
import { VegNonVegBadge } from './VegNonVegBadge';

interface AdminDashboardProps {
  restaurant: Restaurant;
  categories: Category[];
  menuItems: MenuItem[];
  onClose: () => void;
  onOpenQr: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  restaurant,
  categories,
  menuItems,
  onClose,
  onOpenQr,
}) => {
  const [activeTab, setActiveTab] = useState<'dishes' | 'categories' | 'profile'>('dishes');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Dish modal state
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form fields for Add/Edit dish
  const [dishName, setDishName] = useState('');
  const [dishCategoryId, setDishCategoryId] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishImageUrl, setDishImageUrl] = useState('');
  const [dishFoodType, setDishFoodType] = useState<FoodType>('veg');
  const [dishSpicyLevel, setDishSpicyLevel] = useState<number>(0);
  const [dishIngredients, setDishIngredients] = useState<string>('');
  const [dishIsChefSpecial, setDishIsChefSpecial] = useState<boolean>(false);
  const [dishIsRecommended, setDishIsRecommended] = useState<boolean>(false);
  const [dishIsSpicy, setDishIsSpicy] = useState<boolean>(false);
  const [dishIsAvailable, setDishIsAvailable] = useState<boolean>(true);
  const [dishFormError, setDishFormError] = useState<string | null>(null);

  // File upload state for dish modal
  const [isUploadingDishImage, setIsUploadingDishImage] = useState(false);
  const dishFileInputRef = useRef<HTMLInputElement>(null);

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Restaurant profile form state
  const [profileForm, setProfileForm] = useState<Restaurant>({ ...restaurant });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);
  const [isUploadingProfileLogo, setIsUploadingProfileLogo] = useState(false);
  const [isUploadingProfileCover, setIsUploadingProfileCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Reseed state
  const [isReseeding, setIsReseeding] = useState(false);

  // Open modal for add
  const handleOpenAddDish = () => {
    setEditingItem(null);
    setDishName('');
    setDishCategoryId(categories[0]?.id || '');
    setDishPrice('');
    setDishDescription('');
    setDishImageUrl('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80');
    setDishFoodType('veg');
    setDishSpicyLevel(1);
    setDishIngredients('Fresh cottage cheese, Chef secret spices');
    setDishIsChefSpecial(false);
    setDishIsRecommended(false);
    setDishIsSpicy(false);
    setDishIsAvailable(true);
    setDishFormError(null);
    setShowDishModal(true);
  };

  // Open modal for edit
  const handleOpenEditDish = (item: MenuItem) => {
    setEditingItem(item);
    setDishName(item.name);
    setDishCategoryId(item.categoryId);
    setDishPrice(item.price.toString());
    setDishDescription(item.description || '');
    setDishImageUrl(item.imageUrl || '');
    setDishFoodType(item.foodType);
    setDishSpicyLevel(item.spicyLevel || 0);
    setDishIngredients((item.ingredients || []).join(', '));
    setDishIsChefSpecial(Boolean(item.isChefSpecial));
    setDishIsRecommended(Boolean(item.isRecommended));
    setDishIsSpicy(Boolean(item.isSpicy || (item.spicyLevel && item.spicyLevel > 0)));
    setDishIsAvailable(item.isAvailable);
    setDishFormError(null);
    setShowDishModal(true);
  };

  // Upload image to Firebase Storage for Dish
  const handleDishImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDishImage(true);
    setDishFormError(null);
    try {
      const result = await uploadRestaurantImage(restaurant.id, 'menu', file);
      setDishImageUrl(result.url);
    } catch (err: any) {
      console.error('Dish image upload error:', err);
      setDishFormError(err.message || 'Image upload failed.');
    } finally {
      setIsUploadingDishImage(false);
    }
  };

  // Upload logo or cover for Restaurant Profile
  const handleProfileImageUpload = async (category: StorageCategory, file: File) => {
    if (category === 'logo') setIsUploadingProfileLogo(true);
    if (category === 'cover') setIsUploadingProfileCover(true);

    try {
      const result = await uploadRestaurantImage(restaurant.id, category, file);
      if (category === 'logo') {
        setProfileForm((prev) => ({ ...prev, logoUrl: result.url }));
      } else {
        setProfileForm((prev) => ({ ...prev, coverImageUrl: result.url }));
      }
    } catch (err: any) {
      console.error('Profile image upload failed:', err);
      alert(err.message || 'Image upload failed. Must be JPG, PNG, or WebP under 5MB.');
    } finally {
      if (category === 'logo') setIsUploadingProfileLogo(false);
      if (category === 'cover') setIsUploadingProfileCover(false);
    }
  };

  // Save dish (Add or Update in Firestore)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) {
      setDishFormError('Dish name is required.');
      return;
    }
    const numPrice = Number(dishPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      setDishFormError('Price must be a positive number.');
      return;
    }

    setSavingId('dish-modal');
    try {
      const parsedIngredients = dishIngredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const dishPayload = {
        restaurantId: restaurant.id,
        categoryId: dishCategoryId || categories[0]?.id || 'default',
        name: dishName.trim(),
        description: dishDescription.trim(),
        price: numPrice,
        imageUrl: dishImageUrl.trim(),
        foodType: dishFoodType,
        spicyLevel: Number(dishSpicyLevel) || 0,
        ingredients: parsedIngredients,
        isChefSpecial: dishIsChefSpecial,
        isRecommended: dishIsRecommended,
        isSpicy: dishIsSpicy || Number(dishSpicyLevel) > 0,
        isAvailable: dishIsAvailable,
        displayOrder: editingItem ? editingItem.displayOrder : menuItems.length + 1,
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, dishPayload);
      } else {
        await addMenuItem(dishPayload);
      }
      setShowDishModal(false);
    } catch (err) {
      console.error('Failed to save menu item:', err);
      setDishFormError('Could not save dish to Firebase. Permission denied or network issue.');
    } finally {
      setSavingId(null);
    }
  };

  // Quick Inline Price Update
  const handleStartEditPrice = (item: MenuItem) => {
    setEditingPriceId(item.id);
    setPriceInput(item.price.toString());
  };

  const handleSavePrice = async (itemId: string) => {
    const numPrice = Number(priceInput);
    if (isNaN(numPrice) || numPrice < 0) {
      setEditingPriceId(null);
      return;
    }
    setSavingId(itemId);
    try {
      await updateMenuItem(itemId, { price: numPrice });
      setEditingPriceId(null);
    } catch (err) {
      console.error('Failed to update price:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Quick Availability Toggle
  const handleToggleAvailability = async (item: MenuItem) => {
    setSavingId(item.id);
    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Delete Dish
  const handleDeleteDish = async (itemId: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}" from the menu?`)) {
      setSavingId(itemId);
      try {
        await deleteMenuItem(itemId);
      } catch (err) {
        console.error('Failed to delete item:', err);
      } finally {
        setSavingId(null);
      }
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmittingCat(true);
    try {
      await addCategory(restaurant.id, newCatName.trim(), categories.length + 1);
      setNewCatName('');
    } catch (err) {
      console.error('Failed to add category:', err);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string, name: string) => {
    if (confirm(`Delete category "${name}"? Existing items in this category will need reassignment.`)) {
      try {
        await deleteCategory(catId);
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
    }
  };

  // Save Restaurant Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateRestaurant(restaurant.id, profileForm);
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to update restaurant:', err);
      alert('Error updating restaurant details in Firestore.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Reseed Sample Menu
  const handleReseed = async () => {
    if (
      confirm(
        'This will re-populate default dishes and categories in Firebase Firestore for demo purposes. Proceed?'
      )
    ) {
      setIsReseeding(true);
      try {
        await seedRestaurantDatabase(restaurant.id);
        alert('Database populated successfully with live dishes and categories!');
      } catch (err) {
        console.error('Reseed error:', err);
      } finally {
        setIsReseeding(false);
      }
    }
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Uncategorized';
  };

  const handleSignOut = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-20 selection:bg-amber-500 selection:text-stone-950">
      {/* Top Banner */}
      <div className="bg-stone-900 border-b border-stone-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Admin Portal</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400 font-mono text-[11px]">ID: {restaurant.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
              {restaurant.name}
            </h1>
            <p className="text-xs text-stone-400">
              Live Firestore real-time menu management. Changes reflect immediately on customer table QR scans.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenQr}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl text-xs font-semibold border border-stone-700 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Table QR</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View Menu</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800/80 hover:bg-red-950/60 hover:text-red-300 text-stone-400 rounded-xl text-xs font-medium border border-stone-700 transition-all cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 border-t border-stone-800/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('dishes')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'dishes'
                ? 'border-amber-500 text-amber-400 bg-stone-800/60'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Dishes ({menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'border-amber-500 text-amber-400 bg-stone-800/60'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-400 bg-stone-800/60'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Restaurant Profile</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* TAB 1: DISHES */}
        {activeTab === 'dishes' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
              <div>
                <h2 className="text-base font-bold text-white font-display">
                  Live Menu Dishes ({menuItems.length})
                </h2>
                <p className="text-xs text-stone-400">
                  Update prices directly, toggle customer availability, or add signature delicacies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReseed}
                  disabled={isReseeding}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 transition-colors cursor-pointer"
                  title="Re-populate authentic Indian menu items"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
                  <span>{isReseeding ? 'Seeding...' : 'Reset Sample Menu'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddDish}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Dishes Table */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/70 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Dish</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Badges</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3 text-center">Available</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {menuItems.map((item) => {
                      const isEditingPrice = editingPriceId === item.id;
                      const isSaving = savingId === item.id;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-stone-800/50 transition-colors ${
                            !item.isAvailable ? 'bg-stone-950/40 opacity-60' : ''
                          }`}
                        >
                          {/* Dish info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-11 h-11 rounded-lg object-cover bg-stone-950 shrink-0 border border-stone-800"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="min-w-0 max-w-[200px]">
                                <p className="font-bold text-stone-100 text-sm truncate flex items-center gap-1.5">
                                  <span>{item.name}</span>
                                </p>
                                <p className="text-[11px] text-stone-400 line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-stone-950 text-stone-300 text-[11px] font-medium border border-stone-800">
                              {getCategoryName(item.categoryId)}
                            </span>
                          </td>

                          {/* Food Type */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <VegNonVegBadge type={item.foodType} size="sm" showLabel={true} />
                          </td>

                          {/* Badges Column */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {item.isChefSpecial && (
                                <span className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30" title="Chef's Special">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                </span>
                              )}
                              {item.isRecommended && (
                                <span className="p-1 rounded bg-amber-600/20 text-amber-300 border border-amber-600/30" title="Recommended">
                                  <Award className="w-3 h-3" />
                                </span>
                              )}
                              {(item.isSpicy || (item.spicyLevel && item.spicyLevel > 0)) && (
                                <span className="p-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30" title={`Spicy (${item.spicyLevel})`}>
                                  <Flame className="w-3 h-3 fill-orange-400" />
                                </span>
                              )}
                              {!item.isChefSpecial && !item.isRecommended && !item.isSpicy && (!item.spicyLevel || item.spicyLevel === 0) && (
                                <span className="text-[10px] text-stone-600">—</span>
                              )}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isEditingPrice ? (
                              <div className="flex items-center gap-1">
                                <span className="text-amber-400 font-bold">
                                  {restaurant.currencySymbol}
                                </span>
                                <input
                                  type="number"
                                  value={priceInput}
                                  onChange={(e) => setPriceInput(e.target.value)}
                                  className="w-16 px-1.5 py-1 text-xs font-bold border border-amber-500 rounded bg-stone-950 text-white"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSavePrice(item.id);
                                    if (e.key === 'Escape') setEditingPriceId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(item.id)}
                                  disabled={isSaving}
                                  className="p-1 text-emerald-400 hover:bg-emerald-950/40 rounded cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPriceId(null)}
                                  className="p-1 text-stone-400 hover:bg-stone-800 rounded cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditPrice(item)}
                                className="group flex items-center gap-1.5 hover:bg-stone-800 px-2 py-1 rounded-md transition-colors font-bold text-amber-400 text-sm cursor-pointer"
                                title="Click to quickly change price"
                              >
                                <span>
                                  {restaurant.currencySymbol}
                                  {item.price}
                                </span>
                                <Edit2 className="w-3 h-3 text-stone-500 group-hover:text-amber-400 transition-colors" />
                              </button>
                            )}
                          </td>

                          {/* Availability Switch */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(item)}
                              disabled={isSaving}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                item.isAvailable ? 'bg-emerald-600' : 'bg-stone-800'
                              }`}
                              title={
                                item.isAvailable
                                  ? 'Active on customer menu (Click to hide)'
                                  : 'Hidden from customer menu (Click to show)'
                              }
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  item.isAvailable ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="block text-[10px] text-stone-400 mt-0.5">
                              {item.isAvailable ? 'Active' : 'Hidden'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditDish(item)}
                                className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit Dish details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDish(item.id, item.name)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Delete Dish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Add Category Form */}
            <form
              onSubmit={handleAddCategory}
              className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-md space-y-3"
            >
              <h2 className="font-display text-base font-bold text-white">
                Create New Menu Category
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Clay Oven Tandoori, Mocktails, Soups..."
                  className="flex-1 px-3 py-2 text-sm bg-stone-950 border border-stone-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:outline-none text-white"
                />
                <button
                  type="submit"
                  disabled={isSubmittingCat || !newCatName.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Add Category
                </button>
              </div>
            </form>

            {/* Category List */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-md divide-y divide-stone-800 overflow-hidden">
              <div className="p-4 bg-stone-950/80 font-semibold text-xs text-stone-400 uppercase tracking-wider">
                Current Categories ({categories.length})
              </div>
              {categories.map((cat, idx) => {
                const itemCount = menuItems.filter((i) => i.categoryId === cat.id).length;
                return (
                  <div key={cat.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-stone-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-stone-100 text-sm">{cat.name}</p>
                        <p className="text-xs text-stone-400">{itemCount} dishes assigned</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RESTAURANT PROFILE */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-md space-y-6 max-w-3xl mx-auto"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                Restaurant Brand & Contact Information
              </h2>
              <p className="text-xs text-stone-400">
                Controls the welcome hero, logo, contact buttons (Call, WhatsApp, Maps), and hours.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3.5 bg-emerald-950/80 text-emerald-200 text-xs font-semibold rounded-xl border border-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                Restaurant profile updated successfully in Firestore!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-stone-300">Restaurant Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm font-semibold text-white focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-stone-300">Tagline / Slogan</label>
                <input
                  type="text"
                  value={profileForm.tagline || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-1">
                <label className="font-bold text-stone-300">Logo Image (Storage / URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileForm.logoUrl || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white"
                    placeholder="https://... or upload"
                  />
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProfileImageUpload('logo', file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingProfileLogo}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1 cursor-pointer"
                  >
                    {isUploadingProfileLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1">
                <label className="font-bold text-stone-300">Cover Banner (Storage / URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileForm.coverImageUrl || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, coverImageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white"
                    placeholder="https://... or upload"
                  />
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProfileImageUpload('cover', file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingProfileCover}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1 cursor-pointer"
                  >
                    {isUploadingProfileCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-stone-300">Short Description</label>
                <textarea
                  rows={2}
                  value={profileForm.description || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300">Phone (for dialer)</label>
                <input
                  type="text"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300">WhatsApp Number</label>
                <input
                  type="text"
                  value={profileForm.whatsapp || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-stone-300">Address</label>
                <input
                  type="text"
                  value={profileForm.address || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300">Dining Hours</label>
                <input
                  type="text"
                  value={profileForm.openingHours || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, openingHours: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300">Currency Symbol</label>
                <input
                  type="text"
                  value={profileForm.currencySymbol || '₹'}
                  onChange={(e) => setProfileForm({ ...profileForm, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-stone-300">Google Maps URL</label>
                <input
                  type="text"
                  value={profileForm.googleMapsUrl || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, googleMapsUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-stone-300">Instagram URL or Handle</label>
                <input
                  type="text"
                  value={profileForm.instagram || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* DISH ADD/EDIT MODAL */}
      {showDishModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-stone-900 text-stone-100 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 my-8">
            <div className="flex items-center justify-between p-5 border-b border-stone-800">
              <h3 className="font-display font-bold text-lg text-white">
                {editingItem ? 'Edit Dish Delicacy' : 'Add New Menu Item'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDishModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dishFormError && (
              <div className="mx-5 mt-4 p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{dishFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDish} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-300">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Tandoori Butter Roti"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Category *</label>
                  <select
                    value={dishCategoryId}
                    onChange={(e) => setDishCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">
                    Price ({restaurant.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              {/* Image Upload with Firebase Storage */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-300">Dish Photography (Storage or URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dishImageUrl}
                    onChange={(e) => setDishImageUrl(e.target.value)}
                    placeholder="https://... or upload from device"
                    className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white"
                  />
                  <input
                    ref={dishFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleDishImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => dishFileInputRef.current?.click()}
                    disabled={isUploadingDishImage}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {isUploadingDishImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Food Type & Spice Level */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Dietary Classification</label>
                  <select
                    value={dishFoodType}
                    onChange={(e) => setDishFoodType(e.target.value as FoodType)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white"
                  >
                    <option value="veg">🟢 Pure Veg</option>
                    <option value="non-veg">🔴 Non-Veg</option>
                    <option value="egg">🟡 Contains Egg</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Spicy Level (0 - 3)</label>
                  <select
                    value={dishSpicyLevel}
                    onChange={(e) => setDishSpicyLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white"
                  >
                    <option value={0}>Not Spicy (0)</option>
                    <option value={1}>Mild (1 flame)</option>
                    <option value={2}>Medium (2 flames)</option>
                    <option value={3}>Hot & Fiery (3 flames)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-300">Short Description</label>
                <textarea
                  rows={2}
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="Appetizing description for guests..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-300">Ingredients (comma separated)</label>
                <input
                  type="text"
                  value={dishIngredients}
                  onChange={(e) => setDishIngredients(e.target.value)}
                  placeholder="e.g. Paneer, Butter, Kasuri Methi, Cashews"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white"
                />
              </div>

              {/* Badges and Availability toggles */}
              <div className="pt-2 border-t border-stone-800 space-y-2">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={dishIsChefSpecial}
                      onChange={(e) => setDishIsChefSpecial(e.target.checked)}
                      className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Chef's Special Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={dishIsRecommended}
                      onChange={(e) => setDishIsRecommended(e.target.checked)}
                      className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Recommended Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={dishIsSpicy}
                      onChange={(e) => setDishIsSpicy(e.target.checked)}
                      className="rounded border-stone-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Spicy Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={dishIsAvailable}
                      onChange={(e) => setDishIsAvailable(e.target.checked)}
                      className="rounded border-stone-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Active on Menu</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowDishModal(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingId === 'dish-modal'}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  {savingId === 'dish-modal' ? 'Saving...' : editingItem ? 'Save Updates' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
