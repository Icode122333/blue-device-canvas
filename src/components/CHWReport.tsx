import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImagePlus, FileText } from "lucide-react";

export const CHWReport = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

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
        const { error: upErr } = await supabase.storage.from('reports').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('reports').getPublicUrl(path);
        attachment_url = pub?.publicUrl ?? null;
      }

      const { error: insertErr } = await supabase.from('chw_reports').insert({
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
    } catch (err: any) {
      toast({ title: "Submission failed", description: err?.message ?? String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Report</h2>
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
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <ImagePlus className="h-4 w-4" />
              {file ? file.name : "No file selected"}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
