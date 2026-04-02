import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import profileAvatar from "@/assets/profile-avatar.png";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CalendarDays, Dumbbell, LogOut, ShieldCheck } from "lucide-react";

export const ProfileHeader = () => {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [notifCount, setNotifCount] = useState<number>(0);
  type NotificationItem = { id: string; title: string; description?: string; time: number };
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        setEmail(user.email || "");
        const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        setUserProfile(data);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    let channels: any[] = [];
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const apptCh = supabase
        .channel(`appointments-${user.id}`)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "appointments",
          filter: `patient_id=eq.${user.id}`,
        } as any, (payload: any) => {
          const prev = payload?.old?.status;
          const cur = payload?.new?.status;
          if (prev !== cur && (cur === "approved" || cur === "rejected")) {
            toast({ title: `Appointment ${cur}`, description: "Your appointment request was " + cur + "." });
            setNotifCount((count) => count + 1);
            setNotifs((prevItems) => ([{
              id: String(payload?.new?.id ?? Date.now()),
              title: `Appointment ${cur}`,
              description: "Your appointment request was " + cur + ".",
              time: Date.now(),
            }, ...prevItems]).slice(0, 20));
          }
        })
        .subscribe();

      const exCh = supabase
        .channel(`assignments-${user.id}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "patient_exercise_assignments",
          filter: `patient_id=eq.${user.id}`,
        } as any, async (payload: any) => {
          const vid = payload?.new?.video_id;
          let title = "New exercise assigned";
          if (vid) {
            const { data: v } = await supabase.from("exercise_videos").select("title").eq("id", vid).single();
            if (v?.title) title = `New exercise: ${v.title}`;
          }
          toast({ title, description: "Check your exercises list." });
          setNotifCount((count) => count + 1);
          setNotifs((prevItems) => ([{
            id: String(payload?.new?.id ?? Date.now()),
            title,
            description: "Check your exercises list.",
            time: Date.now(),
          }, ...prevItems]).slice(0, 20));
        })
        .subscribe();

      const replyCh = supabase
        .channel(`patient-cq-replies-${user.id}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "community_question_replies",
        } as any, async (payload: any) => {
          const reply = payload?.new;
          if (!reply || reply.responder_id === user.id) return;
          const { data: q } = await supabase
            .from("community_questions")
            .select("user_id")
            .eq("id", reply.question_id)
            .single();
          if (q?.user_id === user.id && (reply.responder_role === "physio" || reply.responder_role === "admin")) {
            toast({ title: "New reply from admin", description: String(reply.content || "").slice(0, 120) });
            setNotifCount((count) => count + 1);
            setNotifs((prevItems) => ([{
              id: String(payload?.new?.id ?? Date.now()),
              title: "New reply from admin",
              description: String(reply.content || "").slice(0, 120),
              time: Date.now(),
            }, ...prevItems]).slice(0, 20));
          }
        })
        .subscribe();

      channels = [apptCh, exCh, replyCh];
    };

    setup();
    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const greetingName = userProfile?.username || email?.split("@")[0] || "there";

  return (
    <div className="px-4 pt-6 pb-4 bg-[#0f291e]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hi, {greetingName}</h1>
          <p className="mt-1 text-sm text-emerald-100/60 font-medium tracking-wide">
            Have a refreshing afternoon!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900/70 border border-emerald-700/50 text-white transition hover:bg-emerald-800/70 active:scale-95 group">
                <img src="/bell.png" alt="Notifications" className="h-[22px] w-[22px] object-contain opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-sm invert brightness-0" />
                {notifCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-amber-500 px-1 text-[10px] text-emerald-950 font-bold">
                    {notifCount}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#0f291e] border border-emerald-800/50 text-white">
              <DropdownMenuLabel className="text-amber-400">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-emerald-800/50" />
              {notifs.length === 0 ? (
                <div className="p-3 text-sm text-emerald-100/60">No notifications yet.</div>
              ) : (
                notifs.slice(0, 10).map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 whitespace-normal text-white">
                    <span className="font-medium text-white">{n.title}</span>
                    {n.description && <span className="text-xs text-emerald-100/60">{n.description}</span>}
                    <span className="text-[10px] text-emerald-100/40">{new Date(n.time).toLocaleString()}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator className="bg-emerald-800/50" />
              <DropdownMenuItem onClick={() => setNotifCount(0)} className="text-amber-400">Mark all as read</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleSignOut}
            className="h-11 w-11 rounded-2xl bg-emerald-900/70 border border-emerald-700/50 text-white transition hover:bg-emerald-800/70 active:scale-95 group"
          >
            <img src="/logout.png" alt="Log out" className="h-5 w-5 object-contain opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-sm invert brightness-0" />
          </Button>
        </div>
      </div>
    </div>
  );
};
