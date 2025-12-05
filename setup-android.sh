#!/bin/bash
# Android App Setup Script for Q8 Basket PWA

echo "🚀 Setting up Q8 Basket Android App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Capacitor plugins
echo "📱 Installing Capacitor plugins..."
npm install @capacitor/geolocation @capacitor/camera @capacitor/push-notifications @capacitor/preferences @capacitor/network @capacitor/app @capacitor/haptics @capacitor/status-bar

# Build the PWA
echo "🔨 Building PWA..."
npm run build

# Copy assets to Android
echo "📋 Copying assets to Android..."
npx cap copy

# Sync Android project
echo "🔄 Syncing Android project..."
npx cap sync android

echo "✅ Setup complete!"
echo ""
echo "📱 Next steps:"
echo "1. Open Android Studio"
echo "2. Open the 'android' folder in this project"
echo "3. Build and run the app"
echo ""
echo "🔧 To open Android Studio:"
echo "npx cap open android"
echo ""
echo "📋 Required Android permissions are already configured:"
echo "- ACCESS_FINE_LOCATION"
echo "- ACCESS_COARSE_LOCATION" 
echo "- CAMERA"
echo "- INTERNET"
echo "- ACCESS_NETWORK_STATE"
echo ""
echo "🎯 Your Q8 Basket app is ready for Android!"
