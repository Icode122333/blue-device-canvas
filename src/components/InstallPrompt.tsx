import { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  // Check if user has already dismissed the prompt in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  if (!isInstallable || isInstalled || isDismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App installed!",
        description: "RBapp has been added to your home screen.",
      });
      setIsDismissed(true);
      sessionStorage.setItem('install-prompt-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('install-prompt-dismissed', 'true');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-green-600 to-black text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-3 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <img 
              src="/app icon.png" 
              alt="RBapp" 
              className="w-5 h-5 rounded"
            />
          </div>
          <span className="font-semibold text-white text-sm sm:text-base truncate">
            Install RBapp
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={handleInstall}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 sm:px-4 py-2 h-8 text-xs sm:text-sm transition-all duration-200 hover:scale-105 border-0 rounded-md"
          >
            Install
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 hover:bg-white/10 px-2 sm:px-3 py-2 h-8 border-0 text-xs sm:text-sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};