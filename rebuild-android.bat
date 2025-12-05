@echo off
echo ========================================
echo Rebuilding Android App with Edge-to-Edge Fixes
echo ========================================

echo.
echo Step 1: Building web assets...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Syncing Capacitor with StatusBar plugin...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Opening Android Studio...
call npx cap open android

echo.
echo ========================================
echo Android App Rebuild Complete!
echo ========================================
echo.
echo IMPORTANT: After Android Studio opens:
echo 1. Wait for Gradle sync to complete (may take a few minutes)
echo 2. Build the APK: Build > Build Bundle(s) / APK(s) > Build APK(s)
echo 3. Install the new APK on your device
echo.
echo The new APK will have:
echo - Proper edge-to-edge display support
echo - No overlapping with system navigation bars
echo - Correct safe area handling
echo - Dynamic navigation bar height detection
echo - Aggressive CSS overrides for Android compatibility
echo.
echo If you see any compilation errors, they should now be resolved!
echo.
echo NOTE: This version includes JavaScript-based safe area detection
echo that should work better on Android devices with different navigation bar heights.
pause
