import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImagePlus, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CHWReport = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [latest, setLatest] = useState<any | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const loadLatest = async () => {
    setLoadingLatest(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLatest(null); setLoadingLatest(false); return; }
    const { data, error } = await supabase
      .from("chw_reports")
      .select("id,title,content,attachment_url,status,admin_comment,created_at")
      .eq("chw_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("Failed to load latest report", error);
      setLatest(null);
    } else {
      setLatest(data ?? null);
    }
    setLoadingLatest(false);
  };

  useEffect(() => {
    loadLatest();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: "Missing fields", description: "Please fill title and content.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw userErr || new Error("Not authenticated");
      const uid = userRes.user.id;

      let attachment_url: string | null = null;
      if (file) {
        const path = `${uid}/${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("reports").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("reports").getPublicUrl(path);
        attachment_url = pub?.publicUrl ?? null;
      }

      const { error: insertErr } = await supabase.from("chw_reports").insert({
        chw_id: uid,
        title,
        content,
        attachment_url,
      });
      if (insertErr) throw insertErr;

      toast({ title: "Report submitted", description: "Your report has been sent to the admin." });
      setTitle("");
      setContent("");
      setFile(null);
      await loadLatest();
    } catch (err: any) {
      toast({ title: "Submission failed", description: err?.message ?? String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="panel-soft p-6 clay-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary shadow-[0_16px_28px_hsl(79_100%_62%_/_0.18)]">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Report</h2>
          <p className="text-xs text-muted-foreground">Document what you observed and send it to admin for review.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Enter report title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" placeholder="Write your report..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attachment">Attachment (photo)</Label>
          <div className="flex items-center gap-3">
            <Input id="attachment" type="file" accept="image/*" onChange={onFileChange} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImagePlus className="h-4 w-4" />
              {file ? file.name : "No file selected"}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-medium text-white">Latest submission</h3>
        {loadingLatest ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !latest ? (
          <div className="text-sm text-muted-foreground">No reports submitted yet.</div>
        ) : (
          <Card className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">{latest.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(latest.created_at).toLocaleString()}</div>
              </div>
              <Badge variant={latest.status === "reviewed" ? "default" : "outline"}>
                {latest.status === "reviewed" ? "Reviewed" : "Pending"}
              </Badge>
            </div>
            {latest.attachment_url && (
              <div className="mt-2 text-sm">
                Attachment: <a className="underline" href={latest.attachment_url} target="_blank" rel="noreferrer">View</a>
              </div>
            )}
            {latest.admin_comment && (
              <div className="mt-2 text-sm">
                <div className="mb-1 text-xs text-muted-foreground">Admin comment</div>
                <div className="whitespace-pre-wrap rounded-[1rem] border border-white/8 bg-black/10 p-3 text-white/90">{latest.admin_comment}</div>
              </div>
            )}
          </Card>
        )}
      </div>
    </Card>
  );
};
