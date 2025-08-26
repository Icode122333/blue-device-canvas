import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VideoRow {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  duration_seconds: number | null;
  created_at: string;
}

interface SimpleUser { user_id: string; full_name: string | null }

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const ExercisesTab = () => {
  const { toast } = useToast();

  // Upload form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [durationSeconds, setDurationSeconds] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Data
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Patients for assignment
  const [patients, setPatients] = useState<SimpleUser[]>([]);
  const [assignOpenFor, setAssignOpenFor] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [previewFor, setPreviewFor] = useState<string | null>(null);

  const canUpload = useMemo(() => title.trim() && videoFile, [title, videoFile]);

  const loadVideos = async () => {
    setLoadingVideos(true);
    const { data, error } = await (supabase as any)
      .from('exercise_videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load videos', description: error.message, variant: 'destructive' });
      setVideos([]);
    } else {
      setVideos((data as VideoRow[]) || []);
    }
    setLoadingVideos(false);
  };

  const loadPatients = async () => {
    // Step 1: patient user IDs from profiles
    const { data: profileRows, error: profErr } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('role', 'patient');
    if (profErr) {
      toast({ title: 'Failed to load patients', description: profErr.message, variant: 'destructive' });
      setPatients([]);
      return;
    }
    const ids = (profileRows as any[] | null)?.map((r: any) => r.user_id) || [];
    if (ids.length === 0) { setPatients([]); return; }

    // Step 2: names from patient_onboarding
    const { data: onboardingRows, error: onErr } = await supabase
      .from('patient_onboarding')
      .select('user_id, full_name')
      .in('user_id', ids);
    if (onErr) {
      toast({ title: 'Failed to load patient names', description: onErr.message, variant: 'destructive' });
      setPatients(ids.map((id: string) => ({ user_id: id, full_name: null })));
      return;
    }
    const nameById: Record<string, string | null> = {};
    (onboardingRows as any[] | null)?.forEach((r: any) => { nameById[r.user_id] = r.full_name ?? null; });
    const list: SimpleUser[] = ids.map((id: string) => ({ user_id: id, full_name: nameById[id] ?? null }))
      .sort((a, b) => ((a.full_name || a.user_id).localeCompare(b.full_name || b.user_id)));
    setPatients(list);
  };

  useEffect(() => {
    loadVideos();
    loadPatients();
  }, []);

  const uploadVideo = async () => {
    if (!canUpload) return;
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) throw new Error('No authenticated user');
      const file = videoFile!;
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('exercise-videos').upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('exercise-videos').getPublicUrl(path);
      const video_url = pub.publicUrl;

      const { error: insErr } = await (supabase as any)
        .from('exercise_videos')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          video_url,
          thumbnail_url: thumbnailUrl.trim() || null,
          category: category.trim() || null,
          difficulty: difficulty || null,
          duration_seconds: durationSeconds ? Number(durationSeconds) : null,
          created_by: user.id,
        });
      if (insErr) throw insErr;

      toast({ title: 'Video uploaded' });
      setTitle("");
      setDescription("");
      setCategory("");
      setDifficulty("easy");
      setDurationSeconds("");
      setVideoFile(null);
      setThumbnailUrl("");
      await loadVideos();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    const { error } = await (supabase as any)
      .from('exercise_videos')
      .delete()
      .eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted' });
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  const openAssign = (videoId: string) => {
    setAssignOpenFor(videoId);
    setSelectedPatient("");
    setDueDate("");
    setNotes("");
  };

  const assignVideo = async () => {
    if (!assignOpenFor || !selectedPatient) return;
    setAssigning(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      const { error } = await (supabase as any)
        .from('patient_exercise_assignments')
        .insert({
          patient_id: selectedPatient,
          video_id: assignOpenFor,
          assigned_by: user?.id ?? null,
          notes: notes.trim() || null,
          due_date: dueDate || null,
        });
      if (error) throw error;
      toast({ title: 'Assigned to patient' });
      setAssignOpenFor(null);
    } catch (e: any) {
      toast({ title: 'Assign failed', description: e.message, variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Exercise Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Seated Knee Extension" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., knee, cardio" />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input id="duration" type="number" min={0} value={durationSeconds} onChange={e => setDurationSeconds(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details or instructions" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video">Video file</Label>
              <Input id="video" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumb">Thumbnail URL (optional)</Label>
              <Input id="thumb" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={uploadVideo} disabled={!canUpload || uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Library</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingVideos ? (
            <div className="text-sm text-muted-foreground">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="text-sm text-muted-foreground">No videos uploaded yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[220px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.title}</TableCell>
                    <TableCell className="capitalize">{v.difficulty ?? '—'}</TableCell>
                    <TableCell>{typeof v.duration_seconds === 'number' ? `${v.duration_seconds} sec` : '—'}</TableCell>
                    <TableCell>{new Date(v.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={previewFor === v.id} onOpenChange={(open) => setPreviewFor(open ? v.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setPreviewFor(v.id)}>Preview</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{v.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <AspectRatio ratio={16/9}>
                                <video
                                  src={v.video_url}
                                  poster={v.thumbnail_url || undefined}
                                  controls
                                  className="h-full w-full rounded-md bg-black"
                                />
                              </AspectRatio>
                              {v.description && (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{v.description}</p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={assignOpenFor === v.id} onOpenChange={(open) => setAssignOpenFor(open ? v.id : null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="default" onClick={() => openAssign(v.id)}>Assign</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign "{v.title}" to patient</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Patient</Label>
                                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose patient" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {patients.map(p => (
                                      <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.user_id}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="due">Due date</Label>
                                  <Input id="due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes for the patient" />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setAssignOpenFor(null)}>Cancel</Button>
                                <Button onClick={assignVideo} disabled={!selectedPatient || assigning}>{assigning ? 'Assigning...' : 'Assign'}</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="destructive" size="sm" onClick={() => deleteVideo(v.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExercisesTab;
