import { useEffect, useMemo, useState } from "react";
import { Calendar, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  return (
    <div className="p-4 bg-muted/30 mx-4 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
      </div>

      {loading ? (
        <div className="p-3 bg-card rounded-lg border">Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-3 bg-card rounded-lg border text-sm text-muted-foreground">No upcoming appointments</div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
              <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{a.physiotherapist?.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-card-foreground">Session with {a.physiotherapist}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="text-muted-foreground">{new Date(a.scheduled_at).toLocaleString()}</span>
                  <span className={
                    `inline-flex px-2 py-0.5 rounded text-xs ` +
                    (a.status === "approved" ? "bg-emerald-100 text-emerald-700" : a.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")
                  }>
                    {a.status}
                  </span>
                </div>
                {a.status === "rejected" && a.decision_reason && (
                  <p className="text-xs text-muted-foreground mt-1">Reason: {a.decision_reason}</p>
                )}
              </div>
              {a.status === "approved" && a.google_meet_link ? (
                <a href={a.google_meet_link} target="_blank" rel="noopener noreferrer">
                  <Button className="flex items-center gap-1" size="sm">
                    <Video className="h-4 w-4" />
                    Join Call
                  </Button>
                </a>
              ) : (
                <Button className="flex items-center gap-1" size="sm" disabled>
                  <Video className="h-4 w-4" />
                  Join Call
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};