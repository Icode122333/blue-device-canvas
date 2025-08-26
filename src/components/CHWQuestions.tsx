import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, Users, Stethoscope, Clock } from "lucide-react";

export const CHWQuestions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [repliesByQ, setRepliesByQ] = useState<Record<string, any[]>>({});
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadFeed = async () => {
    setLoading(true);
    const { data: qs, error: qErr } = await supabase
      .from('community_questions')
      .select('id,user_id,content,created_at')
      .order('created_at', { ascending: false });
    if (qErr) {
      console.warn('Failed to load community questions', qErr);
      setQuestions([]);
      setRepliesByQ({});
      setLoading(false);
      return;
    }
    setQuestions(qs || []);
    const ids = (qs || []).map((q: any) => q.id);
    if (ids.length) {
      const { data: reps, error: rErr } = await supabase
        .from('community_question_replies')
        .select('id,question_id,responder_id,responder_role,content,created_at')
        .in('question_id', ids)
        .order('created_at', { ascending: true });
      if (rErr) {
        console.warn('Failed to load replies', rErr);
        setRepliesByQ({});
      } else {
        const byQ: Record<string, any[]> = {};
        (reps || []).forEach((r: any) => {
          byQ[r.question_id] = byQ[r.question_id] || [];
          byQ[r.question_id].push(r);
        });
        setRepliesByQ(byQ);
      }
    } else {
      setRepliesByQ({});
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const sendReply = async (qid: string) => {
    if (!replyText.trim()) {
      toast({ title: 'Reply required', description: 'Please enter your reply.', variant: 'destructive' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: 'Not signed in', variant: 'destructive' }); return; }
    const { error } = await supabase.from('community_question_replies').insert({
      question_id: qid,
      responder_id: user.id,
      responder_role: 'chw',
      content: replyText.trim(),
    } as any);
    if (error) {
      toast({ title: 'Reply failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reply posted' });
      setReplyFor(null);
      setReplyText('');
      await loadFeed();
    }
  };

  return (
    <div className="space-y-3 clay-fade-in">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Community Questions
      </h3>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : questions.length === 0 ? (
        <div className="text-sm text-muted-foreground">No questions yet.</div>
      ) : (
        questions.map((q) => {
          const replies = repliesByQ[q.id] || [];
          return (
            <Card key={q.id} className="clay-card border-border/50 transition-transform hover:scale-[1.005]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" /> Community
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(q.created_at).toLocaleString()}
                      </span>
                    </div>
                    {replies.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {replies.map((r) => (
                          <div key={r.id} className="text-sm p-2 rounded-md bg-muted/40">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Badge variant={r.responder_role === 'physio' ? 'default' : 'outline'} className="text-[10px]">
                                {r.responder_role === 'physio' ? (
                                  <><Stethoscope className="h-3 w-3 mr-1" /> Physio</>
                                ) : r.responder_role === 'chw' ? (
                                  <>CHW</>
                                ) : (
                                  <>Reply</>
                                )}
                              </Badge>
                              <span>{new Date(r.created_at).toLocaleString()}</span>
                            </div>
                            <div className="whitespace-pre-wrap">{r.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="text-xs self-end">
                      {replies.length} {replies.length === 1 ? 'answer' : 'answers'}
                    </Badge>
                    <Dialog open={replyFor === q.id} onOpenChange={(open) => !open && setReplyFor(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="clay-button" onClick={() => { setReplyFor(q.id); setReplyText(''); }}>Reply</Button>
                      </DialogTrigger>
                      <DialogContent className="clay-card">
                        <DialogHeader>
                          <DialogTitle>Reply to question</DialogTitle>
                        </DialogHeader>
                        <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setReplyFor(null)}>Cancel</Button>
                          <Button onClick={() => sendReply(q.id)}>Send Reply</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};
