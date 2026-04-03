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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// NOTE: Current roles are 'patient' and 'chw'. If you add 'physio' to profiles.role,
// update the allowedRoles array below to ["physio"]. For now we treat 'chw' as admin-capable.
const allowedRoles = ["physio"]; // physio-only access

interface Profile {
  id: string;
  user_id: string;
  role: string;
  onboarding_completed: boolean;
  username?: string | null;
  full_name?: string | null;
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
  // CHW reports review state
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [commentById, setCommentById] = useState<Record<string, string>>({});

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

      await loadReports();

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

  const loadReports = async () => {
    setLoadingReports(true);
    const { data, error } = await supabase
      .from('chw_reports')
      .select('id, chw_id, title, content, attachment_url, status, admin_comment, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load reports', description: error.message, variant: 'destructive' });
      setReports([]);
    } else {
      setReports(data || []);
    }
    setLoadingReports(false);
  };

  const reviewReport = async (
    id: string,
    newStatus?: 'reviewed' | 'submitted',
    comment?: string
  ) => {
    const update: any = {};
    if (newStatus) update.status = newStatus;
    if (typeof comment !== 'undefined') update.admin_comment = comment;
    const { error } = await supabase.from('chw_reports').update(update).eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Report updated' });
      await loadReports();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-neutral-600">Loading admin...</p>
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
        <Card className="w-full max-w-lg clay-card">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Your account does not have permission to access the admin panel.
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Current role: <span className="font-medium">{profile?.role ?? "unknown"}</span>
            </p>
            <a href="/" className="inline-block mt-4">
              <Button variant="outline" className="clay-button">Go back home</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Banner Profile Section */}
      <div className="bg-emerald-900 text-white w-full border-b-[6px] border-amber-500">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-black text-3xl font-extrabold border-4 border-emerald-800 shadow-xl overflow-hidden">
              {profile?.username ? profile.username.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="pt-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {profile?.username || 'Doctor'}!</h1>
              <p className="text-emerald-200/80 mt-1 max-w-lg text-sm md:text-base">Your Physio Dashboard. Manage appointments, process patient assessments, and oversee community health worker assignments.</p>
            </div>
          </div>
          <div className="flex flex-row gap-3 w-full md:w-auto overflow-x-auto pb-2 -mb-2 scrollbar-none">
            <div className="bg-emerald-900/60 px-5 py-3 rounded-2xl border border-emerald-800 flex-1 md:flex-none min-w-[120px] text-center md:text-left backdrop-blur-sm">
              <div className="text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-1">Patients</div>
              <div className="text-3xl font-light tracking-tighter">{patientCount ?? "—"}</div>
            </div>
            <div className="bg-emerald-900/60 px-5 py-3 rounded-2xl border border-emerald-800 flex-1 md:flex-none min-w-[120px] text-center md:text-left backdrop-blur-sm">
              <div className="text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-1">CHWs</div>
              <div className="text-3xl font-light tracking-tighter">{chwCount ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 md:pt-10">
        <Tabs defaultValue="appointments">
          <div className="overflow-x-auto pb-4 mb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="flex w-max min-w-full bg-emerald-800 border border-emerald-700 p-1.5 rounded-2xl shadow-sm gap-1 overflow-visible">
              <TabsTrigger value="appointments" className="data-[state=active]:bg-amber-500 data-[state=active]:text-emerald-950 data-[state=active]:shadow-md rounded-xl px-5 py-2.5 transition-all text-sm font-medium text-white/70 hover:bg-emerald-700">Appointments</TabsTrigger>
              <TabsTrigger value="assignments" className="data-[state=active]:bg-amber-500 data-[state=active]:text-emerald-950 data-[state=active]:shadow-md rounded-xl px-5 py-2.5 transition-all text-sm font-medium text-white/70 hover:bg-emerald-700">Assignments</TabsTrigger>
              <TabsTrigger value="patients" className="data-[state=active]:bg-amber-500 data-[state=active]:text-emerald-950 data-[state=active]:shadow-md rounded-xl px-5 py-2.5 transition-all text-sm font-medium text-white/70 hover:bg-emerald-700">Patients</TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-amber-500 data-[state=active]:text-emerald-950 data-[state=active]:shadow-md rounded-xl px-5 py-2.5 transition-all text-sm font-medium text-white/70 hover:bg-emerald-700">Reports</TabsTrigger>
              <TabsTrigger value="assessment" className="data-[state=active]:bg-amber-500 data-[state=active]:text-emerald-950 data-[state=active]:shadow-md rounded-xl px-5 py-2.5 transition-all text-sm font-medium text-white/70 hover:bg-emerald-700">Assessments</TabsTrigger>
              <TabsTrigger value="exercises" className="data-[state=active]:bg-amber-500 data-[state=active]:text-emerald-950 data-[state=active]:shadow-md rounded-xl px-5 py-2.5 transition-all text-sm font-medium text-white/70 hover:bg-emerald-700">Exercises</TabsTrigger>
              <TabsTrigger value="questions" className="data-[state=active]:bg-amber-500 data-[state=active]:text-emerald-950 data-[state=active]:shadow-md rounded-xl px-5 py-2.5 transition-all text-sm font-medium text-white/70 hover:bg-emerald-700">Questions</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="appointments" className="mt-4 focus-visible:outline-none">
            <AppointmentsTab />
          </TabsContent>

          <TabsContent value="assignments" className="mt-4 focus-visible:outline-none">
            <Card className="bg-emerald-800 border-0 shadow-lg rounded-2xl overflow-hidden text-white">
              <CardHeader className="bg-emerald-900/60 border-b border-amber-500/30 pb-5">
                <CardTitle className="text-white">CHW Team Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-emerald-900/40 p-4 rounded-xl border border-emerald-700">
                  <div className="space-y-2">
                    <div className="text-sm text-white/70">Select CHW (by username)</div>
                    <Select value={selectedChw} onValueChange={onSelectChw}>
                      <SelectTrigger className="bg-white border-emerald-200 text-black">
                        <SelectValue placeholder="Choose CHW" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-emerald-200 text-black">
                        {chws.map(c => (
                          <SelectItem key={c.user_id} value={c.user_id}>
                            {c.username || c.user_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="text-sm text-white/70">Assign Patient (by username)</div>
                    <div className="flex gap-2">
                      <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                        <SelectTrigger className="min-w-[200px] bg-white border-emerald-200 text-black">
                          <SelectValue placeholder="Choose patient" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-emerald-200 text-black">
                          {patients.map(p => (
                            <SelectItem key={p.user_id} value={p.user_id}>
                              {p.username || p.user_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={assignPatient} disabled={!selectedChw || !selectedPatient} className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold rounded-xl shadow-sm px-6">Assign</Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Assigned Patients</div>
                  {(!selectedChw) ? (
                    <p className="text-sm text-white/60">Select a CHW to view assignments.</p>
                  ) : assignedPatients.length === 0 ? (
                    <p className="text-sm text-white/60">No patients assigned.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="min-w-[640px]">
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
                                <Button variant="outline" size="sm" onClick={() => unassignPatient(p.user_id)} className="text-red-300 hover:text-red-200 hover:bg-red-900/30 border-red-400/50">Unassign</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="mt-4 focus-visible:outline-none">
            <Card className="bg-emerald-800 border-0 shadow-lg rounded-2xl overflow-hidden text-white">
              <CardHeader className="bg-emerald-900/60 border-b border-amber-500/30 pb-5">
                <CardTitle className="text-white">Patient Directory</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table className="min-w-[640px]">
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
                                <Button size="sm" onClick={() => openPatientDetail(p.user_id)} className="bg-amber-500 text-emerald-950 hover:bg-amber-400 shadow-none border-0 font-semibold">View Record</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl rounded-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl text-black flex items-center gap-2">Patient Details {p.username && <Badge variant="secondary" className="bg-amber-100 text-amber-900 ml-2">{p.username}</Badge>}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-sm text-amber-400 font-semibold">Onboarding</div>
                                    {!detailOnboarding ? (
                                      <div className="text-sm">No onboarding data.</div>
                                    ) : (
                                      <div className="text-sm grid grid-cols-2 gap-2">
                                        <div><span className="text-neutral-400">Full Name:</span> {detailOnboarding.full_name}</div>
                                        <div><span className="text-neutral-400">Mother Phone:</span> {detailOnboarding.mother_phone}</div>
                                        <div><span className="text-neutral-400">Age:</span> {detailOnboarding.age}</div>
                                        <div><span className="text-neutral-400">Problem Noticed:</span> {new Date(detailOnboarding.problem_first_noticed).toLocaleDateString()}</div>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium mb-1">Assessments</div>
                                    {detailAssessments.length === 0 ? (
                                      <div className="text-sm text-neutral-400">No assessments yet.</div>
                                    ) : (
                                      <div className="space-y-2">
                                        {detailAssessments.map(a => (
                                          <div key={a.id} className="border rounded p-2 text-sm">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <span className="text-neutral-400 mr-2">Date:</span>
                                                {new Date(a.created_at).toLocaleString()}
                                              </div>
                                              <div className="text-neutral-400 text-xs">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-4 focus-visible:outline-none">
            <Card className="bg-emerald-800 border-0 shadow-lg rounded-2xl overflow-hidden text-white">
              <CardHeader className="bg-emerald-900/60 border-b border-amber-500/30 pb-5">
                <CardTitle className="text-white">CHW Field Reports</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingReports ? (
                  <div className="text-sm text-white/60">Loading...</div>
                ) : reports.length === 0 ? (
                  <div className="text-sm text-white/60">No reports submitted.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[880px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>CHW</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attachment</TableHead>
                          <TableHead>Admin Comment</TableHead>
                          <TableHead className="w-[200px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.title}</TableCell>
                            <TableCell><code className="text-xs">{r.chw_id}</code></TableCell>
                            <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={r.status === 'reviewed' ? 'default' : 'outline'}>
                                {r.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {r.attachment_url ? (
                                <a href={r.attachment_url} target="_blank" rel="noreferrer" className="underline text-sm">View</a>
                              ) : (
                                <span className="text-white/40 text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Textarea
                                className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40"
                                rows={2}
                                placeholder="Write admin comment..."
                                value={commentById[r.id] ?? r.admin_comment ?? ''}
                                onChange={(e) => setCommentById((s) => ({ ...s, [r.id]: e.target.value }))}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => reviewReport(r.id, undefined, commentById[r.id] ?? r.admin_comment ?? '')}
                                  className="bg-emerald-700 text-white hover:bg-emerald-600 border-0"
                                >
                                  Save Comment
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => reviewReport(r.id, 'reviewed', commentById[r.id] ?? r.admin_comment ?? '')}
                                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold"
                                >
                                  Approve
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="mt-6 focus-visible:outline-none">
            <PatientAssessmentForm />
          </TabsContent>

          <TabsContent value="exercises" className="mt-6 focus-visible:outline-none">
            <ExercisesTab />
          </TabsContent>

          <TabsContent value="questions" className="mt-6 focus-visible:outline-none">
            <QuestionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
