import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Stethoscope, Users, Send, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Community = () => {
  const [selectedType, setSelectedType] = useState<"physio" | "community" | null>(null);
  const [question, setQuestion] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [repliesByQ, setRepliesByQ] = useState<Record<string, any[]>>({});
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadFeed = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    // Load all community questions (RLS must allow SELECT to authenticated)
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

  const handleSubmit = async () => {
    if (!selectedType || !question.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not signed in", description: "Please sign in to submit a question.", variant: "destructive" });
        return;
      }
      // Persist all questions to community feed
      const { error } = await supabase
        .from("community_questions")
        .insert({ user_id: user.id, content: question.trim() } as any);
      if (error) throw error;
      toast({ title: selectedType === 'physio' ? "Question sent to physiotherapists" : "Posted to community" });
      setQuestion("");
      setSelectedType(null);
      await loadFeed();
    } catch (e: any) {
      toast({ title: "Failed to submit", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Ask Question Section */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
            Ask a Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Type Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Who would you like to ask?</p>
            <div className="flex gap-3">
              <Button
                variant={selectedType === "physio" ? "default" : "outline"}
                onClick={() => setSelectedType("physio")}
                className="flex-1 h-auto p-4 flex-col gap-2"
              >
                <Stethoscope className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Physiotherapist</div>
                  <div className="text-xs opacity-75">Expert medical advice</div>
                </div>
              </Button>
              <Button
                variant={selectedType === "community" ? "default" : "outline"}
                onClick={() => setSelectedType("community")}
                className="flex-1 h-auto p-4 flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Community</div>
                  <div className="text-xs opacity-75">Connect with other parents</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Question Input */}
          {selectedType && (
            <div className="space-y-3 animate-fade-in">
              <Textarea
                placeholder={`Ask your question to the ${selectedType === "physio" ? "physiotherapist" : "community"}...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[100px] resize-none border-input/50 focus:border-primary/50"
              />
              <Button 
                onClick={handleSubmit}
                disabled={!question.trim()}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Questions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Recent Questions
        </h3>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="text-sm text-muted-foreground">No questions yet. Be the first to ask!</div>
        ) : (
          questions.map((q) => {
            const replies = repliesByQ[q.id] || [];
            return (
              <Card key={q.id} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Community
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(q.created_at).toLocaleString()}
                        </span>
                      </div>
                      {/* Replies */}
                      {replies.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {replies.map((r) => (
                            <div key={r.id} className="text-sm p-2 rounded-md bg-muted/40">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Badge variant={r.responder_role === 'physio' ? 'default' : 'outline'} className="text-[10px]">
                                  {r.responder_role === 'physio' ? (
                                    <>
                                      <Stethoscope className="h-3 w-3 mr-1" /> Physio
                                    </>
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
                          <Button size="sm" variant="outline" onClick={() => { setReplyFor(q.id); setReplyText(''); }}>Reply</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reply to question</DialogTitle>
                          </DialogHeader>
                          <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setReplyFor(null)}>Cancel</Button>
                            <Button onClick={async () => {
                              if (!replyText.trim()) {
                                toast({ title: 'Reply required', description: 'Please enter your reply.', variant: 'destructive' });
                                return;
                              }
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) { toast({ title: 'Not signed in', variant: 'destructive' }); return; }
                              const { error } = await supabase.from('community_question_replies').insert({
                                question_id: q.id,
                                responder_id: user.id,
                                responder_role: 'patient',
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
                            }}>Send Reply</Button>
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

      {/* My Questions */}
      {!!userId && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            My Questions
          </h3>
          {questions.filter((q) => q.user_id === userId).length === 0 ? (
            <div className="text-sm text-muted-foreground">You haven't asked any questions yet.</div>
          ) : (
            questions.filter((q) => q.user_id === userId).map((q) => {
              const replies = repliesByQ[q.id] || [];
              return (
                <Card key={q.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.content}</p>
                        {replies.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {replies.map((r) => (
                              <div key={r.id} className="text-sm p-2 rounded-md bg-muted/40">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                  <Badge variant={r.responder_role === 'physio' ? 'default' : 'outline'} className="text-[10px]">
                                    {r.responder_role === 'physio' ? (
                                      <>
                                        <Stethoscope className="h-3 w-3 mr-1" /> Physio
                                      </>
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
                      <Badge variant="outline" className="text-xs self-end">
                        {replies.length} {replies.length === 1 ? 'answer' : 'answers'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};