import React from "react";
import {
  defaultProductImage,
  getProductImageSource,
} from "../../utils/productImage";

export default function ProductImage({ src, onError, ...props }) {
  const handleError = (event) => {
    const image = event.currentTarget;

    // Prevent a second failed request from leaving an error handler loop.
    image.onerror = null;
    image.src = defaultProductImage;
    onError?.(event);
  };

  return <img {...props} src={getProductImageSource(src)} onError={handleError} />;
}
