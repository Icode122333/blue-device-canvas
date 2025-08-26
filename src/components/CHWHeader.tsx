import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CHWHeader = () => {
  const { toast } = useToast();
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [notifCount, setNotifCount] = useState<number>(0);
  type NotificationItem = { id: string; title: string; description?: string; time: number };
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);

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

  useEffect(() => {
    let channels: any[] = [];
    const setup = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      // Notify when a new patient is assigned to this CHW
      const chAssign = supabase
        .channel(`chw-assignments-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chw_assignments',
          filter: `chw_id=eq.${user.id}`,
        } as any, async (payload: any) => {
          const patientId = payload?.new?.patient_id;
          toast({ title: 'New patient assigned', description: `Patient ${patientId} was assigned to you.` });
          setNotifCount((c) => c + 1);
          setNotifs(prev => ([{
            id: String(payload?.new?.id ?? Date.now()),
            title: 'New patient assigned',
            description: `Patient ${patientId} was assigned to you.`,
            time: Date.now(),
          }, ...prev]).slice(0, 20));
        })
        .subscribe();

      // Notify when someone replies to a question created by this CHW
      const chReplies = supabase
        .channel(`cq-replies-to-chw-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'community_question_replies',
        } as any, async (payload: any) => {
          try {
            const reply = payload?.new;
            if (!reply) return;
            if (reply.responder_id === user.id) return; // ignore self
            const { data: q } = await supabase
              .from('community_questions')
              .select('user_id, content')
              .eq('id', reply.question_id)
              .single();
            if (q && q.user_id === user.id) {
              toast({ title: 'New reply to your question', description: String(reply.content || '').slice(0, 120) });
              setNotifCount((c) => c + 1);
              setNotifs(prev => ([{
                id: String(payload?.new?.id ?? Date.now()),
                title: 'New reply to your question',
                description: String(reply.content || '').slice(0, 120),
                time: Date.now(),
              }, ...prev]).slice(0, 20));
            }
          } catch (e) {
            // ignore
          }
        })
        .subscribe();

      channels = [chAssign, chReplies];
    };
    setup();

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {notifCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {notifCount}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifs.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifs.slice(0, 10).map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 whitespace-normal">
                    <span className="font-medium">{n.title}</span>
                    {n.description && (
                      <span className="text-xs text-muted-foreground">{n.description}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{new Date(n.time).toLocaleString()}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setNotifCount(0)}>Mark all as read</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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