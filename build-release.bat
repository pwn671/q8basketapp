@echo off
REM Build script for Play Store release (Windows)
REM This script builds the web app, syncs with Capacitor, and creates a release bundle

echo 🚀 Starting Play Store build process...

REM Step 1: Build web app
echo 📦 Building web app...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    exit /b 1
)

REM Step 2: Sync with Capacitor
echo 🔄 Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ❌ Sync failed!
    exit /b 1
)

REM Step 3: Build release bundle
echo 📱 Building Android App Bundle...
cd android
call gradlew.bat bundleRelease
if errorlevel 1 (
    echo ❌ Bundle build failed!
    cd ..
    exit /b 1
)
cd ..

echo.
echo ✅ Build complete!
echo.
echo 📦 Your AAB file is located at:
echo    android\app\build\outputs\bundle\release\app-release.aab
echo.
echo 📤 Next steps:
echo    1. Go to Google Play Console
echo    2. Upload the AAB file
echo    3. Complete store listing
echo    4. Submit for review

pause

