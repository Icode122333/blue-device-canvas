import { useEffect, useState } from "react";
import { Search, ChevronRight, Clock, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const ExerciseList = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
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
      setUserId(user.id);

      // First, get the user's profile to check if they're a patient
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Failed to load user profile', profileError);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('patient_exercise_assignments')
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

      // If user is a patient, only show their assigned exercises
      if (profile.role === 'patient') {
        query = query.eq('patient_id', user.id);
      }
      // If user is a physio, show all assignments
      else if (profile.role === 'physio') {
        // No additional filters needed for physio
      }
      // For other roles, don't show any exercises
      else {
        setAssignments([]);
        setLoading(false);
        return;
      }

      const { data: assignmentsData, error: assignErr } = await query
        .order('created_at', { ascending: false });

      if (assignErr) {
        console.error('Failed to load exercise assignments', assignErr);
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
      case 'easy': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-16">
        <h1 className="text-2xl font-bold text-slate-900">Exercises</h1>
        <Search className="h-6 w-6 text-slate-500" />
      </div>

      {/* Exercise Cards */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <div className="clay-card clay-fade-in max-w-md w-full text-center p-8 space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-inner">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Loading Exercises</h3>
                <p className="text-sm text-muted-foreground">Please wait while we fetch your assigned exercises...</p>
              </div>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <div className="clay-card clay-fade-in max-w-md w-full text-center p-8 space-y-6">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-inner">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">No Exercises Yet</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No exercises have been assigned to you by your physiotherapist yet.
                  Please wait - they will appear here as soon as they become available.
                </p>
              </div>

              {/* Decorative elements */}
              <div className="flex justify-center space-x-2 opacity-60">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>

              {/* Helpful tip */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-emerald-800 font-medium">
                  💡 Tip: Your physiotherapist will assign personalized exercises based on your assessment and progress.
                </p>
              </div>
            </div>
          </div>
        ) : (
          assignments.map((a) => {
            const v = a.video;
            if (!v) return null;
            const difficulty = (v.difficulty || 'assigned') as string;
            const duration = typeof v.duration_seconds === 'number' ? `${v.duration_seconds} sec` : null;
            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-200 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img
                    src={v.thumbnail_url || '/placeholder.svg'}
                    alt={v.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 truncate pr-2">{v.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getDifficultyColor(String(difficulty))}`}>
                      {String(difficulty).charAt(0).toUpperCase() + String(difficulty).slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    {duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>{duration}</span>
                      </div>
                    )}
                    {v.category && (
                      <div className="flex items-center gap-1">
                        <RotateCcw className="h-4 w-4 text-yellow-500" />
                        <span>{v.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={() => setOpenVideoId(v.id)}
                    className="inline-flex mt-3 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors items-center gap-2"
                  >
                    Start
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Video Player Dialog */}
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
                      className="h-full w-full rounded-md bg-black"
                    />
                  </AspectRatio>
                  {v.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{v.description}</p>
                  )}
                  {assignments.find((a) => a.video?.id === openVideoId)?.notes && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignments.find((a) => a.video?.id === openVideoId)?.notes}</p>
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
