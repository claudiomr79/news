"use client";

import { useEffect } from "react";

const SERVICE_WORKER_PATH = "/sw.js";

export function PwaInitializer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          SERVICE_WORKER_PATH,
          {
            scope: "/",
          }
        );

        if (process.env.NODE_ENV === "development") {
          console.info("Service worker registrado:", registration.scope);
        }
      } catch (error) {
        console.error("Error registrando el service worker:", error);
      }
    };

    register();
  }, []);

  return null;
}
