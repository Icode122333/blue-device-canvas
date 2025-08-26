import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import profileAvatar from "@/assets/profile-avatar.png";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  useEffect(() => {
    let channels: any[] = [];
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Appointment status changes for this patient
      const apptCh = supabase
        .channel(`appointments-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${user.id}`,
        } as any, (payload: any) => {
          const prev = payload?.old?.status;
          const cur = payload?.new?.status;
          if (prev !== cur && (cur === 'approved' || cur === 'rejected')) {
            toast({ title: `Appointment ${cur}`, description: 'Your appointment request was ' + cur + '.' });
            setNotifCount(c => c + 1);
            setNotifs(prev => ([{
              id: String(payload?.new?.id ?? Date.now()),
              title: `Appointment ${cur}`,
              description: 'Your appointment request was ' + cur + '.',
              time: Date.now(),
            }, ...prev]).slice(0, 20));
          }
        })
        .subscribe();

      // New exercise assignment for this patient
      const exCh = supabase
        .channel(`assignments-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'patient_exercise_assignments',
          filter: `patient_id=eq.${user.id}`,
        } as any, async (payload: any) => {
          const vid = payload?.new?.video_id;
          let title = 'New exercise assigned';
          if (vid) {
            const { data: v } = await supabase.from('exercise_videos').select('title').eq('id', vid).single();
            if (v?.title) title = `New exercise: ${v.title}`;
          }
          toast({ title, description: 'Check your exercises list.' });
          setNotifCount(c => c + 1);
          setNotifs(prev => ([{
            id: String(payload?.new?.id ?? Date.now()),
            title,
            description: 'Check your exercises list.',
            time: Date.now(),
          }, ...prev]).slice(0, 20));
        })
        .subscribe();

      // Admin/physio replies to patient's questions
      const replyCh = supabase
        .channel(`patient-cq-replies-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'community_question_replies',
        } as any, async (payload: any) => {
          const reply = payload?.new;
          if (!reply) return;
          if (reply.responder_id === user.id) return; // ignore self
          const { data: q } = await supabase
            .from('community_questions')
            .select('user_id')
            .eq('id', reply.question_id)
            .single();
          if (q?.user_id === user.id && (reply.responder_role === 'physio' || reply.responder_role === 'admin')) {
            toast({ title: 'New reply from admin', description: String(reply.content || '').slice(0, 120) });
            setNotifCount(c => c + 1);
            setNotifs(prev => ([{
              id: String(payload?.new?.id ?? Date.now()),
              title: 'New reply from admin',
              description: String(reply.content || '').slice(0, 120),
              time: Date.now(),
            }, ...prev]).slice(0, 20));
          }
        })
        .subscribe();

      channels = [apptCh, exCh, replyCh];
    };
    setup();
    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
  }, [toast]);

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
  );
};