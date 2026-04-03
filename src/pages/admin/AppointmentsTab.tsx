import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface Appointment {
  id: string;
  user_id: string;
  physiotherapist: string;
  scheduled_at: string;
  status: "pending" | "approved" | "rejected";
  decision_reason: string | null;
  google_meet_link?: string | null;
}

export default function AppointmentsTab() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Appointment[]>([]);
  const [rejectForId, setRejectForId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveForId, setApproveForId] = useState<string | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("id,user_id,physiotherapist,scheduled_at,status,decision_reason,google_meet_link")
      .in("status", ["pending"]) // show only pending
      .order("scheduled_at", { ascending: true });
    if (error) {
      toast({ title: "Failed to load appointments", description: error.message, variant: "destructive" });
    } else {
      setItems((data as Appointment[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "approved", decision_reason: null })
      .eq("id", id);
    if (error) {
      toast({ title: "Approve failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Appointment approved" });
      load();
    }
  };

  const openReject = (id: string) => {
    setRejectForId(id);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectForId) return;
    if (!rejectReason.trim()) {
      toast({ title: "Reason required", description: "Please enter a reason for rejection.", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("appointments")
      .update({ status: "rejected", decision_reason: rejectReason.trim() })
      .eq("id", rejectForId);
    if (error) {
      toast({ title: "Reject failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Appointment rejected" });
      setRejectForId(null);
      setRejectReason("");
      load();
    }
  };

  const openApprove = (id: string) => {
    setApproveForId(id);
    setMeetLink("");
  };

  const confirmApprove = async () => {
    if (!approveForId) return;
    const payload: Partial<Appointment> = { status: "approved", decision_reason: null };
    if (meetLink.trim()) {
      (payload as any).google_meet_link = meetLink.trim();
    } else {
      (payload as any).google_meet_link = null;
    }
    const { error } = await supabase
      .from("appointments")
      .update(payload)
      .eq("id", approveForId);
    if (error) {
      toast({ title: "Approve failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Appointment approved" });
      setApproveForId(null);
      setMeetLink("");
      load();
    }
  };

  return (
    <Card className="bg-emerald-800 border-0 shadow-lg rounded-2xl overflow-hidden text-white">
      <CardHeader className="bg-emerald-900/60 border-b border-amber-500/30 pb-5">
        <CardTitle className="text-white">Pending Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient (user_id)</TableHead>
              <TableHead>Physiotherapist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5}>No pending appointments</TableCell></TableRow>
            ) : items.map(a => (
              <TableRow key={a.id}>
                <TableCell>{new Date(a.scheduled_at).toLocaleString()}</TableCell>
                <TableCell><code className="text-xs">{a.user_id}</code></TableCell>
                <TableCell>{a.physiotherapist}</TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">{a.status}</span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {/* Approve with Meet link dialog */}
                  <Dialog open={approveForId === a.id} onOpenChange={(open) => !open && setApproveForId(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => openApprove(a.id)} className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold">Approve</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-black">Approve appointment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <label className="text-sm text-neutral-500" htmlFor="meetLink">Google Meet link (optional)</label>
                        <Input id="meetLink" placeholder="https://meet.google.com/xyz-abcd-efg" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveForId(null)} className="border-emerald-200 text-neutral-700">Cancel</Button>
                        <Button onClick={confirmApprove} className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold">Approve</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {/* Reject with reason dialog */}
                  <Dialog open={rejectForId === a.id} onOpenChange={(open) => !open && setRejectForId(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => openReject(a.id)} className="text-red-700 border-red-200 hover:bg-red-50">Reject</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-black">Provide rejection reason</DialogTitle>
                      </DialogHeader>
                      <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this appointment is denied" />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectForId(null)} className="border-emerald-200 text-neutral-700">Cancel</Button>
                        <Button onClick={confirmReject} className="bg-red-700 hover:bg-red-800 text-white">Submit</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
