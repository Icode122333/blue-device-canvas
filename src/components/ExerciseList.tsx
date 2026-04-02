import { useEffect, useState } from "react";
import { Search, ChevronRight, Clock, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

export const ExerciseList = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Failed to load user profile", profileError);
        setLoading(false);
        return;
      }

      let query = supabase
        .from("patient_exercise_assignments")
        .select(`
          id, 
          video_id, 
          notes, 
          due_date, 
          created_at,
          video:exercise_videos!inner(
            id,
            title,
            description,
            video_url,
            thumbnail_url,
            difficulty,
            duration_seconds
          )
        `);

      if (profile.role === "patient") {
        query = query.eq("patient_id", user.id);
      } else if (profile.role !== "physio") {
        setAssignments([]);
        setLoading(false);
        return;
      }

      const { data: assignmentsData, error: assignErr } = await query.order("created_at", { ascending: false });

      if (assignErr) {
        console.error("Failed to load exercise assignments", assignErr);
        setAssignments([]);
      } else {
        setAssignments(assignmentsData || []);
      }

      setLoading(false);
    };

    load();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-primary/15 text-primary border-primary/30";
      case "medium":
        return "bg-accent/15 text-accent border-accent/30";
      case "hard":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  return (
    <div className="px-4 pb-32 pt-4">
      <div className="panel-soft overflow-hidden p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary/75">Assigned exercise plan</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Exercises</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Search className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4 sm:col-span-2">
            <p className="text-sm font-semibold text-white">Training focus</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Open any assigned video to review the demonstration, follow the notes, and keep your progress moving.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-[0.26em] text-primary/75">Assigned now</p>
            <p className="mt-3 text-3xl font-bold text-white">{assignments.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">active items</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-[1.75rem] border border-white/8 bg-white/5 p-6 text-sm text-muted-foreground">
              Loading your assigned exercises...
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/8 bg-white/5 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/12 text-primary">
                <PlayCircle className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">No exercises yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Your physiotherapist has not assigned exercises yet. They will appear here as soon as they are available.
              </p>
            </div>
          ) : (
            assignments.map((a) => {
              const v = a.video;
              if (!v) return null;
              const difficulty = (v.difficulty || "assigned") as string;
              const duration = typeof v.duration_seconds === "number" ? `${v.duration_seconds} sec` : null;
              return (
                <div key={a.id} className="rounded-[1.75rem] border border-white/8 bg-white/5 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-24 w-full overflow-hidden rounded-[1.25rem] bg-black/20 sm:h-24 sm:w-28 sm:flex-shrink-0">
                      <img
                        src={v.thumbnail_url || "/placeholder.svg"}
                        alt={v.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{v.title}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {duration && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(String(difficulty))}>
                          {String(difficulty).charAt(0).toUpperCase() + String(difficulty).slice(1)}
                        </Badge>
                      </div>

                      {v.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{v.description}</p>
                      )}

                      <button
                        onClick={() => setOpenVideoId(v.id)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_hsl(79_100%_62%_/_0.22)]"
                      >
                        Start
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={!!openVideoId} onOpenChange={(open) => !open && setOpenVideoId(null)}>
        <DialogContent className="max-w-2xl">
          {openVideoId && (() => {
            const v = assignments.find((a) => a.video?.id === openVideoId)?.video;
            if (!v) return null;
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{v.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <AspectRatio ratio={16 / 9}>
                    <video
                      src={v.video_url}
                      poster={v.thumbnail_url || undefined}
                      controls
                      className="h-full w-full rounded-[1rem] bg-black"
                    />
                  </AspectRatio>
                  {v.description && (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{v.description}</p>
                  )}
                  {assignments.find((a) => a.video?.id === openVideoId)?.notes && (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {assignments.find((a) => a.video?.id === openVideoId)?.notes}
                    </p>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};
