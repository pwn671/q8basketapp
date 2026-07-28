import defaultProductImage from "../assets/images/default.jpg";

const supportedProtocols = new Set([
  "http:",
  "https:",
  "blob:",
  "data:",
  "file:",
  "capacitor:",
]);

export const getProductImageSource = (source) => {
  if (typeof source !== "string" || !source.trim()) return defaultProductImage;

  try {
    const baseUrl =
      typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const url = new URL(source.trim(), baseUrl);
    return supportedProtocols.has(url.protocol) ? source.trim() : defaultProductImage;
  } catch {
    return defaultProductImage;
  }
};

export { defaultProductImage };
