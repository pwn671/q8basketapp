#!/bin/bash

# Script to generate a release keystore for Play Store
# Run this once to create your signing key

echo "🔐 Generating release keystore for Q8 Basket..."
echo ""
echo "You will be prompted for:"
echo "  - Keystore password (remember this!)"
echo "  - Key password (can be same as keystore password)"
echo "  - Your name and organization details"
echo ""
echo "⚠️  IMPORTANT: Keep this keystore file safe!"
echo "   You'll need it for all future app updates."
echo ""

keytool -genkey -v -keystore q8basket-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias q8basket

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generated successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Copy android/keystore.properties.example to android/keystore.properties"
    echo "   2. Fill in your keystore password and key password"
    echo "   3. Make sure keystore.properties is in .gitignore (already done)"
    echo ""
    echo "⚠️  BACKUP THIS KEYSTORE FILE NOW!"
    echo "   If you lose it, you cannot update your app on Play Store!"
else
    echo ""
    echo "❌ Keystore generation failed!"
    exit 1
fi

