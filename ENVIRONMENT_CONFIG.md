# Environment Configuration Documentation

## Overview
This document describes the environment variable configuration implemented to replace static URLs throughout the React PWA application.

## Files Created/Modified

### 1. Environment Configuration Files
- `env.example` - Template file with all environment variables
- `src/config/env.js` - Centralized configuration module

### 2. Updated Files
The following files have been updated to use environment variables instead of static URLs:

#### Pages:
- `src/pages/Home/Home.jsx`
- `src/pages/Product/Product.jsx`
- `src/pages/SearchLocation/SearchLocationPage.jsx`
- `src/pages/AddressPicker/AddressPickerPage.jsx`
- `src/pages/MyAddress/MyAddressPage.jsx`
- `src/pages/cart/CartPage.jsx`
- `src/pages/Coupon/CouponPage.jsx`
- `src/pages/ProductDetail/ProductDetail.jsx`
- `src/pages/Category/Category.jsx`
- `src/pages/Search/SearchPage.jsx`

#### Components:
- `src/components/sidebar/Sidebar.jsx`

## Environment Variables

### API Configuration
- `VITE_API_BASE_URL` - Base URL for the main API (default: https://demo.q8basket.com/api)

### External Services
- `VITE_OPENSTREETMAP_NOMINATIM_URL` - OpenStreetMap Nominatim API URL
- `VITE_OPENSTREETMAP_TILES_URL` - OpenStreetMap tile server URL

### CDN URLs
- `VITE_UNSPLASH_CDN_URL` - Unsplash CDN URL for images
- `VITE_FLATICON_CDN_URL` - Flaticon CDN URL for icons

### Environment
- `VITE_ENVIRONMENT` - Current environment (development/production)

## Usage

### Setting Up Environment Variables
1. Copy `env.example` to `.env` in the project root
2. Update the values as needed for your environment
3. Restart the development server

### Using Configuration in Code
```javascript
import config from "../../config/env";

// Use API base URL
const BASE_URL = config.API_BASE_URL;

// Use helper functions
const apiUrl = config.getApiUrl("/front/categories");
const nominatimUrl = config.getNominatimUrl("/reverse");
const unsplashUrl = config.getUnsplashUrl("/photo-123");
```

## Benefits

1. **Environment Flexibility**: Easy switching between development, staging, and production environments
2. **Security**: Sensitive URLs can be kept out of version control
3. **Maintainability**: Centralized configuration makes updates easier
4. **Fallback Support**: Default values ensure the app works even without environment variables
5. **Type Safety**: Centralized configuration provides better IDE support

## Migration Summary

### Before:
```javascript
const BASE_URL = "https://demo.q8basket.com/api";
const response = await fetch("https://nominatim.openstreetmap.org/reverse?...");
```

### After:
```javascript
import config from "../../config/env";
const BASE_URL = config.API_BASE_URL;
const response = await fetch(config.getNominatimUrl("/reverse") + "...");
```

## Next Steps

1. Create `.env` file from `env.example`
2. Update environment variables for your specific environment
3. Test the application to ensure all URLs are working correctly
4. Consider adding environment-specific configurations for different deployment stages
