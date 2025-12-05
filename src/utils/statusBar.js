// StatusBar configuration for proper safe area handling
import { StatusBar, Style } from '@capacitor/status-bar';

export const configureStatusBar = async () => {
  try {
    // Set status bar style to light content
    await StatusBar.setStyle({ style: Style.Light });
    
    // Set background color to transparent
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
    
    // Show the status bar
    await StatusBar.show();
    
    console.log('StatusBar configured successfully');
  } catch (error) {
    console.log('StatusBar configuration failed (running in browser):', error);
  }
};

// Auto-configure on app start
if (typeof window !== 'undefined') {
  configureStatusBar();
}
