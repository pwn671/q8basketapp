@echo off
REM Android App Setup Script for Q8 Basket PWA (Windows)

echo 🚀 Setting up Q8 Basket Android App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies if not already installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Install Capacitor plugins
echo 📱 Installing Capacitor plugins...
npm install @capacitor/geolocation @capacitor/camera @capacitor/push-notifications @capacitor/preferences @capacitor/network @capacitor/app @capacitor/haptics @capacitor/status-bar

REM Build the PWA
echo 🔨 Building PWA...
npm run build

REM Copy assets to Android
echo 📋 Copying assets to Android...
npx cap copy

REM Sync Android project
echo 🔄 Syncing Android project...
npx cap sync android

echo ✅ Setup complete!
echo.
echo 📱 Next steps:
echo 1. Open Android Studio
echo 2. Open the 'android' folder in this project
echo 3. Build and run the app
echo.
echo 🔧 To open Android Studio:
echo npx cap open android
echo.
echo 📋 Required Android permissions are already configured:
echo - ACCESS_FINE_LOCATION
echo - ACCESS_COARSE_LOCATION
echo - CAMERA
echo - INTERNET
echo - ACCESS_NETWORK_STATE
echo.
echo 🎯 Your Q8 Basket app is ready for Android!
pause
