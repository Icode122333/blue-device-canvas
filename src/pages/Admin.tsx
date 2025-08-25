import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/pages/Auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppointmentsTab from "@/pages/admin/AppointmentsTab";
import PatientAssessmentForm from "@/pages/admin/PatientAssessmentForm";
import QuestionsTab from "@/pages/admin/QuestionsTab";
import ExercisesTab from "@/pages/admin/ExercisesTab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// NOTE: Current roles are 'patient' and 'chw'. If you add 'physio' to profiles.role,
// update the allowedRoles array below to ["physio"]. For now we treat 'chw' as admin-capable.
const allowedRoles = ["physio"]; // physio-only access

interface Profile {
  id: string;
  user_id: string;
  role: string;
  onboarding_completed: boolean;
}

interface SimpleUser { user_id: string; username: string | null }

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Overview counts
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [chwCount, setChwCount] = useState<number | null>(null);

  // Assignments state
  const [chws, setChws] = useState<SimpleUser[]>([]);
  const [patients, setPatients] = useState<SimpleUser[]>([]);
  const [selectedChw, setSelectedChw] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [assignedPatients, setAssignedPatients] = useState<SimpleUser[]>([]);
  const { toast } = useToast();

  // Patients tab state
  const [patientDetailOpen, setPatientDetailOpen] = useState(false);
  const [detailPatientId, setDetailPatientId] = useState<string | null>(null);
  const [detailOnboarding, setDetailOnboarding] = useState<any>(null);
  const [detailAssessments, setDetailAssessments] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setAuthed(!!user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(prof as any);
      setAuthorized(!!prof && allowedRoles.includes((prof as any).role));

      // Load overview counts
      const [{ count: pCount }, { count: cCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "chw"),
      ]);
      setPatientCount(pCount ?? 0);
      setChwCount(cCount ?? 0);

      // Preload users for assignments/patient views
      const [{ data: chwRows }, { data: patientRows }] = await Promise.all([
        supabase.from("profiles").select("user_id,username").eq("role", "chw").order("username", { nullsFirst: false, ascending: true }),
        supabase.from("profiles").select("user_id,username").eq("role", "patient").order("username", { nullsFirst: false, ascending: true }),
      ]);
      setChws((chwRows as SimpleUser[]) ?? []);
      setPatients((patientRows as SimpleUser[]) ?? []);

      setLoading(false);
    };

    init();
  }, []);

  const loadAssignmentsForChw = async (chwId: string) => {
    const { data, error } = await supabase.from("chw_assignments").select("patient_id").eq("chw_id", chwId);
    if (error) {
      toast({ title: "Failed to load assignments", description: error.message, variant: "destructive" });
      setAssignedPatients([]);
      return;
    }
    const ids = (data ?? []).map((r: any) => r.patient_id);
    const assigned = patients.filter(p => ids.includes(p.user_id));
    setAssignedPatients(assigned);
  };

  const onSelectChw = async (id: string) => {
    setSelectedChw(id);
    setAssignedPatients([]);
    await loadAssignmentsForChw(id);
  };

  const assignPatient = async () => {
    if (!selectedChw || !selectedPatient) return;
    const { error } = await supabase.from("chw_assignments").insert({ chw_id: selectedChw, patient_id: selectedPatient } as any);
    if (error) {
      toast({ title: "Assign failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assigned" });
      setSelectedPatient("");
      await loadAssignmentsForChw(selectedChw);
    }
  };

  const unassignPatient = async (pid: string) => {
    if (!selectedChw) return;
    const { error } = await supabase.from("chw_assignments").delete().match({ chw_id: selectedChw, patient_id: pid });
    if (error) {
      toast({ title: "Unassign failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Unassigned" });
      await loadAssignmentsForChw(selectedChw);
    }
  };

  const openPatientDetail = async (pid: string) => {
    setDetailPatientId(pid);
    // Load onboarding
    const { data: onboarding } = await supabase.from("patient_onboarding").select("*").eq("user_id", pid).single();
    setDetailOnboarding(onboarding ?? null);
    // Load assessments
    const { data: assessments } = await supabase
      .from("patient_assessments")
      .select("id, physio_id, created_at, full_name, rehab_recommendations")
      .eq("patient_id", pid)
      .order("created_at", { ascending: false });
    setDetailAssessments((assessments as any[]) ?? []);
    setPatientDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading admin...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <Auth onRoleSelect={() => {}} />;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account does not have permission to access the admin panel.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Current role: <span className="font-medium">{profile?.role ?? "unknown"}</span>
            </p>
            <a href="/" className="inline-block mt-4">
              <Button variant="outline">Go back home</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="mx-auto max-w-6xl p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Physio Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage appointments, CHW assignments, and reports.</p>
        </div>

        {/* Overview widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{patientCount ?? "—"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total CHWs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{chwCount ?? "—"}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="assignments">CHW Assignments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-4">
            <AppointmentsTab />
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>CHW Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Select CHW (by username)</div>
                    <Select value={selectedChw} onValueChange={onSelectChw}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose CHW" />
                      </SelectTrigger>
                      <SelectContent>
                        {chws.map(c => (
                          <SelectItem key={c.user_id} value={c.user_id}>
                            {c.username || c.user_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="text-sm text-muted-foreground">Assign Patient (by username)</div>
                    <div className="flex gap-2">
                      <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                        <SelectTrigger className="min-w-[200px]">
                          <SelectValue placeholder="Choose patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map(p => (
                            <SelectItem key={p.user_id} value={p.user_id}>
                              {p.username || p.user_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={assignPatient} disabled={!selectedChw || !selectedPatient}>Assign</Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Assigned Patients</div>
                  {(!selectedChw) ? (
                    <p className="text-sm text-muted-foreground">Select a CHW to view assignments.</p>
                  ) : assignedPatients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No patients assigned.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead className="w-[120px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedPatients.map(p => (
                          <TableRow key={p.user_id}>
                            <TableCell>{p.username || "—"}</TableCell>
                            <TableCell><code className="text-xs">{p.user_id}</code></TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => unassignPatient(p.user_id)}>Unassign</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map(p => (
                      <TableRow key={p.user_id}>
                        <TableCell>{p.username || "—"}</TableCell>
                        <TableCell><code className="text-xs">{p.user_id}</code></TableCell>
                        <TableCell className="text-right">
                          <Dialog open={patientDetailOpen && detailPatientId === p.user_id} onOpenChange={(open) => { if (!open) { setPatientDetailOpen(false); setDetailPatientId(null); } }}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => openPatientDetail(p.user_id)}>View</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Patient Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <div className="text-sm text-muted-foreground">Onboarding</div>
                                  {!detailOnboarding ? (
                                    <div className="text-sm">No onboarding data.</div>
                                  ) : (
                                    <div className="text-sm grid grid-cols-2 gap-2">
                                      <div><span className="text-muted-foreground">Full Name:</span> {detailOnboarding.full_name}</div>
                                      <div><span className="text-muted-foreground">Mother Phone:</span> {detailOnboarding.mother_phone}</div>
                                      <div><span className="text-muted-foreground">Age:</span> {detailOnboarding.age}</div>
                                      <div><span className="text-muted-foreground">Problem Noticed:</span> {new Date(detailOnboarding.problem_first_noticed).toLocaleDateString()}</div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium mb-1">Assessments</div>
                                  {detailAssessments.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No assessments yet.</div>
                                  ) : (
                                    <div className="space-y-2">
                                      {detailAssessments.map(a => (
                                        <div key={a.id} className="border rounded p-2 text-sm">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <span className="text-muted-foreground mr-2">Date:</span>
                                              {new Date(a.created_at).toLocaleString()}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                              physio_id: <code>{a.physio_id}</code>
                                            </div>
                                          </div>
                                          {a.full_name && <div className="mt-1">Name: {a.full_name}</div>}
                                          {a.rehab_recommendations && <div className="mt-1">Plan: {a.rehab_recommendations}</div>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Review submitted CHW reports and attachments.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="mt-4">
            <PatientAssessmentForm />
          </TabsContent>

          <TabsContent value="exercises" className="mt-4">
            <ExercisesTab />
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            <QuestionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
