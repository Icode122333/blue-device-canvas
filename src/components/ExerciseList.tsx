import { Dumbbell, Clock, ChevronRight, User, Heart } from "lucide-react";

// Light-mode adaptation of nike_design_system.json
// - Accent brand: #c5f82a
// - Cards: white background, subtle border/shadow
// - Typography: dark text for readability

const exercises = [
  {
    id: 1,
    title: "Full Body Mobility",
    difficulty: "Beginner",
    duration: "10 min",
    instructor: "Alex Morgan",
    liked: true,
  },
  {
    id: 2,
    title: "Core Strength Blast",
    difficulty: "Intermediate",
    duration: "15 min",
    instructor: "Jordan Lee",
    liked: false,
  },
  {
    id: 3,
    title: "Balance & Stability",
    difficulty: "Intermediate",
    duration: "12 min",
    instructor: "Taylor Brooks",
    liked: false,
  },
];

export const ExerciseList = () => {
  return (
    <section className="p-4">
      {/* Section Header (light-mode) */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold leading-tight text-slate-900">Today's Exercises</h2>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5f82a]"
          aria-label="View all exercises"
        >
          View all
        </button>
      </div>

      {/* Workout Cards (horizontal) */}
      <div className="space-y-3">
        {exercises.map((ex) => (
          <article
            key={ex.id}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-[#c5f82a]"
          >
            {/* Thumbnail */}
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Dumbbell className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[16px] font-medium text-slate-900">{ex.title}</h3>

              {/* Metadata */}
              <div className="mt-1 flex flex-wrap items-center gap-4 text-[12px] text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5" /> {ex.difficulty}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {ex.duration}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {ex.instructor}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5f82a] ${
                  ex.liked
                    ? "bg-[#ff4757]/10 text-[#ff4757] hover:bg-[#ff4757]/20"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
                aria-label={ex.liked ? "Unfavorite" : "Favorite"}
              >
                <Heart className={`h-5 w-5 ${ex.liked ? "fill-[#ff4757]" : ""}`} />
              </button>

              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-900 ring-offset-transparent transition-colors hover:text-[#c5f82a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5f82a]"
                aria-label="Open exercise"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
