import { useEffect, useState } from "react";
import { PlayCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

export const HomeVideos = () => {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // We load patient assignments joined with videos
      const { data: assignmentsData, error } = await supabase
        .from("patient_exercise_assignments")
        .select(`
          id, 
          notes, 
          video:exercise_videos!inner(
            id,
            title,
            description,
            video_url,
            thumbnail_url,
            duration_seconds,
            difficulty
          )
        `)
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && assignmentsData) {
        setVideos(assignmentsData);
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading || videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Your Exercises</h2>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-500/80">
          Must Do
        </span>
      </div>

      <div className="space-y-3">
        {videos.map((a) => {
          const v = a.video;
          if (!v) return null;
          const duration = typeof v.duration_seconds === "number" ? `${v.duration_seconds} sec` : null;

          return (
            <button
              key={a.id}
              onClick={() => setOpenVideoId(v.id)}
              className="w-full relative overflow-hidden rounded-[1.4rem] border border-emerald-800/40 bg-[#0b1f16] shadow-md group text-left transition hover:border-amber-500/50"
            >
              <div className="flex items-stretch">
                {/* Thumbnail Side */}
                <div className="relative w-28 h-24 sm:w-32 bg-black/40 overflow-hidden shrink-0">
                  <img
                    src={v.thumbnail_url || "/placeholder.svg"}
                    alt={v.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 border border-white/20 group-hover:bg-amber-500 group-hover:text-emerald-950 group-hover:border-transparent transition-all">
                      <PlayCircle className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-white leading-tight line-clamp-1">{v.title}</h3>
                    <p className="text-xs text-emerald-100/60 mt-1 line-clamp-1">
                      {v.description || "Video demonstration"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {duration ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-100/40">
                        <Clock className="h-3 w-3" />
                        {duration}
                      </span>
                    ) : <span />}
                    <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800 hover:bg-emerald-800 text-[10px] px-1.5 py-0 h-5">
                      New
                    </Badge>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!openVideoId} onOpenChange={(open) => !open && setOpenVideoId(null)}>
        <DialogContent className="max-w-2xl bg-[#0b1f16] border-emerald-800/40 text-white rounded-[1.8rem] overflow-hidden">
          {openVideoId && (() => {
            const assignment = videos.find((a) => a.video?.id === openVideoId);
            const v = assignment?.video;
            if (!v) return null;
            return (
              <>
                <DialogHeader className="px-1 pt-2">
                  <DialogTitle className="text-xl text-white">{v.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-emerald-800/30">
                    <AspectRatio ratio={16 / 9}>
                      <video
                        src={v.video_url}
                        poster={v.thumbnail_url || undefined}
                        controls
                        className="h-full w-full bg-black object-contain"
                      />
                    </AspectRatio>
                  </div>
                  {v.description && (
                    <p className="whitespace-pre-wrap text-[15px] text-emerald-100/80 leading-relaxed">
                      {v.description}
                    </p>
                  )}
                  {assignment?.notes && (
                    <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-800/30">
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-500/80 mb-2">Physio Notes</p>
                      <p className="whitespace-pre-wrap text-sm text-emerald-50">
                        {assignment.notes}
                      </p>
                    </div>
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
