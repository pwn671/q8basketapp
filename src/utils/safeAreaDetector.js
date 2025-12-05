// Dynamic safe area detection for Android apps
export const detectSafeAreas = () => {
  // Check if we're in a Capacitor app
  const isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
  
  if (isCapacitor) {
    // For native apps, we need to detect the actual navigation bar height
    const detectNavigationBarHeight = () => {
      const viewportHeight = window.innerHeight;
      const screenHeight = window.screen.height;
      const navigationBarHeight = screenHeight - viewportHeight;
      
      console.log('Navigation bar height detected:', navigationBarHeight);
      return Math.max(navigationBarHeight, 0);
    };
    
    // Apply dynamic padding
    const applyDynamicPadding = () => {
      const navBarHeight = detectNavigationBarHeight();
      const statusBarHeight = window.screen.height - window.innerHeight - navBarHeight;
      
      // Set CSS custom properties
      document.documentElement.style.setProperty('--dynamic-navbar-height', `${navBarHeight}px`);
      document.documentElement.style.setProperty('--dynamic-statusbar-height', `${statusBarHeight}px`);
      
      // Apply to body
      document.body.style.paddingBottom = `${navBarHeight}px`;
      document.body.style.paddingTop = `${statusBarHeight}px`;
      
      console.log('Dynamic padding applied:', {
        navBarHeight,
        statusBarHeight,
        viewportHeight: window.innerHeight,
        screenHeight: window.screen.height
      });
    };
    
    // Apply on load and resize
    applyDynamicPadding();
    window.addEventListener('resize', applyDynamicPadding);
    window.addEventListener('orientationchange', () => {
      setTimeout(applyDynamicPadding, 100);
    });
    
    return {
      navigationBarHeight: detectNavigationBarHeight(),
      statusBarHeight: window.screen.height - window.innerHeight - detectNavigationBarHeight()
    };
  }
  
  return {
    navigationBarHeight: 0,
    statusBarHeight: 0
  };
};

// Auto-detect on load
if (typeof window !== 'undefined') {
  detectSafeAreas();
}
