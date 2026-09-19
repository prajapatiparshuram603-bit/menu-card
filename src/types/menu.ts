export type FoodType = 'veg' | 'non-veg' | 'nonveg' | 'egg';

export interface Restaurant {
  id: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  address: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  googleMapsUrl?: string;
  openingHours?: string;
  currencySymbol: string;
  ownerId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  foodType: FoodType;
  isAvailable: boolean;
  isChefSpecial?: boolean;
  isRecommended?: boolean;
  isSpicy?: boolean;
  spicyLevel?: number; // 0: None, 1: Mild, 2: Medium, 3: Hot
  ingredients: string[];
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  name: string;
  role: 'restaurant_admin';
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export type DietaryFilter = 'all' | 'veg' | 'non-veg' | 'recommended' | 'spicy';
