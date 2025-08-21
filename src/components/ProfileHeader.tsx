import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings } from "lucide-react";
import profileAvatar from "@/assets/profile-avatar.png";

export const ProfileHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-background">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profileAvatar} alt="Emma's profile" />
          <AvatarFallback>EM</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Emma's Journey</h1>
          <p className="text-sm text-muted-foreground">Age 7 • Spastic CP • Level 2</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};