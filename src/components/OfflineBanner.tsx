import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-destructive/90 text-destructive-foreground text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-sm">
      <WifiOff className="h-4 w-4" />
      Offline Mode — Limited Features Available
    </div>
  );
};

export default OfflineBanner;
