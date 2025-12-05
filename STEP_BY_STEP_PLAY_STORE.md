# Step-by-Step: Upload to Play Store

Follow these steps in order to upload your app to the Google Play Store.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Google Play Developer Account ($25 one-time fee)
  - Sign up at: https://play.google.com/console/signup
- [ ] Java JDK 17+ installed
- [ ] Android Studio (optional but recommended)
- [ ] Privacy Policy URL ready (REQUIRED)

---

## STEP 1: Generate Signing Key (One-Time Setup)

### 1.1 Open Terminal/Command Prompt

Navigate to your project root directory.

### 1.2 Generate Keystore

**Windows:**
```bash
generate-keystore.bat
```

**Mac/Linux:**
```bash
chmod +x generate-keystore.sh
./generate-keystore.sh
```

**OR manually:**
```bash
keytool -genkey -v -keystore q8basket-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias q8basket
```

### 1.3 Fill in the Information

When prompted, enter:
- **Keystore password**: (Remember this! You'll need it forever)
- **Key password**: (Can be same as keystore password)
- **Your name**: Your full name
- **Organizational unit**: Your department/team
- **Organization**: Your company name
- **City**: Your city
- **State**: Your state/province
- **Country code**: Two-letter code (e.g., US, IN, GB)

### 1.4 Create keystore.properties File

1. Copy the example file:
   ```bash
   copy android\keystore.properties.example android\keystore.properties
   ```

2. Open `android/keystore.properties` in a text editor

3. Fill in your details:
   ```properties
   storeFile=../q8basket-release-key.jks
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyAlias=q8basket
   keyPassword=YOUR_KEY_PASSWORD
   ```

4. **⚠️ IMPORTANT:** Save this file and BACKUP your keystore file (`q8basket-release-key.jks`) to a secure location!

---

## STEP 2: Update App Version

### 2.1 Open `android/app/build.gradle`

### 2.2 Update Version Information

Find this section:
```gradle
defaultConfig {
    versionCode 1
    versionName "1.0.0"
}
```

- **versionCode**: Must be a number (1, 2, 3, ...). Increment for each release.
- **versionName**: User-facing version (1.0.0, 1.0.1, etc.)

For your first release, keep:
```gradle
versionCode 1
versionName "1.0.0"
```

---

## STEP 3: Build Your App

### 3.1 Build Web App

```bash
npm run build
```

Wait for the build to complete. You should see `dist` folder created.

### 3.2 Sync with Capacitor

```bash
npm run android:sync
```

This copies your web build to the Android project.

### 3.3 Build Release Bundle

**Option A: Using the build script (Recommended)**

**Windows:**
```bash
build-release.bat
```

**Mac/Linux:**
```bash
chmod +x build-release.sh
./build-release.sh
```

**Option B: Manual build**

```bash
cd android
gradlew.bat bundleRelease
```

### 3.4 Locate Your AAB File

Your release bundle will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

**✅ Check:** File size should be reasonable (< 150MB recommended)

---

## STEP 4: Create Google Play Developer Account

### 4.1 Sign Up

1. Go to: https://play.google.com/console/signup
2. Pay the $25 one-time registration fee
3. Complete your developer profile

### 4.2 Verify Your Account

- Complete identity verification
- Add payment information (for paid apps, if applicable)

---

## STEP 5: Create Your App in Play Console

### 5.1 Create New App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"** button
3. Fill in the form:

   **App name:** Q8 Basket (or your preferred name)
   
   **Default language:** English (or your language)
   
   **App or game:** App
   
   **Free or paid:** Select Free or Paid
   
   **Declarations:** 
   - ☑️ This app contains ads (if applicable)
   - ☑️ This app uses App Bundle (required)
   - ☑️ This app uses Google Play's app signing (recommended)

4. Click **"Create app"**

---

## STEP 6: Complete App Information

### 6.1 Go to Store Listing

In the left sidebar, click **"Store listing"**

### 6.2 Fill Required Fields

**App name:**
- Enter: `Q8 Basket` (max 50 characters)

**Short description:**
- Enter a brief description (max 80 characters)
- Example: "Fresh groceries delivered to your doorstep. Shop online with Q8 Basket."

**Full description:**
- Enter detailed description (max 4000 characters)
- Include features, benefits, what your app does
- Use bullet points for readability

**App icon:**
- **Required:** 512x512px PNG
- No transparency
- Upload your app icon

**Feature graphic:**
- **Required:** 1024x500px PNG
- Used on Play Store listing page

**Screenshots:**
- **Required:** At least 2 screenshots
- **Phone:** 16:9 or 9:16 aspect ratio
- Min 320px, max 3840px
- Take screenshots of your actual app

**Category:**
- Select: Shopping / Food & Drink / Lifestyle

**Contact details:**
- **Email:** Your support email
- **Phone:** (Optional)
- **Website:** Your website URL

**Privacy Policy:**
- **⚠️ REQUIRED:** Enter your privacy policy URL
- Must be accessible and complete
- Should cover data collection, usage, third-party services

---

## STEP 7: Upload Your App Bundle

### 7.1 Go to Production

1. In left sidebar, click **"Production"**
2. Click **"Create new release"**

### 7.2 Upload AAB

1. Click **"Upload"** button
2. Select your AAB file: `android/app/build/outputs/bundle/release/app-release.aab`
3. Wait for upload to complete

### 7.3 Add Release Notes

In the "Release notes" section, enter:
```
Initial release of Q8 Basket
- Browse and shop for groceries
- Add items to cart
- Secure checkout
- Track orders
```

### 7.4 Review Release

1. Click **"Review release"**
2. Check that everything looks correct
3. Click **"Start rollout to Production"**

---

## STEP 8: Complete Content Rating

### 8.1 Go to Content Rating

In left sidebar, click **"Content rating"**

### 8.2 Complete Questionnaire

Answer questions about your app:
- Does it contain violence? (Usually: No)
- Does it contain sexual content? (Usually: No)
- Does it contain profanity? (Usually: No)
- Does it contain gambling? (Usually: No)
- Does it contain drugs/alcohol? (Usually: No)
- Does it contain user-generated content? (Usually: No)

### 8.3 Submit for Rating

1. Review your answers
2. Click **"Save questionnaire"**
3. Wait for rating (usually takes a few hours)

---

## STEP 9: Complete App Content

### 9.1 Data Safety

1. Go to **"App content"** → **"Data safety"**
2. Declare what data you collect:
   - Personal info (name, email, phone)
   - Location data
   - Financial info (if you process payments)
3. Explain how you use the data
4. Declare if you share data with third parties

### 9.2 Target Audience

1. Go to **"App content"** → **"Target audience"**
2. Select age groups your app targets
3. Answer questions about content

### 9.3 Ads

1. Go to **"App content"** → **"Ads"**
2. Declare if your app shows ads
3. If yes, specify ad networks

---

## STEP 10: Pricing & Distribution

### 10.1 Set Pricing

1. Go to **"Pricing & distribution"**
2. Select **"Free"** or **"Paid"**
3. If paid, set price

### 10.2 Select Countries

1. Choose countries where your app will be available
2. Select **"All countries"** or specific countries

### 10.3 Device Categories

- ☑️ Phones and tablets
- ☐ TV (if applicable)
- ☐ Wear OS (if applicable)
- ☐ Chrome OS (if applicable)

---

## STEP 11: Review & Submit

### 11.1 Check All Sections

Go through the left sidebar and ensure all sections have green checkmarks:

- [x] Store listing
- [x] Content rating
- [x] App content
- [x] Pricing & distribution
- [x] Production release

### 11.2 Final Checklist

- [ ] All required fields filled
- [ ] Privacy policy URL is accessible
- [ ] Screenshots are current and high-quality
- [ ] App icon meets requirements (512x512, no transparency)
- [ ] Release notes added
- [ ] AAB file uploaded
- [ ] No placeholder text anywhere

### 11.3 Submit for Review

1. Go to **"Production"**
2. Click **"Start rollout to Production"**
3. Confirm submission

---

## STEP 12: Wait for Review

### 12.1 Review Timeline

- **Initial review:** 1-3 days typically
- **Updates:** Usually faster (hours to 1 day)

### 12.2 Check Status

1. Go to Play Console
2. Check **"Production"** section
3. Status will show:
   - **"In review"** - Being reviewed
   - **"Published"** - Live on Play Store! 🎉
   - **"Rejected"** - Check email for reasons

### 12.3 Monitor Email

You'll receive emails about:
- Review status updates
- Approval notifications
- Rejection reasons (if any)

---

## Common Issues & Solutions

### Issue: "Missing Privacy Policy"

**Solution:** 
- Add a privacy policy URL in Store listing
- Make sure it's accessible and complete

### Issue: "App icon doesn't meet requirements"

**Solution:**
- Must be 512x512px PNG
- No transparency
- High quality

### Issue: "Screenshots are too small"

**Solution:**
- Minimum 320px width
- Use 16:9 or 9:16 aspect ratio
- Take actual screenshots from your app

### Issue: "Build failed"

**Solution:**
- Check keystore.properties file exists
- Verify passwords are correct
- Make sure keystore file exists
- Check Java version (need JDK 17+)

---

## After Approval

### ✅ Your App is Live!

1. **Test the download:**
   - Search for your app on Play Store
   - Download and install
   - Test all features

2. **Monitor:**
   - Check crash reports in Play Console
   - Read user reviews
   - Monitor analytics

3. **Update when needed:**
   - Increment `versionCode` in build.gradle
   - Update `versionName`
   - Build new AAB
   - Upload to Play Console

---

## Quick Command Reference

```bash
# Build web app
npm run build

# Sync with Capacitor
npm run android:sync

# Build release bundle
cd android
gradlew.bat bundleRelease

# Or use the build script
build-release.bat
```

---

## Need Help?

- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Capacitor Docs:** https://capacitorjs.com/docs/android
- **Check your guides:**
  - `PLAY_STORE_PUBLISHING_GUIDE.md` - Detailed guide
  - `PLAY_STORE_CHECKLIST.md` - Complete checklist

---

**Good luck with your Play Store launch! 🚀**

