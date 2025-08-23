import { useState } from "react";
import { Search, ChevronRight, Clock, RotateCcw } from "lucide-react";

const categories = [
  { id: "cardio", label: "Cardio" },
  { id: "strength", label: "Strength" },
  { id: "stretching", label: "Stretching" },
  { id: "fullbody", label: "Full Body" },
];

const exercises = [
  {
    id: 1,
    title: "Dumbbell Shoulder Press",
    difficulty: "Easy",
    duration: "30 sec",
    reps: "3 reps",
    category: "strength",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Bench Press",
    difficulty: "Medium",
    duration: "30 sec",
    reps: "4 reps",
    category: "strength",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    title: "Battle Ropes",
    difficulty: "Hard",
    duration: "30 sec",
    reps: "4 reps",
    category: "cardio",
    image: "/placeholder.svg"
  },
  {
    id: 4,
    title: "Seated Dumbbell Shoulder Press",
    difficulty: "Hard",
    duration: "30 sec",
    reps: "4 reps",
    category: "strength",
    image: "/placeholder.svg"
  },
];

export const ExerciseList = () => {
  const [activeCategory, setActiveCategory] = useState("strength");

  const filteredExercises = exercises.filter(ex => ex.category === activeCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-16">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Search className="h-6 w-6 text-gray-400" />
      </div>

      {/* Category Pills */}
      <div className="px-4 pb-4">
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-green-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="px-4 space-y-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4"
          >
            {/* Exercise Image */}
            <div className="w-20 h-20 rounded-xl bg-gray-700 overflow-hidden flex-shrink-0">
              <img 
                src={exercise.image} 
                alt={exercise.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Exercise Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-white truncate pr-2">
                  {exercise.title}
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>
              </div>

              {/* Duration and Reps */}
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>{exercise.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4 text-yellow-500" />
                  <span>{exercise.reps}</span>
                </div>
              </div>

              {/* Start Button */}
              <button className="mt-3 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                Start
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
