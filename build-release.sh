#!/bin/bash

# Build script for Play Store release
# This script builds the web app, syncs with Capacitor, and creates a release bundle

set -e  # Exit on error

echo "🚀 Starting Play Store build process..."

# Step 1: Build web app
echo "📦 Building web app..."
npm run build

# Step 2: Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Step 3: Build release bundle
echo "📱 Building Android App Bundle..."
cd android
./gradlew bundleRelease

echo "✅ Build complete!"
echo ""
echo "📦 Your AAB file is located at:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📤 Next steps:"
echo "   1. Go to Google Play Console"
echo "   2. Upload the AAB file"
echo "   3. Complete store listing"
echo "   4. Submit for review"

