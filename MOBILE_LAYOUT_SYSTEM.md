# Q8 Basket - Mobile Layout System

## Overview
This document outlines the standardized mobile layout system used across all pages in the Q8 Basket app. The system ensures consistent sizing, proper safe area support, and responsive design across all mobile devices.

## Layout Pattern

### Standard Container Structure
All pages follow this consistent pattern:

```css
/* Page Wrapper - Full viewport */
.pageWrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
  /* Safe area support */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Page Container - Main content area */
.pageContainer {
  width: 100%;
  max-width: 420px;
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
  box-sizing: border-box;
  border-radius: 20px;
  scrollbar-width: none;
  /* Space for bottom navigation + safe area */
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}
```

## Key Features

### 1. Consistent Sizing
- **Max Width**: 420px (matches home screen)
- **Height**: 100vh (full viewport height)
- **Border Radius**: 20px (rounded corners)
- **Background**: White (#fff)

### 2. Safe Area Support
- **Top Safe Area**: `env(safe-area-inset-top)` for notches/status bars
- **Bottom Safe Area**: `env(safe-area-inset-bottom)` for home indicators
- **Fallback Support**: Graceful degradation for older browsers

### 3. Bottom Navigation Space
- **Fixed Height**: 56px for bottom navigation
- **Padding**: Additional space to prevent content overlap
- **Z-Index**: 100 to ensure proper layering

### 4. Responsive Breakpoints

#### Small Screens (≤480px)
- Remove border radius
- Reduce padding
- Optimize for smaller screens

#### Extra Small Screens (≤360px)
- Further reduce padding
- Adjust font sizes
- Optimize touch targets

#### Ultra Small Screens (≤320px)
- Full width containers
- Minimal padding
- Compact layouts

## Updated Pages

The following pages have been updated with the standardized layout:

### ✅ Completed
- **Home** (`src/pages/Home/Home.module.css`)
- **Product** (`src/pages/Product/Product.module.css`)
- **Category** (`src/pages/Category/Category.module.css`)
- **Cart** (`src/pages/cart/CartPage.module.css`)
- **Profile** (`src/pages/Profile/Profile.module.css`)
- **Search** (`src/pages/Search/SearchPage.module.css`)
- **ProductDetail** (`src/pages/ProductDetail/ProductDetail.module.css`)
- **SignIn** (`src/pages/SignIn/SignIn.module.css`)
- **SignUp** (`src/pages/SignUp/SignUp.module.css`)

### 🔄 Remaining Pages
- AboutUs
- AccountPrivacy
- AddCard
- AddressPicker
- Coupon
- ForgotPassword
- MyAddress
- OTPVerification
- OTPVerificatioReg
- Payment
- SearchLocation
- SplashLogo
- SplashWelcome
- UpdatePassword
- Verified
- YourOrder

## Implementation Guide

### For New Pages
1. Use the standard wrapper/container pattern
2. Add safe area support
3. Include bottom navigation space
4. Test on different screen sizes

### For Existing Pages
1. Update wrapper classes to include safe area padding
2. Add bottom navigation space
3. Ensure max-width is 420px
4. Test responsive behavior

## Browser Support

### Modern Browsers
- Full safe area support
- CSS environment variables
- Responsive design

### Older Browsers
- Fallback padding values
- Graceful degradation
- Basic responsive support

## Testing Checklist

- [ ] Content fits within screen bounds
- [ ] No horizontal scrolling
- [ ] Bottom navigation doesn't overlap content
- [ ] Safe areas work on modern devices
- [ ] Responsive breakpoints function correctly
- [ ] Consistent sizing across all pages
- [ ] Proper touch targets on mobile

## CSS Classes Reference

### Layout Classes
- `.appWrapper` - Full viewport wrapper
- `.appContainer` - Main content container
- `.appHeader` - Page header section
- `.appContent` - Main content area
- `.appMainContent` - Content with sidebar
- `.appSidebar` - Sidebar navigation
- `.bottomNavigation` - Fixed bottom nav

### Responsive Classes
- `@media (max-width: 480px)` - Small screens
- `@media (max-width: 360px)` - Extra small screens
- `@media (max-width: 320px)` - Ultra small screens

## Best Practices

1. **Always use the standard container pattern**
2. **Include safe area support for modern devices**
3. **Test on actual mobile devices**
4. **Ensure content doesn't overflow**
5. **Maintain consistent spacing**
6. **Use proper z-index values**
7. **Include fallbacks for older browsers**

## Future Enhancements

- Dark mode support
- Dynamic safe area adjustments
- Enhanced accessibility features
- Performance optimizations
- Additional responsive breakpoints
