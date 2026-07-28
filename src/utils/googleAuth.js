import { Capacitor } from '@capacitor/core';

const getNativeGoogleAuthPlugin = () => {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  const plugin = globalThis?.Capacitor?.Plugins?.GoogleAuth;
  return plugin || null;
};

export const initializeGoogleAuth = async (clientId) => {
  const plugin = getNativeGoogleAuthPlugin();
  if (!plugin || typeof plugin.initialize !== 'function') {
    return null;
  }

  try {
    await plugin.initialize({
      clientId,
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
    return plugin;
  } catch (error) {
    console.warn('GoogleAuth initialization unavailable:', error);
    return null;
  }
};

export const signInWithGoogleAuth = async () => {
  const plugin = getNativeGoogleAuthPlugin();
  if (!plugin || typeof plugin.signIn !== 'function') {
    throw new Error('Google Sign-In is not available on this platform');
  }

  return plugin.signIn();
};
