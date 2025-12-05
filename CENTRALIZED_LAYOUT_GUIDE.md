# Centralized Layout System - Implementation Guide

## Overview
The Q8 Basket app now uses a centralized layout system where common screen structures are defined in `src/styles/Layout.module.css` and individual pages only contain their specific styling (images, colors, content-specific styles).

## Updated Pages ✅
- **Home** - Uses `appWrapper` and `appContainer` from centralized layout
- **Product** - Uses `appWrapper` and `appContainer` from centralized layout  
- **SignIn** - Uses `formContainer` and `formCard` from centralized layout

## Remaining Pages to Update 🔄

### 1. Authentication Pages
- **SignUp** (`src/pages/SignUp/SignUp.jsx`)
- **ForgotPassword** (`src/pages/ForgotPassword/ForgotPassword.jsx`)
- **OTPVerification** (`src/pages/OTPVerification/OTPVerification.jsx`)
- **OTPVerificatioReg** (`src/pages/OTPVerificatioReg/OTPVerificationReg.jsx`)
- **UpdatePassword** (`src/pages/UpdatePassword/UpdatePassword.jsx`)
- **Verified** (`src/pages/Verified/Verified.jsx`)

### 2. Main Navigation Pages
- **Category** (`src/pages/Category/Category.jsx`)
- **Cart** (`src/pages/cart/CartPage.jsx`)
- **Profile** (`src/pages/Profile/Profile.jsx`)
- **Search** (`src/pages/Search/SearchPage.jsx`)
- **ProductDetail** (`src/pages/ProductDetail/ProductDetail.jsx`)

### 3. Utility Pages
- **AboutUs** (`src/pages/AboutUs/AboutUsPage.jsx`)
- **AccountPrivacy** (`src/pages/AccountPrivacy/AccountPrivacyPage.jsx`)
- **AddCard** (`src/pages/AddCard/AddCardPage.jsx`)
- **AddressPicker** (`src/pages/AddressPicker/AddressPickerPage.jsx`)
- **Coupon** (`src/pages/Coupon/CouponPage.jsx`)
- **MyAddress** (`src/pages/MyAddress/MyAddressPage.jsx`)
- **Payment** (`src/pages/Payment/PaymentPage.jsx`)
- **SearchLocation** (`src/pages/SearchLocation/SearchLocationPage.jsx`)
- **YourOrder** (`src/pages/YourOrder/YourOrderPage.jsx`)

### 4. Splash Pages
- **SplashLogo** (`src/pages/SplashLogo/SplashLogo.jsx`)
- **SplashWelcome** (`src/pages/SplashWelcome/SplashWelcome.jsx`)

## Implementation Steps

### Step 1: Import Layout Styles
Add this import to each page's JSX file:
```javascript
import layoutStyles from '../../styles/Layout.module.css';
```

### Step 2: Update JSX Structure

#### For Main Pages (Home, Product, Category, etc.)
Replace:
```javascript
<div className={styles.pageWrapper}>
  <div className={styles.pageContainer}>
```

With:
```javascript
<div className={layoutStyles.appWrapper}>
  <div className={layoutStyles.appContainer}>
```

#### For Authentication Pages (SignIn, SignUp, etc.)
Replace:
```javascript
<div className={styles.root}>
  <form className={styles.card}>
```

With:
```javascript
<div className={layoutStyles.formContainer}>
  <form className={layoutStyles.formCard}>
```

### Step 3: Update CSS Files
Remove all common layout styles from individual CSS files and keep only:
- Page-specific colors
- Page-specific images
- Page-specific content styling
- Unique animations or effects

### Step 4: Use Centralized Classes
Replace individual classes with centralized ones:

| Old Class | New Centralized Class |
|-----------|----------------------|
| `.pageWrapper` | `.appWrapper` |
| `.pageContainer` | `.appContainer` |
| `.homeWrapper` | `.appWrapper` |
| `.homeContainer` | `.appContainer` |
| `.searchWrapper` | `.appWrapper` |
| `.searchContainer` | `.appContainer` |
| `.root` (forms) | `.formContainer` |
| `.card` (forms) | `.formCard` |
| `.heading` (forms) | `.formHeading` |
| `.subheading` (forms) | `.formSubheading` |

## Available Centralized Classes

### Layout Structure
- `.appWrapper` - Full viewport wrapper
- `.appContainer` - Main content container
- `.appHeader` - Standard header
- `.appContent` - Main content area
- `.appContentWithSidebar` - Content with sidebar
- `.appSidebar` - Sidebar navigation
- `.bottomNavigation` - Fixed bottom nav

### Form Layouts
- `.formContainer` - Form page wrapper
- `.formCard` - Form card container
- `.formHeading` - Form title
- `.formSubheading` - Form subtitle

### Input Styles
- `.formLabel` - Form labels
- `.inputWrapper` - Input container
- `.inputField` - Input field
- `.inputIcon` - Input icons
- `.togglePassword` - Password toggle

### Button Styles
- `.primaryButton` - Primary action button
- `.socialButton` - Social login button
- `.socialIcon` - Social icons

### Grid Layouts
- `.productGrid` - Product grid
- `.categoryGrid` - Category grid
- `.searchGrid` - Search results grid

### Card Styles
- `.productCard` - Product card
- `.categoryCard` - Category card

## Benefits

1. **Consistency** - All pages use the same layout structure
2. **Maintainability** - Changes to layout only need to be made in one place
3. **Smaller Files** - Individual CSS files are much smaller
4. **Better Organization** - Clear separation between layout and content styles
5. **Responsive Design** - Centralized responsive breakpoints
6. **Safe Area Support** - Consistent safe area handling across all pages

## Example: Complete Page Update

### Before (SignIn.jsx):
```javascript
import styles from './SignIn.module.css';

return (
  <div className={styles.root}>
    <form className={styles.card}>
      <h1 className={styles.heading}>Hello Again!</h1>
      <label className={styles.label}>Email</label>
      <div className={styles.inputWrapper}>
        <input className={styles.inputField} />
      </div>
      <button className={styles.signInButton}>Sign In</button>
    </form>
  </div>
);
```

### After (SignIn.jsx):
```javascript
import styles from './SignIn.module.css';
import layoutStyles from '../../styles/Layout.module.css';

return (
  <div className={layoutStyles.formContainer}>
    <form className={layoutStyles.formCard}>
      <h1 className={layoutStyles.formHeading}>Hello Again!</h1>
      <label className={layoutStyles.formLabel}>Email</label>
      <div className={layoutStyles.inputWrapper}>
        <input className={layoutStyles.inputField} />
      </div>
      <button className={layoutStyles.primaryButton}>Sign In</button>
    </form>
  </div>
);
```

### Before (SignIn.module.css):
```css
.root {
  height: 100vh;
  width: 100vw;
  /* ... many layout properties ... */
}

.card {
  /* ... many layout properties ... */
}

.heading {
  /* ... many layout properties ... */
}
```

### After (SignIn.module.css):
```css
/* Only page-specific styles */
.subheading {
  color: #3a3a3acc;
  font-weight: 400;
  font-size: 1rem;
  margin-bottom: 10px;
}

/* Page-specific button styles if needed */
.signInButton {
  /* Only if different from primaryButton */
}
```

## Testing Checklist

After updating each page:
- [ ] Page loads correctly
- [ ] Layout is consistent with other pages
- [ ] Safe area support works
- [ ] Responsive design works
- [ ] No horizontal scrolling
- [ ] Bottom navigation doesn't overlap content
- [ ] Page-specific styling is preserved
- [ ] No broken styles or missing elements

## Next Steps

1. Update remaining pages following this guide
2. Test all pages for consistency
3. Remove any unused CSS from individual files
4. Update documentation with new structure
5. Consider creating additional centralized components for common UI elements
