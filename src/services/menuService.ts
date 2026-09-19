import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Restaurant, Category, MenuItem } from '../types/menu';
import {
  DEFAULT_RESTAURANT_ID,
  initialRestaurantData,
  initialCategories,
  initialMenuItemsData,
} from '../data/initialData';
import { handleFirestoreError } from '../lib/firestoreError';

/**
 * Real-time subscription to restaurant profile
 */
export function subscribeRestaurant(
  restaurantId: string,
  onData: (restaurant: Restaurant | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'restaurants', restaurantId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ id: snapshot.id, ...snapshot.data() } as Restaurant);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.error('Firestore restaurant subscription error:', err);
      onError(err);
    }
  );
}

/**
 * Real-time subscription to categories for a restaurant
 */
export function subscribeCategories(
  restaurantId: string,
  onData: (categories: Category[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, 'categories');
  const q = query(colRef, where('restaurantId', '==', restaurantId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Category[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Category);
      });
      items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      onData(items);
    },
    (err) => {
      console.error('Firestore categories subscription error:', err);
      onError(err);
    }
  );
}

/**
 * Real-time subscription to menu items for a restaurant
 * Customers view only isAvailable == true dishes; Admin can view all dishes.
 */
export function subscribeMenuItems(
  restaurantId: string,
  onData: (items: MenuItem[]) => void,
  onError: (error: Error) => void,
  includeUnavailable: boolean = false
): Unsubscribe {
  const colRef = collection(db, 'menuItems');
  const q = includeUnavailable
    ? query(colRef, where('restaurantId', '==', restaurantId))
    : query(colRef, where('restaurantId', '==', restaurantId), where('isAvailable', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as MenuItem);
      });
      items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      onData(items);
    },
    (err) => {
      console.error('Firestore menu items subscription error:', err);
      onError(err);
    }
  );
}

/**
 * Seed initial sample restaurant and menu items into Firestore
 */
export async function seedRestaurantDatabase(restaurantId: string = DEFAULT_RESTAURANT_ID): Promise<void> {
  try {
    // 1. Seed Restaurant document
    const restRef = doc(db, 'restaurants', restaurantId);
    await setDoc(restRef, {
      ...initialRestaurantData,
      id: restaurantId,
      isActive: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 2. Check existing categories
    const catCol = collection(db, 'categories');
    const catQuery = query(catCol, where('restaurantId', '==', restaurantId));
    const catSnap = await getDocs(catQuery);

    const categoryMap: Record<string, string> = {}; // name -> categoryId

    if (catSnap.empty) {
      for (const cat of initialCategories) {
        const docRef = await addDoc(catCol, {
          ...cat,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        categoryMap[cat.name] = docRef.id;
      }
    } else {
      catSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.name) {
          categoryMap[data.name] = docSnap.id;
        }
      });
    }

    // 3. Check existing menu items
    const itemCol = collection(db, 'menuItems');
    const itemQuery = query(itemCol, where('restaurantId', '==', restaurantId));
    const itemSnap = await getDocs(itemQuery);

    if (itemSnap.empty) {
      for (const item of initialMenuItemsData) {
        const categoryId = categoryMap[item.categoryName] || Object.values(categoryMap)[0] || 'default-category';
        const { categoryName, ...restOfItem } = item;
        await addDoc(itemCol, {
          ...restOfItem,
          categoryId,
          restaurantId,
          isChefSpecial: item.isRecommended ?? false,
          isSpicy: (item.spicyLevel ?? 0) > 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.warn('Could not seed restaurant database into Firestore:', error);
  }
}

/**
 * Updates restaurant details in Firestore
 */
export async function updateRestaurant(restaurantId: string, data: Partial<Restaurant>): Promise<void> {
  const docRef = doc(db, 'restaurants', restaurantId);
  try {
    const cleanData: Record<string, any> = {
      ...data,
      name: data.name?.trim().slice(0, 150),
      address: data.address?.trim().slice(0, 300),
      phone: data.phone?.trim().slice(0, 30),
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, { operation: 'update', path: `restaurants/${restaurantId}` });
  }
}

/**
 * Updates a menu item in Firestore (e.g. price, availability)
 */
export async function updateMenuItem(itemId: string, data: Partial<MenuItem>): Promise<void> {
  const docRef = doc(db, 'menuItems', itemId);
  try {
    const cleanData: Record<string, any> = { ...data };
    if (cleanData.name) cleanData.name = cleanData.name.trim().slice(0, 150);
    if (cleanData.description) cleanData.description = cleanData.description.trim().slice(0, 1000);
    if (cleanData.price !== undefined) cleanData.price = Math.max(0, Number(cleanData.price) || 0);
    if (cleanData.spicyLevel !== undefined) cleanData.spicyLevel = Math.max(0, Math.min(3, Number(cleanData.spicyLevel) || 0));
    cleanData.updatedAt = new Date().toISOString();

    await updateDoc(docRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, { operation: 'update', path: `menuItems/${itemId}` });
  }
}

/**
 * Add a new menu item to Firestore
 */
export async function addMenuItem(data: Omit<MenuItem, 'id'>): Promise<string> {
  const colRef = collection(db, 'menuItems');
  try {
    const cleanPayload = {
      ...data,
      name: data.name.trim().slice(0, 150),
      description: (data.description || '').trim().slice(0, 1000),
      price: Math.max(0, Number(data.price) || 0),
      spicyLevel: Math.max(0, Math.min(3, Number(data.spicyLevel) || 0)),
      isChefSpecial: Boolean(data.isChefSpecial),
      isRecommended: Boolean(data.isRecommended),
      isSpicy: Boolean(data.isSpicy),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(colRef, cleanPayload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, { operation: 'create', path: `menuItems` });
    return '';
  }
}

/**
 * Delete a menu item from Firestore
 */
export async function deleteMenuItem(itemId: string): Promise<void> {
  const docRef = doc(db, 'menuItems', itemId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, { operation: 'delete', path: `menuItems/${itemId}` });
  }
}

/**
 * Add a category
 */
export async function addCategory(restaurantId: string, name: string, displayOrder: number): Promise<string> {
  const colRef = collection(db, 'categories');
  try {
    const docRef = await addDoc(colRef, {
      restaurantId: restaurantId.trim(),
      name: name.trim().slice(0, 100),
      displayOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, { operation: 'create', path: `categories` });
    return '';
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const docRef = doc(db, 'categories', categoryId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, { operation: 'delete', path: `categories/${categoryId}` });
  }
}
