import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types/menu';
import { handleFirestoreError } from '../lib/firestoreError';

const googleProvider = new GoogleAuthProvider();

/**
 * Listen to Firebase Auth state changes
 */
export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Fetch trusted user profile from Firestore users/{uid}
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, { operation: 'get', path: `users/${uid}` });
    return null;
  }
}

/**
 * Ensures a user record exists with restaurant_admin role
 */
export async function ensureUserProfile(
  user: User,
  assignedRestaurantId: string
): Promise<UserProfile> {
  const existing = await getUserProfile(user.uid);
  if (existing) {
    return existing;
  }

  const newProfile: UserProfile = {
    id: user.uid,
    email: user.email || 'admin@restaurant.local',
    name: user.displayName || user.email?.split('@')[0] || 'Restaurant Owner',
    role: 'restaurant_admin',
    restaurantId: assignedRestaurantId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, { operation: 'create', path: `users/${user.uid}` });
    return newProfile;
  }
}

/**
 * Sign in using Google Auth
 */
export async function loginWithGoogle(defaultRestaurantId: string): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await ensureUserProfile(result.user, defaultRestaurantId);
}

/**
 * Sign in using Email / Password
 */
export async function loginWithEmail(
  email: string,
  pass: string,
  defaultRestaurantId: string
): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return await ensureUserProfile(result.user, defaultRestaurantId);
}

/**
 * Register a new restaurant admin with Email / Password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  name: string,
  restaurantId: string
): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const profile: UserProfile = {
    id: result.user.uid,
    email: result.user.email || email.trim(),
    name: name.trim() || 'Restaurant Admin',
    role: 'restaurant_admin',
    restaurantId: restaurantId.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = doc(db, 'users', result.user.uid);
  await setDoc(docRef, profile);
  return profile;
}

/**
 * Sign out
 */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}
