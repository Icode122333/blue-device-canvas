import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PatientProfile { user_id: string; role: string; username?: string | null }
interface AssessmentRow { id: string; patient_id: string; physio_id: string; created_at: string; full_name: string | null; rehab_recommendations: string | null }

export default function PatientAssessmentForm() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [functionalComplaint, setFunctionalComplaint] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [recent, setRecent] = useState<AssessmentRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id,role,username")
      .eq("role", "patient")
      .order("username", { ascending: true, nullsFirst: false });
    if (error) {
      toast({ title: "Failed to load patients", description: error.message, variant: "destructive" });
      setPatients([]);
    } else {
      setPatients((data as PatientProfile[]) ?? []);
    }
  };

  const loadRecent = async () => {
    const { data, error } = await supabase
      .from("patient_assessments")
      .select("id,patient_id,physio_id,created_at,full_name,rehab_recommendations")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      // Don't spam toast on read-only errors
      return;
    }
    setRecent((data as AssessmentRow[]) ?? []);
  };

  useEffect(() => { loadPatients(); loadRecent(); }, []);

  const submit = async () => {
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      toast({ title: "Not signed in", variant: "destructive" });
      setSubmitting(false);
      return;
    }
    if (!selectedPatient) {
      toast({ title: "Select a patient", variant: "destructive" });
      setSubmitting(false);
      return;
    }
    const insertPayload = {
      patient_id: selectedPatient,
      physio_id: user.id,
      full_name: fullName || null,
      functional_complaint: functionalComplaint || null,
      rehab_recommendations: recommendations || null,
    };
    const { error } = await supabase.from("patient_assessments").insert(insertPayload as any);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assessment saved" });
      setFullName("");
      setFunctionalComplaint("");
      setRecommendations("");
      await loadRecent();
    }
    setSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient by username" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.username || p.user_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Patient full name" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Functional Complaint</Label>
            <Textarea value={functionalComplaint} onChange={(e) => setFunctionalComplaint(e.target.value)} placeholder="Brief description of main functional complaint" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Rehabilitation Recommendations</Label>
            <Textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} placeholder="Plan, goals, and recommendations" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={submit} disabled={submitting || !selectedPatient}>{submitting ? "Saving..." : "Save Assessment"}</Button>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Recent Assessments</h3>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assessments yet.</p>
            ) : recent.map(r => (
              <div key={r.id} className="text-sm p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="space-x-2">
                    <span className="text-muted-foreground">Patient</span>
                    <code className="text-xs">{r.patient_id}</code>
                  </div>
                  <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                {r.full_name && <div className="mt-1">Name: {r.full_name}</div>}
                {r.rehab_recommendations && <div className="mt-1 line-clamp-2">Plan: {r.rehab_recommendations}</div>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
