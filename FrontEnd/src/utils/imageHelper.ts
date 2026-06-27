// Seafood-relevant Unsplash image pool for SEAPEDIA products
const SEAFOOD_FALLBACKS = [
  'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&h=600&fit=crop&auto=format', // salmon fillet
  'https://images.unsplash.com/photo-1559737632-154df6a9c2b4?w=600&h=600&fit=crop&auto=format', // shrimp
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop&auto=format', // lobster
  'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=600&h=600&fit=crop&auto=format', // fish market / fish
  'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=600&h=600&fit=crop&auto=format', // raw fish
  'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=600&fit=crop&auto=format', // crab
  'https://images.unsplash.com/photo-1553618551-fba689030290?w=600&h=600&fit=crop&auto=format', // clam shells
  'https://images.unsplash.com/photo-1534177616072-ef7b14649b7b?w=600&h=600&fit=crop&auto=format', // squid
];

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&auto=format';

/**
 * Return a Unsplash seafood image URL. Falls back to the pool if the
 * provided URL is missing/broken (undefined, null, or a bare API path).
 */
export const getProductImage = (url?: string | null, index = 0): string => {
  if (url && !url.includes('undefined') && !url.includes('null') && url.startsWith('http')) {
    return url;
  }
  return SEAFOOD_FALLBACKS[index % SEAFOOD_FALLBACKS.length];
};

export const SEAFOOD_IMAGES = SEAFOOD_FALLBACKS;
export default getProductImage;
