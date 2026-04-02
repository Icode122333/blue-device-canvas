import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Stethoscope, Users, Send, Clock, ShieldCheck, HeartPulse } from "lucide-react";
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
    const { data: qs, error: qErr } = await supabase
      .from("community_questions")
      .select("id,user_id,content,created_at")
      .order("created_at", { ascending: false });
    if (qErr) {
      console.warn("Failed to load community questions", qErr);
      setQuestions([]);
      setRepliesByQ({});
      setLoading(false);
      return;
    }
    setQuestions(qs || []);
    const ids = (qs || []).map((q: any) => q.id);
    if (ids.length) {
      const { data: reps, error: rErr } = await supabase
        .from("community_question_replies")
        .select("id,question_id,responder_id,responder_role,content,created_at")
        .in("question_id", ids)
        .order("created_at", { ascending: true });
      if (rErr) {
        console.warn("Failed to load replies", rErr);
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
      const { error } = await supabase.from("community_questions").insert({ user_id: user.id, content: question.trim() } as any);
      if (error) throw error;
      toast({ title: selectedType === "physio" ? "Question sent to physiotherapists" : "Posted to community" });
      setQuestion("");
      setSelectedType(null);
      await loadFeed();
    } catch (e: any) {
      toast({ title: "Failed to submit", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-8 px-4 pb-32 pt-6 selection:bg-amber-500/30">
      
      {/* Ask a Question Card */}
      <Card className="bg-[#0b1f16] border-emerald-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden rounded-[1.8rem]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white tracking-tight">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
              <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
            </div>
            Ask a Question
          </CardTitle>
          <p className="text-sm text-emerald-100/60 font-medium pt-1">
            Reach a physiotherapist or post to the broader community.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.15em] font-semibold text-emerald-100/40">Who would you like to ask?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setSelectedType("physio")} 
                className={`flex-1 flex items-center p-4 gap-4 rounded-2xl border transition-all duration-300 ${
                  selectedType === "physio" 
                    ? "bg-emerald-900/80 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500" 
                    : "bg-[#0f291e] border-emerald-800/50 hover:bg-emerald-900/40 hover:border-emerald-700/50"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${selectedType === "physio" ? "bg-amber-500 text-emerald-950" : "bg-emerald-950 text-emerald-400"}`}>
                  <Stethoscope className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div className="text-left flex-1">
                  <div className={`font-bold ${selectedType === "physio" ? "text-white" : "text-emerald-100/90"}`}>Physiotherapist</div>
                  <div className={`text-xs ${selectedType === "physio" ? "text-emerald-100/70" : "text-emerald-100/50"}`}>Expert medical advice</div>
                </div>
              </button>

              <button 
                onClick={() => setSelectedType("community")} 
                className={`flex-1 flex items-center p-4 gap-4 rounded-2xl border transition-all duration-300 ${
                  selectedType === "community" 
                    ? "bg-emerald-900/80 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500" 
                    : "bg-[#0f291e] border-emerald-800/50 hover:bg-emerald-900/40 hover:border-emerald-700/50"
                }`}
              >
                 <div className={`p-2.5 rounded-xl ${selectedType === "community" ? "bg-amber-500 text-emerald-950" : "bg-emerald-950 text-emerald-400"}`}>
                  <Users className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div className="text-left flex-1">
                  <div className={`font-bold ${selectedType === "community" ? "text-white" : "text-emerald-100/90"}`}>Community</div>
                  <div className={`text-xs ${selectedType === "community" ? "text-emerald-100/70" : "text-emerald-100/50"}`}>Connect with parents</div>
                </div>
              </button>
            </div>
          </div>

          {selectedType && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <Textarea
                placeholder={`Ask your question to the ${selectedType === "physio" ? "physiotherapist" : "community"}...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="resize-none h-28 bg-[#0f291e] border-emerald-800/50 text-white placeholder:text-emerald-100/20 p-4 rounded-2xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500/40 transition-all shadow-inner"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={!question.trim()} 
                className="w-full h-12 gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold transition-all shadow-[0_4px_16px_rgba(245,158,11,0.2)] disabled:bg-emerald-900 disabled:text-emerald-100/30"
              >
                <Send className="h-5 w-5" />
                Submit Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Questions Section */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white tracking-tight px-1">
          <MessageCircle className="h-5 w-5 text-emerald-400" />
          Recent Questions
        </h3>
        
        {loading ? (
          <div className="text-sm text-emerald-100/60 px-2 animate-pulse">Loading discussion...</div>
        ) : questions.length === 0 ? (
          <div className="text-sm text-emerald-100/60 px-2">No questions yet. Be the first to ask!</div>
        ) : (
          <div className="space-y-4">
          {questions.map((q) => {
            const replies = repliesByQ[q.id] || [];
            return (
              <Card key={q.id} className="bg-[#0b1f16] border-emerald-800/40 shadow-sm overflow-hidden rounded-2xl transition-all hover:border-emerald-700/60">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-50 font-medium">{q.content}</p>
                      <div className="flex items-center gap-3 text-[11px] text-emerald-100/40 uppercase tracking-wider font-semibold">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-900/50 text-emerald-300 border border-emerald-800/50">
                          <Users className="h-3 w-3" />
                          Community
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(q.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="mt-1 space-y-3 pl-4 border-l-2 border-emerald-900/60">
                        {replies.map((r) => (
                          <div key={r.id} className="rounded-xl bg-[#0f291e] p-4 text-sm border border-emerald-800/30">
                            <div className="mb-2 flex items-center gap-2 text-[10px] text-emerald-100/40 uppercase tracking-wider font-bold">
                              {r.responder_role === "physio" ? (
                                <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 shadow-none px-1.5 py-0">
                                  <HeartPulse className="mr-1 h-3 w-3" /> Physio
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none px-1.5 py-0">
                                  Reply
                                </Badge>
                              )}
                              <span>{new Date(r.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="whitespace-pre-wrap text-emerald-100/90 leading-relaxed font-medium">{r.content}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-emerald-800/30 mt-1">
                      <span className="text-xs font-semibold text-emerald-100/40">
                        {replies.length} {replies.length === 1 ? "answer" : "answers"}
                      </span>
                      
                      <Dialog open={replyFor === q.id} onOpenChange={(open) => !open && setReplyFor(null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="h-8 rounded-lg bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800/80 border border-emerald-800/50" onClick={() => { setReplyFor(q.id); setReplyText(""); }}>
                            Reply
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0b1f16] border-emerald-800/50 text-white sm:rounded-3xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl">Reply to question</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Textarea 
                              value={replyText} 
                              onChange={(e) => setReplyText(e.target.value)} 
                              placeholder="Write a helpful response..." 
                              className="h-32 bg-[#0f291e] border-emerald-800/50 text-white placeholder:text-emerald-100/20 rounded-xl resize-none focus-visible:ring-amber-500/20 focus-visible:border-amber-500/40"
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="ghost" className="hover:bg-emerald-900 hover:text-white text-emerald-100/60" onClick={() => setReplyFor(null)}>Cancel</Button>
                            <Button
                              className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold shadow-md"
                              onClick={async () => {
                                if (!replyText.trim()) {
                                  toast({ title: "Reply required", description: "Please enter your reply.", variant: "destructive" });
                                  return;
                                }
                                const { data: { user } } = await supabase.auth.getUser();
                                if (!user) {
                                  toast({ title: "Not signed in", variant: "destructive" });
                                  return;
                                }
                                const { data: prof } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
                                const responderRole = prof?.role === "chw" ? "chw" : "patient";
                                const { error } = await supabase.from("community_question_replies").insert({
                                  question_id: q.id,
                                  responder_id: user.id,
                                  responder_role: responderRole,
                                  content: replyText.trim(),
                                } as any);
                                if (error) {
                                  toast({ title: "Reply failed", description: error.message, variant: "destructive" });
                                } else {
                                  toast({ title: "Reply posted", className: "bg-emerald-900 text-white border-emerald-800" });
                                  setReplyFor(null);
                                  setReplyText("");
                                  await loadFeed();
                                }
                              }}
                            >
                              Post Reply
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}
      </div>

      {/* My Questions Section */}
      {!!userId && (
        <div className="space-y-4 pt-4 border-t border-emerald-800/30">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white tracking-tight px-1">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            My Questions
          </h3>
          {questions.filter((q) => q.user_id === userId).length === 0 ? (
            <div className="text-sm text-emerald-100/60 px-2 bg-emerald-900/20 p-4 rounded-xl border border-emerald-800/20 inline-block font-medium">You haven't asked any questions yet.</div>
          ) : (
            <div className="space-y-4">
            {questions.filter((q) => q.user_id === userId).map((q) => {
              const replies = repliesByQ[q.id] || [];
              return (
                <Card key={q.id} className="bg-[#0f291e] border-emerald-800/30 rounded-2xl opacity-90 hover:opacity-100 transition-opacity">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-emerald-50 italic">"{q.content}"</p>
                      
                      {replies.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <div className="text-[10px] uppercase font-bold text-emerald-100/30 tracking-widest pl-1 mb-1">Responses</div>
                          {replies.map((r) => (
                            <div key={r.id} className="rounded-xl bg-[#0b1f16] p-3 text-sm border border-emerald-800/20">
                              <div className="mb-1.5 flex items-center gap-2 text-[10px] text-emerald-100/40 uppercase tracking-wider font-bold">
                                {r.responder_role === "physio" ? (
                                  <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 shadow-none px-1.5 py-0">
                                    <HeartPulse className="mr-1 h-3 w-3" /> Physio
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none px-1.5 py-0">
                                    Reply
                                  </Badge>
                                )}
                              </div>
                              <div className="whitespace-pre-wrap text-emerald-100/80 text-[13px]">{r.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-emerald-100/30">
                          {new Date(q.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[11px] font-bold text-amber-500/80 bg-amber-500/10 px-2 py-1 rounded-md">
                          {replies.length} {replies.length === 1 ? "Answer" : "Answers"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
