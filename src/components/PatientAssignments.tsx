import { Users, MapPin, Phone, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AssignedPatient = {
  user_id: string;
  full_name: string;
  mother_phone: string;
};

export const PatientAssignments = () => {
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any;

    const load = async (uid?: string) => {
      setLoading(true);
      let userId = uid;
      if (!userId) {
        const { data: userRes } = await supabase.auth.getUser();
        userId = userRes.user?.id;
      }
      if (!userId) { setLoading(false); return; }
      const { data: assignments, error: assignErr } = await supabase.from("chw_assignments").select("patient_id").eq("chw_id", userId);
      if (assignErr) { setLoading(false); return; }
      const ids = (assignments ?? []).map((a) => a.patient_id);
      if (ids.length === 0) { setPatients([]); setLoading(false); return; }
      const { data: onboard, error: onboardErr } = await supabase.from("patient_onboarding").select("user_id, full_name, mother_phone").in("user_id", ids);
      if (onboardErr) { setLoading(false); return; }
      setPatients((onboard ?? []) as AssignedPatient[]);
      setLoading(false);
    };

    const setup = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) { setLoading(false); return; }
      await load(uid);
      channel = supabase
        .channel("chw_assignments_list")
        .on("postgres_changes", { event: "*", schema: "public", table: "chw_assignments", filter: `chw_id=eq.${uid}` }, () => {
          load(uid);
        })
        .subscribe();
    };

    setup();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return (
    <Card className="panel-soft p-6 clay-fade-in">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary shadow-[0_16px_28px_hsl(79_100%_62%_/_0.18)]">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Patient Assignments</h2>
            <p className="text-xs text-muted-foreground">Your currently assigned patients and support contacts.</p>
          </div>
        </div>
        <Button>
          <ArrowRight className="mr-2 h-4 w-4" />
          Optimize Route
        </Button>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading assignments...</div>
        )}
        {!loading && patients.length === 0 && (
          <div className="text-sm text-muted-foreground">No assigned patients yet.</div>
        )}
        {!loading && patients.map((patient) => (
          <Card key={patient.user_id} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4 transition-transform hover:scale-[1.01]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {patient.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{patient.full_name}</h3>
                    <Badge className="text-xs">assigned</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Community</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Phone:</span>
                    <a href={`tel:${patient.mother_phone}`} className="font-medium text-primary">{patient.mother_phone}</a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={`tel:${patient.mother_phone}`}>
                    <Button size="sm" variant="outline" className="p-2">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
