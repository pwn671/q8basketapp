// StatusBar configuration for proper safe area handling
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export const configureStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Set status bar style to light content
    await StatusBar.setStyle({ style: Style.Light });

    // Set background color to transparent
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    // Show the status bar
    await StatusBar.show();
  } catch (error) {
    console.warn('StatusBar configuration failed:', error);
  }
};

// Auto-configure on app start
if (typeof window !== 'undefined') {
  configureStatusBar();
}
