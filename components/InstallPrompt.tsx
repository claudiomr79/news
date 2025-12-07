"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt: () => Promise<void>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl bg-blue-600 p-4 text-white shadow-2xl">
      <div className="flex-1">
        <p className="text-sm font-semibold">Instala NewsArg</p>
        <p className="text-xs opacity-80">
          Llévala en tu pantalla de inicio para acceder más rápido.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
        >
          Instalar
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[11px] uppercase tracking-wide opacity-80 hover:opacity-100"
        >
          Más tarde
        </button>
      </div>
    </div>
  );
}
