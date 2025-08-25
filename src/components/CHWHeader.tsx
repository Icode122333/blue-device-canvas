import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const CHWHeader = () => {
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url);
      }
    };
    load();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const greetingName = username || email.split('@')[0] || 'there';

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 bg-primary">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {greetingName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Hey 👋, {greetingName}</h1>
            <p className="text-sm text-muted-foreground">Community Health Worker</p>
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
    </div>
  );
};