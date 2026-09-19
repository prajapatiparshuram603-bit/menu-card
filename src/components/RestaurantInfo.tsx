import React from 'react';
import { Phone, MapPin, Navigation, Clock, Instagram, MessageCircle } from 'lucide-react';
import { Restaurant } from '../types/menu';

interface RestaurantInfoProps {
  restaurant: Restaurant;
}

function getSafeHttpUrl(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function getSafeTelUrl(phone?: string): string | null {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.length >= 7) {
    return `tel:${cleaned}`;
  }
  return null;
}

function getSafeInstagramUrl(instagram?: string): string | null {
  if (!instagram || typeof instagram !== 'string') return null;
  const trimmed = instagram.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const handle = trimmed.replace(/^@/, '');
  if (/^[a-zA-Z0-9._]+$/.test(handle)) {
    return `https://instagram.com/${handle}`;
  }
  return null;
}

export const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurant }) => {
  // Format phone & WhatsApp link safely
  const telUrl = getSafeTelUrl(restaurant.phone);

  const cleanPhone = restaurant.phone?.replace(/[^0-9]/g, '') || '';
  const whatsappDigits = restaurant.whatsapp?.replace(/[^0-9]/g, '') || cleanPhone;
  const whatsappUrl = whatsappDigits.length >= 7
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        `Hello ${restaurant.name}, I am viewing your digital menu at the restaurant.`
      )}`
    : null;

  const mapsUrl = getSafeHttpUrl(restaurant.googleMapsUrl) || (
    restaurant.address
      ? `https://maps.google.com/?q=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}`
      : null
  );

  const instaUrl = getSafeInstagramUrl(restaurant.instagram);

  return (
    <section
      id="restaurant-info-section"
      className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 my-6 border border-stone-800 shadow-xl overflow-hidden relative"
    >
      {/* Subtle gold decorative glow */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Section Title */}
        <div className="border-b border-stone-800 pb-2.5">
          <span className="text-amber-400 text-xs font-bold tracking-widest uppercase block">
            RESTAURANT INFORMATION
          </span>
        </div>

        {/* Location & Dining Hours in compact grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Location / Address */}
          <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider">
                Location
              </p>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {restaurant.address || 'Address provided upon request'}
              </p>
            </div>
          </div>

          {/* Dining Hours */}
          <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider">
                Dining Hours
              </p>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {restaurant.openingHours || 'Daily: 7:00 AM - 11:00 PM'}
              </p>
            </div>
          </div>
        </div>

        {/* Four Compact Action Buttons: Call, Directions, WhatsApp, Instagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* 1. Call */}
          {telUrl ? (
            <a
              href={telUrl}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 hover:border-amber-500/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Call</span>
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900/60 text-stone-600 border border-stone-800/80 text-xs font-medium cursor-not-allowed">
              <Phone className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Call</span>
            </div>
          )}

          {/* 2. Directions */}
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 hover:border-amber-500/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Directions</span>
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900/60 text-stone-600 border border-stone-800/80 text-xs font-medium cursor-not-allowed">
              <Navigation className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Directions</span>
            </div>
          )}

          {/* 3. WhatsApp */}
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 hover:border-emerald-500/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900/60 text-stone-600 border border-stone-800/80 text-xs font-medium cursor-not-allowed">
              <MessageCircle className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>WhatsApp</span>
            </div>
          )}

          {/* 4. Instagram */}
          {instaUrl ? (
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 hover:border-pink-500/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Instagram</span>
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900/60 text-stone-600 border border-stone-800/80 text-xs font-medium cursor-not-allowed">
              <Instagram className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Instagram</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
