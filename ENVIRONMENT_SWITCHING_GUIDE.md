# Environment Switching Guide

This guide explains how to easily switch between development and production environments.

## Quick Switch

To switch between environments, simply change one line in your `.env` file:

```env
# For Development
VITE_ENVIRONMENT=development

# For Production
VITE_ENVIRONMENT=production
```

That's it! The app will automatically use the correct URLs.

## Environment Variables

### Development URLs
- `VITE_APP_URL_DEV` - Development app URL (default: https://demo.q8basket.com)
- `VITE_API_BASE_URL_DEV` - Development API URL (default: https://demo.q8basket.com/api)
- `VITE_BACKEND_URL_DEV` - Development backend URL (default: https://demo.q8basket.com/api)

### Production URLs
- `VITE_APP_URL_PROD` - Production app URL (default: https://app.q8basket.com)
- `VITE_API_BASE_URL_PROD` - Production API URL (default: https://app.q8basket.com/api)
- `VITE_BACKEND_URL_PROD` - Production backend URL (default: https://app.q8basket.com/api)

### Manual Override (Optional)
If you need to override the auto-selected URLs, you can set:
- `VITE_APP_URL` - Overrides both dev and prod
- `VITE_API_BASE_URL` - Overrides both dev and prod
- `VITE_BACKEND_URL` - Overrides both dev and prod

## Setup Instructions

### 1. Create `.env` file

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

### 2. Configure URLs

Edit `.env` and set your URLs:

```env
# Switch environment here
VITE_ENVIRONMENT=development

# Development URLs
VITE_APP_URL_DEV=https://demo.q8basket.com
VITE_API_BASE_URL_DEV=https://demo.q8basket.com/api
VITE_BACKEND_URL_DEV=https://demo.q8basket.com/api

# Production URLs
VITE_APP_URL_PROD=https://app.q8basket.com
VITE_API_BASE_URL_PROD=https://app.q8basket.com/api
VITE_BACKEND_URL_PROD=https://app.q8basket.com/api
```

### 3. Restart Dev Server

After changing `.env`, restart your development server:

```bash
npm run dev
```

## Usage in Code

### Basic Usage

```javascript
import config from "../../config/env";

// Get current URLs (automatically selected based on VITE_ENVIRONMENT)
const apiUrl = config.API_BASE_URL;
const backendUrl = config.BACKEND_URL;
const appUrl = config.APP_URL;

// Check environment
if (config.IS_PRODUCTION) {
  console.log('Running in production');
} else {
  console.log('Running in development');
}
```

### Helper Functions

```javascript
import config from "../../config/env";

// Build API URLs
const categoriesUrl = config.getApiUrl("/front/categories");
// Result: https://demo.q8basket.com/api/front/categories (dev)
//      or https://app.q8basket.com/api/front/categories (prod)

// Build backend URLs
const loginUrl = config.getBackendUrl("/auth/login");
// Result: https://demo.q8basket.com/api/auth/login (dev)
//      or https://app.q8basket.com/api/auth/login (prod)

// Build app URLs
const productUrl = config.getAppUrl("/products");
// Result: https://demo.q8basket.com/products (dev)
//      or https://app.q8basket.com/products (prod)
```

## Environment-Specific Builds

### Development Build

```bash
# Set in .env
VITE_ENVIRONMENT=development

# Build
npm run build
```

### Production Build

```bash
# Set in .env
VITE_ENVIRONMENT=production

# Build
npm run build
```

## For CI/CD

You can set environment variables in your CI/CD pipeline:

```yaml
# GitHub Actions example
env:
  VITE_ENVIRONMENT: production
  VITE_APP_URL_PROD: https://app.q8basket.com
  VITE_API_BASE_URL_PROD: https://app.q8basket.com/api
```

```bash
# Command line example
VITE_ENVIRONMENT=production npm run build
```

## Current Configuration

The app will log the current environment in the console (development only):

```
🌍 Environment: development
🔗 App URL: https://demo.q8basket.com
🔗 API URL: https://demo.q8basket.com/api
🔗 Backend URL: https://demo.q8basket.com/api
```

## Troubleshooting

### URLs not switching?

1. **Check `.env` file exists** - Make sure you have a `.env` file (not just `env.example`)
2. **Restart dev server** - Environment variables are loaded at startup
3. **Check variable names** - Must start with `VITE_` to be accessible in Vite
4. **Check spelling** - `VITE_ENVIRONMENT` must be exactly `development` or `production`

### Using wrong URLs?

1. **Check VITE_ENVIRONMENT** - Should be `development` or `production`
2. **Check URL variables** - Make sure `VITE_APP_URL_DEV`, `VITE_APP_URL_PROD`, etc. are set correctly
3. **Check for overrides** - If `VITE_APP_URL` is set, it overrides everything

## Best Practices

1. **Never commit `.env`** - Keep it in `.gitignore`
2. **Use `env.example`** - Document all required variables
3. **One environment per build** - Don't mix dev and prod in the same build
4. **Test both environments** - Verify dev and prod work before deploying

## Example `.env` Files

### Development `.env`
```env
VITE_ENVIRONMENT=development
VITE_APP_URL_DEV=https://demo.q8basket.com
VITE_API_BASE_URL_DEV=https://demo.q8basket.com/api
VITE_BACKEND_URL_DEV=https://demo.q8basket.com/api
```

### Production `.env`
```env
VITE_ENVIRONMENT=production
VITE_APP_URL_PROD=https://app.q8basket.com
VITE_API_BASE_URL_PROD=https://app.q8basket.com/api
VITE_BACKEND_URL_PROD=https://app.q8basket.com/api
```

---

**That's it! Just change `VITE_ENVIRONMENT` to switch between dev and prod! 🚀**

