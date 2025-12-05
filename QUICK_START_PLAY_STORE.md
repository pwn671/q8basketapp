# Quick Start: Publish to Play Store

## 🚀 5-Minute Setup

### Step 1: Generate Signing Key (One-time)

**Windows:**
```bash
generate-keystore.bat
```

**Mac/Linux:**
```bash
chmod +x generate-keystore.sh
./generate-keystore.sh
```

**Then:**
1. Copy `android/keystore.properties.example` to `android/keystore.properties`
2. Fill in your passwords

### Step 2: Build Release Bundle

**Windows:**
```bash
build-release.bat
```

**Mac/Linux:**
```bash
chmod +x build-release.sh
./build-release.sh
```

**OR manually:**
```bash
npm run build
npm run android:sync
npm run android:bundle
```

Your AAB file will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

### Step 3: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app (if first time)
3. Go to **Production** → **Create new release**
4. Upload `app-release.aab`
5. Fill in store listing (see checklist)
6. Submit for review

## 📋 What You Need

- [ ] Google Play Developer account ($25)
- [ ] Privacy Policy URL
- [ ] App icon (512x512px)
- [ ] Screenshots (at least 2)
- [ ] App description

## 📚 Full Guides

- **Detailed Guide:** See `PLAY_STORE_PUBLISHING_GUIDE.md`
- **Checklist:** See `PLAY_STORE_CHECKLIST.md`

## ⚠️ Important Notes

1. **Backup your keystore!** If you lose it, you can't update your app.
2. **Privacy Policy is REQUIRED** - You must have a URL.
3. **Version Code** must increase with each update.
4. Review takes 1-3 days typically.

## 🆘 Need Help?

- Check `PLAY_STORE_PUBLISHING_GUIDE.md` for detailed instructions
- Google Play Console Help: https://support.google.com/googleplay/android-developer

---

**Good luck! 🎉**

