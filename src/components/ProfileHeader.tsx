import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import profileAvatar from "@/assets/profile-avatar.png";
import { useState, useEffect } from "react";

export const ProfileHeader = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        setEmail(user.email || "");
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const greetingName = userProfile?.username || email?.split('@')[0] || 'there';

  return (
    <div className="flex items-center justify-between p-4" style={{ background: 'var(--gradient-pale)' }}>
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage 
            src={userProfile?.avatar_url || profileAvatar} 
            alt="Profile picture" 
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {greetingName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Hey 👋, {greetingName}</h1>
          <p className="text-sm text-muted-foreground">Welcome back</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary transition-colors">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};