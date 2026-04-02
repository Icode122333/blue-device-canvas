import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ClipboardList, LogOut, MapPin, UsersRound } from "lucide-react";

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
      const { data } = await supabase.from("profiles").select("username, avatar_url").eq("user_id", user.id).single();
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

      const chAssign = supabase
        .channel(`chw-assignments-${user.id}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "chw_assignments",
          filter: `chw_id=eq.${user.id}`,
        } as any, async (payload: any) => {
          const patientId = payload?.new?.patient_id;
          toast({ title: "New patient assigned", description: `Patient ${patientId} was assigned to you.` });
          setNotifCount((count) => count + 1);
          setNotifs((prevItems) => ([{
            id: String(payload?.new?.id ?? Date.now()),
            title: "New patient assigned",
            description: `Patient ${patientId} was assigned to you.`,
            time: Date.now(),
          }, ...prevItems]).slice(0, 20));
        })
        .subscribe();

      const chReplies = supabase
        .channel(`cq-replies-to-chw-${user.id}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "community_question_replies",
        } as any, async (payload: any) => {
          try {
            const reply = payload?.new;
            if (!reply || reply.responder_id === user.id) return;
            const { data: q } = await supabase
              .from("community_questions")
              .select("user_id, content")
              .eq("id", reply.question_id)
              .single();
            if (q && q.user_id === user.id) {
              toast({ title: "New reply to your question", description: String(reply.content || "").slice(0, 120) });
              setNotifCount((count) => count + 1);
              setNotifs((prevItems) => ([{
                id: String(payload?.new?.id ?? Date.now()),
                title: "New reply to your question",
                description: String(reply.content || "").slice(0, 120),
                time: Date.now(),
              }, ...prevItems]).slice(0, 20));
            }
          } catch {
            // ignore
          }
        })
        .subscribe();

      channels = [chAssign, chReplies];
    };
    setup();

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const greetingName = username || email.split("@")[0] || "there";

  return (
    <div className="px-4 pt-4">
      <div className="panel-soft overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border border-primary/25 bg-white/5">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {greetingName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="accent-chip w-fit border-primary/20 bg-primary/10 text-primary">CHW dashboard</div>
                <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Hello, {greetingName}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track assignments, patient activity, and questions from one field-ready hub.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="clay-button relative p-3 text-muted-foreground transition hover:text-white">
                    <Bell className="h-5 w-5" strokeWidth={1.75} />
                    {notifCount > 0 && (
                      <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                        {notifCount}
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-popover text-popover-foreground">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifs.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">No notifications yet.</div>
                  ) : (
                    notifs.slice(0, 10).map((n) => (
                      <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 whitespace-normal">
                        <span className="font-medium">{n.title}</span>
                        {n.description && <span className="text-xs text-muted-foreground">{n.description}</span>}
                        <span className="text-[10px] text-muted-foreground">{new Date(n.time).toLocaleString()}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setNotifCount(0)}>Mark all as read</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" strokeWidth={1.8} />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: UsersRound, title: "Assignments", copy: "Stay aware of new patient pairings." },
              { icon: ClipboardList, title: "Reports", copy: "Upload and review field observations quickly." },
              { icon: MapPin, title: "Community", copy: "Keep track of replies and patient questions." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
