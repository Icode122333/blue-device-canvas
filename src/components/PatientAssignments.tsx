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
      // Get assigned patient IDs for this CHW
      const { data: assignments, error: assignErr } = await supabase
        .from('chw_assignments')
        .select('patient_id')
        .eq('chw_id', userId);
      if (assignErr) { setLoading(false); return; }
      const ids = (assignments ?? []).map(a => a.patient_id);
      if (ids.length === 0) { setPatients([]); setLoading(false); return; }
      // Fetch patient onboarding info (includes phone)
      const { data: onboard, error: onboardErr } = await supabase
        .from('patient_onboarding')
        .select('user_id, full_name, mother_phone')
        .in('user_id', ids);
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
        .channel('chw_assignments_list')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chw_assignments', filter: `chw_id=eq.${uid}` }, () => {
          load(uid);
        })
        .subscribe();
    };

    setup();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return (
    <Card className="clay-card p-6 clay-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/40 shadow-black/10">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Patient Assignments</h2>
        </div>
        <Button className="clay-button bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-[1.02]">
          <ArrowRight className="h-4 w-4 mr-2" />
          Optimize Route
        </Button>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="text-muted-foreground text-sm">Loading assignments...</div>
        )}
        {!loading && patients.length === 0 && (
          <div className="text-muted-foreground text-sm">No assigned patients yet.</div>
        )}
        {!loading && patients.map((patient) => (
          <Card key={patient.user_id} className="clay-card p-4 border border-border hover:shadow-lg transition-transform hover:scale-[1.01]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {patient.full_name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{patient.full_name}</h3>
                    <Badge className="bg-primary/10 text-primary text-xs">
                      assigned
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Community</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Phone:</span>
                    <a href={`tel:${patient.mother_phone}`} className="text-primary font-medium">{patient.mother_phone}</a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={`tel:${patient.mother_phone}`}>
                    <Button size="sm" variant="outline" className="clay-button p-2">
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