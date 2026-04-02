import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock3, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  physiotherapist: string;
  scheduled_at: string;
  status: "pending" | "approved" | "rejected";
  decision_reason: string | null;
  google_meet_link: string | null;
}

export const AppointmentList = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useMemo(() => async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("id,physiotherapist,scheduled_at,status,decision_reason,google_meet_link")
      .eq("user_id", userId)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });
    if (!error) setItems((data as Appointment[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("appointments_user_" + userId)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `user_id=eq.${userId}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  return (
    <div className="mx-4 panel-soft overflow-hidden p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Upcoming Appointments</h2>
            <p className="text-xs text-muted-foreground">Join approved sessions and track pending requests.</p>
          </div>
        </div>
        <Badge variant="secondary">{items.length} scheduled</Badge>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4 text-sm text-muted-foreground">Loading appointments...</div>
      ) : items.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5 text-sm text-muted-foreground">
          No upcoming appointments yet. Once you book a session, it will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/12 text-lg font-semibold text-primary">
                  {a.physiotherapist?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-white">Session with {a.physiotherapist}</h3>
                    <Badge
                      className={
                        a.status === "approved"
                          ? "bg-primary/15 text-primary border-primary/30"
                          : a.status === "rejected"
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : "bg-accent/15 text-accent border-accent/30"
                      }
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" />
                      {new Date(a.scheduled_at).toLocaleString()}
                    </span>
                  </div>
                  {a.status === "rejected" && a.decision_reason && (
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">Reason: {a.decision_reason}</p>
                  )}
                </div>
                <div>
                  {a.status === "approved" && a.google_meet_link ? (
                    <a href={a.google_meet_link} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full sm:w-auto" size="sm">
                        <Video className="h-4 w-4" />
                        Join Call
                      </Button>
                    </a>
                  ) : (
                    <Button className="w-full sm:w-auto" size="sm" variant="outline" disabled>
                      <Video className="h-4 w-4" />
                      Join Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
