# Google OAuth Setup Guide

This guide explains how to configure Google OAuth for both web and Android app.

## Error: "Error 401: invalid_client - no registered origin"

This error occurs when the redirect URI or authorized origins are not properly configured in Google Cloud Console.

## Step 1: Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID (or create a new one)

### For Web Application:

1. Click on your OAuth 2.0 Client ID
2. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (if using different port)
   - `https://your-production-domain.com` (for production)

3. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173/signin` (for development)
   - `http://localhost:5173/signup` (for development)
   - `https://your-production-domain.com/signin` (for production)
   - `https://your-production-domain.com/signup` (for production)

### For Android Application:

1. Create a separate OAuth 2.0 Client ID for Android (or use the same one)
2. Select **Application type**: Android
3. Enter your **Package name**: `com.q8basket.app`
4. Get your **SHA-1 certificate fingerprint**:

   **For Debug Build:**
   ```bash
   keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
   ```

   **For Release Build:**
   ```bash
   keytool -list -v -keystore "path/to/your/release.keystore" -alias your-key-alias
   ```

5. Copy the SHA-1 fingerprint (looks like: `AA:BB:CC:DD:...`)
6. Paste it in the **SHA-1 certificate fingerprint** field
7. Under **Authorized redirect URIs**, add:
   - `com.q8basket.app:/oauth2redirect`

## Step 2: Environment Variables

Make sure your `.env` file contains:

```env
# Web Client ID (for browser/PWA)
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id-here

# Mobile Client ID (for Android/iOS app)
VITE_GOOGLE_CLIENT_ID_MOBILE=your-google-mobile-client-id-here
```

**Important:** 
- For **web**, use the **Web Client ID** in `VITE_GOOGLE_CLIENT_ID`
- For **Android app**, use the **Android Client ID** in `VITE_GOOGLE_CLIENT_ID_MOBILE`
- If `VITE_GOOGLE_CLIENT_ID_MOBILE` is not set, the app will fall back to `VITE_GOOGLE_CLIENT_ID`
- The app automatically detects if it's running on mobile and uses the appropriate client ID

## Step 3: Verify Configuration

### For Web:
1. Make sure your development server is running on the port you configured (e.g., `http://localhost:5173`)
2. The redirect URI should match exactly what you entered in Google Cloud Console

### For Android:
1. Rebuild your Android app after updating `AndroidManifest.xml`
2. Make sure the package name matches: `com.q8basket.app`
3. The SHA-1 fingerprint must match your signing key

## Step 4: Testing

1. **Web**: Test on `http://localhost:5173/signin` or `/signup`
2. **Android**: Build and install the app, then test Google login

## Troubleshooting

### Still getting "invalid_client" error?

1. **Check Client ID**: Make sure `VITE_GOOGLE_CLIENT_ID` in your `.env` file matches the Client ID in Google Cloud Console

2. **Check Redirect URI**: 
   - For web: Must match exactly (including protocol, domain, and path)
   - For Android: Must be exactly `com.q8basket.app:/oauth2redirect`

3. **Check Authorized Origins**:
   - For web: Must include the exact origin (e.g., `http://localhost:5173`)
   - No trailing slashes

4. **Clear Cache**: 
   - Clear browser cache
   - Rebuild Android app

5. **Check Console Logs**: Look for any additional error messages

### Common Issues:

- **"redirect_uri_mismatch"**: The redirect URI in your code doesn't match what's registered in Google Cloud Console
- **"invalid_client"**: The Client ID is incorrect or the origin/redirect URI is not authorized
- **"access_denied"**: User denied permission (not a configuration issue)

## Additional Notes

- The app uses different redirect URIs for web and mobile:
  - **Web**: `window.location.origin + window.location.pathname`
  - **Android**: `com.q8basket.app:/oauth2redirect`

- The Android app has an intent filter in `AndroidManifest.xml` to handle the OAuth redirect

- For production, make sure to:
  1. Create separate OAuth credentials for production
  2. Update environment variables
  3. Add production domains to authorized origins
  4. Use production signing key SHA-1 for Android

