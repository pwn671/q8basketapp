# Play Store Publishing Checklist

Use this checklist to ensure you're ready to publish your app.

## Pre-Build Checklist

- [ ] **Version Information Updated**
  - [ ] `versionCode` incremented in `android/app/build.gradle`
  - [ ] `versionName` updated (e.g., "1.0.0")

- [ ] **Keystore Created**
  - [ ] Run `generate-keystore.bat` (Windows) or `generate-keystore.sh` (Mac/Linux)
  - [ ] Keystore file backed up securely
  - [ ] `keystore.properties` file created from example
  - [ ] Passwords saved securely (password manager)

- [ ] **App Icon Ready**
  - [ ] 512x512px PNG icon (no transparency)
  - [ ] Icon updated in `android/app/src/main/res/mipmap-xxxhdpi/`
  - [ ] Round icon also updated

- [ ] **Testing Complete**
  - [ ] App tested on physical device
  - [ ] All features working correctly
  - [ ] No crashes or critical bugs
  - [ ] Performance is acceptable

## Build Checklist

- [ ] **Web App Built**
  ```bash
  npm run build
  ```

- [ ] **Capacitor Synced**
  ```bash
  npm run android:sync
  ```

- [ ] **Release Bundle Built**
  ```bash
  npm run android:bundle
  # OR use the build script:
  # build-release.bat (Windows) or build-release.sh (Mac/Linux)
  ```

- [ ] **AAB File Located**
  - [ ] File: `android/app/build/outputs/bundle/release/app-release.aab`
  - [ ] File size reasonable (< 150MB recommended)
  - [ ] File backed up

## Play Store Console Checklist

### App Information
- [ ] App name (max 50 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] App icon (512x512px PNG)
- [ ] Feature graphic (1024x500px PNG)
- [ ] Screenshots (at least 2, max 8)
  - [ ] Phone screenshots (16:9 or 9:16)
  - [ ] Tablet screenshots (optional)
- [ ] Category selected
- [ ] Contact email
- [ ] Privacy Policy URL (REQUIRED)

### Content Rating
- [ ] Content rating questionnaire completed
- [ ] Rating received (usually takes a few hours)

### App Content
- [ ] Data safety form completed
- [ ] Target audience specified
- [ ] Ads declaration (if applicable)
- [ ] In-app purchases (if applicable)

### Pricing & Distribution
- [ ] App pricing set (Free/Paid)
- [ ] Countries selected for distribution
- [ ] Age restrictions (if any)

### Store Listing
- [ ] All required fields filled
- [ ] Screenshots uploaded
- [ ] Description proofread
- [ ] No placeholder text

## Upload Checklist

- [ ] **AAB Uploaded**
  - [ ] Latest AAB file uploaded to Play Console
  - [ ] Release notes added
  - [ ] Release reviewed

- [ ] **All Sections Complete**
  - [ ] All sections show green checkmarks
  - [ ] No warnings or errors
  - [ ] All required information provided

## Pre-Submission Checklist

- [ ] **Privacy Policy**
  - [ ] Privacy policy URL accessible
  - [ ] Privacy policy covers all data collection
  - [ ] Third-party services mentioned (Google OAuth, etc.)

- [ ] **Permissions**
  - [ ] Only necessary permissions requested
  - [ ] Permission usage explained in description

- [ ] **Testing**
  - [ ] Internal testing completed (if using)
  - [ ] Closed testing completed (if using)
  - [ ] Open testing completed (if using)

- [ ] **Final Review**
  - [ ] App name is correct
  - [ ] Description is accurate
  - [ ] Screenshots are current
  - [ ] No test data in screenshots
  - [ ] Contact information is correct

## Submission

- [ ] **Ready to Submit**
  - [ ] All checklists completed
  - [ ] App reviewed one final time
  - [ ] Click "Start rollout to Production"

## Post-Submission

- [ ] **Monitor Review**
  - [ ] Check email for updates
  - [ ] Review status in Play Console
  - [ ] Address any rejection issues (if any)

- [ ] **After Approval**
  - [ ] App appears in Play Store
  - [ ] Test download and installation
  - [ ] Monitor crash reports
  - [ ] Monitor user reviews

## Common Issues to Avoid

- [ ] No placeholder text in store listing
- [ ] No test accounts in screenshots
- [ ] Privacy policy is accessible and complete
- [ ] App doesn't crash on launch
- [ ] All features mentioned in description work
- [ ] App icon meets requirements (512x512, no transparency)
- [ ] Screenshots are high quality and current

## Version Update Checklist (For Future Updates)

- [ ] `versionCode` incremented (must be higher)
- [ ] `versionName` updated
- [ ] Release notes prepared
- [ ] New features tested
- [ ] No breaking changes (or clearly documented)
- [ ] AAB built and uploaded
- [ ] Release reviewed and submitted

---

**Remember:** The review process typically takes 1-3 days. Be patient and check your email regularly for updates!

