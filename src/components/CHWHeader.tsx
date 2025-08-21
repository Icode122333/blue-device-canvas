import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CHWHeader = () => {
  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">MS</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Maria Santos</h1>
            <p className="text-sm text-muted-foreground">Community Health Worker • Field Specialist</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              2
            </Badge>
          </div>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};