import { useState } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp, shareApp, canShare } = usePWA();
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
    }
  };

  const handleShare = async () => {
    const success = await shareApp();
    if (success) {
      toast({
        title: canShare ? "Shared successfully!" : "Link copied!",
        description: canShare ? "App shared successfully" : "App link copied to clipboard",
      });
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <Card className="clay-card clay-fade-in border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <img 
                src="/app icon.png" 
                alt="RBapp" 
                className="w-6 h-6 rounded"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-emerald-900 text-sm">
                Install RBapp
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Add to your home screen for quick access and offline use
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1 h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs px-3 py-1 h-8"
                >
                  <Share className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDismissed(true)}
              className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};