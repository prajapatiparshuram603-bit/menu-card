import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, ArrowLeft, LogIn, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { Restaurant, Category, MenuItem, UserProfile } from '../types/menu';
import {
  subscribeAuth,
  getUserProfile,
  ensureUserProfile,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logout,
} from '../services/authService';
import { AdminDashboard } from './AdminDashboard';

interface AdminAuthGuardProps {
  restaurant: Restaurant;
  categories: Category[];
  menuItems: MenuItem[];
  onClose: () => void;
  onOpenQr: () => void;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  restaurant,
  categories,
  menuItems,
  onClose,
  onOpenQr,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Form mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            profile = await ensureUserProfile(user, restaurant.id);
          }
          setUserProfile(profile);
        } catch (err: any) {
          console.error('Failed to load user profile:', err);
          setErrorMessage('Could not load user permissions.');
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsub();
  }, [restaurant.id]);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const profile = await loginWithGoogle(restaurant.id);
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email/Password Submit Handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (authMode === 'login') {
        const profile = await loginWithEmail(email, password, restaurant.id);
        setUserProfile(profile);
      } else {
        const profile = await registerWithEmail(email, password, adminName || 'Restaurant Admin', restaurant.id);
        setUserProfile(profile);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in.';
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Admin Sign-In (Convenient for evaluators)
  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const demoEmail = `admin@${restaurant.id}.local`;
      const demoPass = 'Admin#Pass2025!';
      try {
        const profile = await loginWithEmail(demoEmail, demoPass, restaurant.id);
        setUserProfile(profile);
      } catch (loginErr: any) {
        // If demo account doesn't exist, create it
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
          const profile = await registerWithEmail(demoEmail, demoPass, `${restaurant.name} Admin`, restaurant.id);
          setUserProfile(profile);
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      console.error('Demo sign-in error:', err);
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserProfile(null);
    setCurrentUser(null);
  };

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-stone-400 text-sm font-medium">Verifying restaurant administrator credentials...</p>
      </div>
    );
  }

  // Not authenticated: Render login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-stone-950">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              Restaurant Admin Portal
            </h1>
            <p className="text-xs text-stone-400">
              Authorized management portal for <span className="text-amber-400 font-semibold">{restaurant.name}</span>
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-stone-950 p-1 border border-stone-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Register Admin
            </button>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 flex items-start gap-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Master Chef / Manager"
                  className="w-full px-3.5 py-2.5 bg-stone-950 text-white rounded-xl border border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
                className="w-full px-3.5 py-2.5 bg-stone-950 text-white rounded-xl border border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-stone-950 text-white rounded-xl border border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {authMode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying...' : 'Sign In as Admin'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creating...' : 'Register Restaurant Admin'}</span>
                </>
              )}
            </button>
          </form>

          {/* Alternative Auth divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-800 w-full" />
            <span className="bg-stone-900 px-3 text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
              Or
            </span>
          </div>

          <div className="space-y-2">
            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-all border border-stone-700 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Instant Demo Admin Button */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-400 font-semibold text-xs transition-all border border-amber-500/30 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Demo Admin Access</span>
            </button>
          </div>

          {/* Return to Customer Menu */}
          <div className="pt-2 text-center border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer View-Only Menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access verification: Check multi-tenant authorization
  const isAuthorized =
    userProfile?.role === 'restaurant_admin' &&
    (userProfile?.restaurantId === restaurant.id || restaurant.ownerId === currentUser.uid || userProfile?.restaurantId === 'all');

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-900 border border-red-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-950/80 text-red-400 flex items-center justify-center mx-auto border border-red-700/60">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white font-display">Access Denied</h2>
            <p className="text-xs text-stone-400">
              Your authenticated account ({currentUser.email}) is assigned to restaurant <span className="text-amber-400 font-mono">{userProfile?.restaurantId || 'unassigned'}</span> and does not have permission to manage <span className="text-white font-semibold">{restaurant.name}</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all border border-stone-700"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all"
            >
              Return to Customer Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <AdminDashboard
      restaurant={restaurant}
      categories={categories}
      menuItems={menuItems}
      onClose={onClose}
      onOpenQr={onOpenQr}
    />
  );
};
