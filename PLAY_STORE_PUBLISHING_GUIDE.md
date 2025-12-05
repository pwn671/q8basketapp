# Play Store Publishing Guide for Q8 Basket

This guide will help you publish your PWA to the Google Play Store.

## Prerequisites

1. **Google Play Developer Account** ($25 one-time fee)
   - Sign up at: https://play.google.com/console/signup
   
2. **Java Development Kit (JDK)** - Version 17 or higher
   - Download from: https://www.oracle.com/java/technologies/downloads/

3. **Android Studio** (optional but recommended)
   - Download from: https://developer.android.com/studio

## Step 1: Prepare Your App for Production

### 1.1 Update Version Information

Before building, update your app version in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1  // Increment this for each release (1, 2, 3, ...)
    versionName "1.0.0"  // User-facing version (1.0.0, 1.0.1, etc.)
}
```

### 1.2 Build Your Web App

```bash
npm run build
```

This creates the production build in the `dist` folder.

### 1.3 Sync Capacitor

```bash
npx cap sync android
```

This copies your web build to the Android project.

## Step 2: Generate Signing Key

You need a signing key to publish your app. This is a one-time setup.

### Option A: Using Keytool (Command Line)

```bash
keytool -genkey -v -keystore q8basket-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias q8basket
```

**Important:** 
- Store the keystore file securely (you'll need it for all future updates)
- Remember the password and alias name
- Keep a backup of the keystore file

### Option B: Using Android Studio

1. Open Android Studio
2. Build → Generate Signed Bundle / APK
3. Select "Android App Bundle"
4. Create new keystore
5. Fill in the details and save

## Step 3: Configure Signing in build.gradle

Create or update `android/keystore.properties`:

```properties
storeFile=../q8basket-release-key.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=q8basket
keyPassword=YOUR_KEY_PASSWORD
```

**⚠️ IMPORTANT:** Add `keystore.properties` to `.gitignore` to keep your keys secure!

Update `android/app/build.gradle` to include signing config:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing code ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Step 4: Build Release Bundle (AAB)

The Play Store requires an Android App Bundle (AAB), not an APK.

### Using Command Line:

```bash
cd android
./gradlew bundleRelease
```

The AAB file will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

### Using Android Studio:

1. Open the `android` folder in Android Studio
2. Build → Generate Signed Bundle / APK
3. Select "Android App Bundle"
4. Choose your release keystore
5. Select "release" build variant
6. Click "Finish"

## Step 5: Prepare Play Store Assets

### 5.1 App Icon
- **Required:** 512x512px PNG (no transparency)
- Location: `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
- Also update: `ic_launcher_round.png` for round icons

### 5.2 Feature Graphic
- **Required:** 1024x500px PNG
- Used on Play Store listing

### 5.3 Screenshots
- **Required:** At least 2 screenshots
- **Phone:** 16:9 or 9:16 aspect ratio, min 320px, max 3840px
- **Tablet (optional):** 7-inch and 10-inch screenshots

### 5.4 App Description
- **Short description:** 80 characters max
- **Full description:** 4000 characters max

## Step 6: Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - **App name:** Q8 Basket (or your preferred name)
   - **Default language:** English
   - **App or game:** App
   - **Free or paid:** Free/Paid (your choice)
   - **Declarations:** Check all applicable boxes

## Step 7: Upload Your App Bundle

1. In Play Console, go to **Production** → **Create new release**
2. Upload your `app-release.aab` file
3. Add **Release notes** (what's new in this version)
4. Click **Review release**

## Step 8: Complete Store Listing

Fill in all required fields:

- **App name**
- **Short description** (80 chars)
- **Full description**
- **App icon** (512x512)
- **Feature graphic** (1024x500)
- **Screenshots** (at least 2)
- **Category**
- **Contact details**
- **Privacy Policy URL** (required)

## Step 9: Content Rating

1. Complete the content rating questionnaire
2. Answer questions about your app's content
3. Submit for rating (usually takes a few hours)

## Step 10: Privacy Policy

You **must** have a privacy policy URL. It should cover:
- What data you collect
- How you use the data
- Third-party services (Google OAuth, etc.)
- User rights

## Step 11: App Content

Complete all sections:
- **Data safety:** Declare what data you collect
- **Target audience:** Age groups
- **Ads:** Declare if you show ads
- **In-app purchases:** If applicable

## Step 12: Review and Publish

1. Review all sections (green checkmarks)
2. Click **Start rollout to Production**
3. Your app will be reviewed (usually 1-3 days)
4. You'll receive an email when approved/rejected

## Troubleshooting

### Build Errors

**Error: "SDK location not found"**
- Create `android/local.properties`:
  ```
  sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
  ```

**Error: "Gradle sync failed"**
- Update Gradle wrapper: `cd android && ./gradlew wrapper --gradle-version 8.7`

### Common Rejection Reasons

1. **Missing Privacy Policy** - Always required
2. **Incorrect Permissions** - Only request what you need
3. **Poor Screenshots** - Use high-quality, clear images
4. **Incomplete Store Listing** - Fill all required fields
5. **Content Rating Issues** - Be honest in questionnaire

## Version Updates

For future updates:

1. Increment `versionCode` in `build.gradle` (must be higher)
2. Update `versionName` (user-facing version)
3. Build new bundle: `./gradlew bundleRelease`
4. Upload new AAB to Play Console
5. Add release notes
6. Submit for review

## Security Best Practices

1. **Never commit keystore files or passwords to Git**
2. **Backup your keystore** - If lost, you can't update your app
3. **Use environment variables** for sensitive data
4. **Enable ProGuard/R8** for code obfuscation
5. **Keep dependencies updated** for security patches

## Additional Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

## Quick Command Reference

```bash
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Build release bundle
cd android && ./gradlew bundleRelease

# Build debug APK (for testing)
cd android && ./gradlew assembleDebug

# Clean build
cd android && ./gradlew clean
```

---

**Good luck with your Play Store launch! 🚀**

