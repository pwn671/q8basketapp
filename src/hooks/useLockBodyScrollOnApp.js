import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function useLockBodyScrollOnApp() {
  useEffect(() => {
    const isMobileApp = Capacitor.isNativePlatform();

    if (isMobileApp) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyHeight = document.body.style.height;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.height = "100%";
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.height = originalBodyHeight;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, []);
}
