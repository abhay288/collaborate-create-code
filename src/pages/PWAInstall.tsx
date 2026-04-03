import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Download, Smartphone, Monitor, Share2, Plus, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Install AVSAR App - Career Guidance on Your Home Screen"
        description="Install AVSAR as an app on your phone or computer. Get instant access to career guidance, college finder, and scholarship search."
      />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Download className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-title text-foreground mb-2">Install AVSAR</h1>
          <p className="text-muted-foreground">
            Add AVSAR to your home screen for a faster, app-like experience.
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-6 text-center">
              <p className="text-success font-semibold">✅ AVSAR is already installed!</p>
              <p className="text-sm text-muted-foreground mt-2">
                You can open it from your home screen or app drawer.
              </p>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Monitor className="mx-auto h-12 w-12 text-primary" />
              <p className="font-medium">Ready to install!</p>
              <Button onClick={handleInstall} size="lg" className="w-full max-w-xs">
                <Download className="mr-2 h-5 w-5" />
                Install AVSAR App
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {isIOS ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Install on iPhone / iPad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">1</div>
                    <p className="text-sm text-muted-foreground">
                      Tap the <Share2 className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button in Safari
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">2</div>
                    <p className="text-sm text-muted-foreground">
                      Scroll down and tap <Plus className="inline h-4 w-4 mx-1" /> <strong>Add to Home Screen</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">3</div>
                    <p className="text-sm text-muted-foreground">
                      Tap <strong>Add</strong> to confirm
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Install on Android
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">1</div>
                    <p className="text-sm text-muted-foreground">
                      Tap the <MoreVertical className="inline h-4 w-4 mx-1" /> <strong>menu</strong> in Chrome
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">2</div>
                    <p className="text-sm text-muted-foreground">
                      Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">3</div>
                    <p className="text-sm text-muted-foreground">
                      Tap <strong>Install</strong> to confirm
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PWAInstall;
