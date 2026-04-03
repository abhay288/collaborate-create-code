import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsPWA(mq.matches);
    setIsInstalled(mq.matches);

    const onDisplayChange = (e: MediaQueryListEvent) => {
      setIsPWA(e.matches);
      setIsInstalled(e.matches);
    };
    mq.addEventListener("change", onDisplayChange);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      mq.removeEventListener("change", onDisplayChange);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    isPWA,
    promptInstall,
  };
}
