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
  const { toast } = useToast();
  const [replyForId, setReplyForId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
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
      setLoading(false);
    };
    load();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Questions</CardTitle>
      </CardHeader>
      <CardContent>
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
                      <Button size="sm" variant="outline" onClick={() => { setReplyForId(q.id); setReplyText(""); }}>Reply</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reply to question</DialogTitle>
                      </DialogHeader>
                      <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyForId(null)}>Cancel</Button>
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
