// Environment configuration with automatic dev/prod switching
const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
const isProduction = environment === 'production';

// Helper function to get environment-specific URL
const getEnvUrl = (devKey, prodKey, fallback) => {
  // Get the base key name (without _DEV or _PROD)
  const baseKey = devKey.replace('_DEV', '').replace('_PROD', '');
  
  // Check if explicitly set (manual override) - but only if it's not empty
  const explicit = import.meta.env[baseKey];
  if (explicit && explicit.trim() !== '') {
    return explicit;
  }
  
  // Then check environment-specific URLs based on current environment
  if (isProduction) {
    return import.meta.env[prodKey] || import.meta.env[devKey] || fallback;
  } else {
    return import.meta.env[devKey] || fallback;
  }
};

// Get URLs based on environment
const APP_URL = getEnvUrl('VITE_APP_URL_DEV', 'VITE_APP_URL_PROD', 'https://demo.q8basket.com');
const API_BASE_URL = getEnvUrl('VITE_API_BASE_URL_DEV', 'VITE_API_BASE_URL_PROD', 'https://demo.q8basket.com/api');
const BACKEND_URL = getEnvUrl('VITE_BACKEND_URL_DEV', 'VITE_BACKEND_URL_PROD', 'https://demo.q8basket.com/api');

const config = {
  // App URL (base URL for the app)
  APP_URL: APP_URL,
  
  // API Configuration
  API_BASE_URL: API_BASE_URL,
  
  // Backend URL (for auth endpoints)
  BACKEND_URL: BACKEND_URL,
  
  // External Services
  OPENSTREETMAP_NOMINATIM_URL: import.meta.env.VITE_OPENSTREETMAP_NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
  OPENSTREETMAP_TILES_URL: import.meta.env.VITE_OPENSTREETMAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // CDN URLs
  UNSPLASH_CDN_URL: import.meta.env.VITE_UNSPLASH_CDN_URL || 'https://images.unsplash.com',
  FLATICON_CDN_URL: import.meta.env.VITE_FLATICON_CDN_URL || 'https://cdn-icons-png.flaticon.com',
  
  // Environment
  ENVIRONMENT: environment,
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: !isProduction,
  
  // Auth Configuration
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
  
  // Helper functions
  getApiUrl: (endpoint) => {
    const base = endpoint.startsWith('http') ? '' : config.API_BASE_URL;
    return `${base}${endpoint}`;
  },
  getBackendUrl: (endpoint) => {
    const base = endpoint.startsWith('http') ? '' : config.BACKEND_URL;
    return `${base}${endpoint}`;
  },
  getAppUrl: (path = '') => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${config.APP_URL}${cleanPath}`;
  },
  getNominatimUrl: (endpoint) => `${config.OPENSTREETMAP_NOMINATIM_URL}${endpoint}`,
  getUnsplashUrl: (path) => `${config.UNSPLASH_CDN_URL}${path}`,
  getFlaticonUrl: (path) => `${config.FLATICON_CDN_URL}${path}`,
};


export default config;
