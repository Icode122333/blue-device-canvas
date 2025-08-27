import { useState } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  if (!isInstallable || isInstalled || isDismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App installed!",
        description: "RBapp has been added to your home screen.",
      });
      setIsDismissed(true);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-green-600 to-black text-white shadow-lg install-prompt-grow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <img 
              src="/app icon.png" 
              alt="RBapp" 
              className="w-5 h-5 rounded"
            />
          </div>
          <span className="font-semibold text-white">
            Install RBapp
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 h-8 transition-all duration-200 hover:scale-105 border-0"
          >
            Install
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="text-white hover:text-gray-200 hover:bg-white/10 px-3 py-2 h-8 border-0"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};