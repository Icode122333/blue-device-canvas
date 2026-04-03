import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface CommunityQuestion {
  id: string;
  user_id: string | null;
  content: string;
  created_at: string;
  assigned_physio_id: string | null;
}

export default function QuestionsTab() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CommunityQuestion[]>([]);
  const [unassigned, setUnassigned] = useState<CommunityQuestion[]>([]);
  const { toast } = useToast();
  const [replyForId, setReplyForId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        setUnassigned([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("community_questions")
        .select("id,user_id,content,created_at,assigned_physio_id")
        .eq("assigned_physio_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        toast({ title: "Failed to load questions", description: error.message, variant: "destructive" });
        setItems([]);
      } else {
        setItems((data as CommunityQuestion[]) ?? []);
      }

      // Load unassigned questions (requires policy allowing physio to view where assigned_physio_id IS NULL)
      const { data: ua, error: uaErr } = await supabase
        .from("community_questions")
        .select("id,user_id,content,created_at,assigned_physio_id")
        .is("assigned_physio_id", null)
        .order("created_at", { ascending: false });
      if (uaErr) {
        // Don't block; just inform physio they may need to run the migration
        console.warn("Failed to load unassigned questions", uaErr);
        setUnassigned([]);
      } else {
        setUnassigned((ua as CommunityQuestion[]) ?? []);
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const assignToMe = async (qid: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Not signed in", variant: "destructive" }); return; }
    const { error } = await supabase
      .from("community_questions")
      .update({ assigned_physio_id: user.id } as any)
      .eq("id", qid);
    if (error) {
      toast({ title: "Assignment failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assigned to you" });
      // Move item from unassigned to assigned list in UI
      const picked = unassigned.find(q => q.id === qid);
      setUnassigned(prev => prev.filter(q => q.id !== qid));
      if (picked) setItems(prev => [{ ...picked, assigned_physio_id: user.id }, ...prev]);
    }
  };

  return (
    <Card className="bg-emerald-800 border-0 shadow-lg rounded-2xl overflow-hidden text-white">
      <CardHeader className="bg-emerald-900/60 border-b border-amber-500/30 pb-5">
        <CardTitle className="text-white">Assigned Questions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Unassigned section (triage) */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Unassigned</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asked At</TableHead>
                <TableHead>From (user_id)</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
              ) : unassigned.length === 0 ? (
                <TableRow><TableCell colSpan={4}>No unassigned questions</TableCell></TableRow>
              ) : unassigned.map(q => (
                <TableRow key={q.id}>
                  <TableCell>{new Date(q.created_at).toLocaleString()}</TableCell>
                  <TableCell><code className="text-xs">{q.user_id}</code></TableCell>
                  <TableCell className="max-w-[520px] whitespace-pre-wrap">{q.content}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => assignToMe(q.id)} className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold">Assign to me</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asked At</TableHead>
              <TableHead>From (user_id)</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={4}>No assigned questions</TableCell></TableRow>
            ) : items.map(q => (
              <TableRow key={q.id}>
                <TableCell>{new Date(q.created_at).toLocaleString()}</TableCell>
                <TableCell><code className="text-xs">{q.user_id}</code></TableCell>
                <TableCell className="max-w-[520px] whitespace-pre-wrap">{q.content}</TableCell>
                <TableCell className="text-right">
                  <Dialog open={replyForId === q.id} onOpenChange={(open) => !open && setReplyForId(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => { setReplyForId(q.id); setReplyText(""); }} className="border-amber-400/50 text-amber-300 hover:bg-emerald-700">Reply</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-black">Reply to question</DialogTitle>
                      </DialogHeader>
                      <Textarea className="bg-white border-emerald-200 text-black placeholder:text-neutral-400" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyForId(null)} className="border-emerald-200 text-neutral-700">Cancel</Button>
                        <Button onClick={async () => {
                          if (!replyText.trim()) {
                            toast({ title: "Reply required", description: "Please enter your reply.", variant: "destructive" });
                            return;
                          }
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) {
                            toast({ title: "Not signed in", variant: "destructive" });
                            return;
                          }
                          const { error } = await supabase.from("community_question_replies").insert({
                            question_id: q.id,
                            responder_id: user.id,
                            responder_role: 'physio',
                            content: replyText.trim(),
                          } as any);
                          if (error) {
                            toast({ title: "Reply failed", description: error.message, variant: "destructive" });
                          } else {
                            toast({ title: "Reply sent" });
                            setReplyForId(null);
                            setReplyText("");
                          }
                        }}>Send Reply</Button>
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
