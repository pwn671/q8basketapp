// All application API requests are derived from this single environment value.
const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
const isProduction = environment === 'production';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL must be defined in .env');
}

// API_BASE_URL includes `/api`; derive the web-app origin for redirects and assets.
const APP_URL = new URL(API_BASE_URL).origin;
const BACKEND_URL = API_BASE_URL;

const config = {
  // App URL (base URL for the app)
  APP_URL: APP_URL,
  
  // API Configuration
  API_BASE_URL: API_BASE_URL,
  
  // Backend URL (for auth endpoints)
  BACKEND_URL: BACKEND_URL,
  
  // External Services
  OPENSTREETMAP_NOMINATIM_URL: import.meta.env.VITE_OPENSTREETMAP_NOMINATIM_URL,
  OPENSTREETMAP_TILES_URL: import.meta.env.VITE_OPENSTREETMAP_TILES_URL,
  
  // CDN URLs
  UNSPLASH_CDN_URL: import.meta.env.VITE_UNSPLASH_CDN_URL,
  FLATICON_CDN_URL: import.meta.env.VITE_FLATICON_CDN_URL,
  
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
