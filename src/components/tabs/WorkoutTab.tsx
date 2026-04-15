import { useState, useEffect } from "react";
import { Check, Flame, Zap } from "lucide-react";
import { loadProgress, saveProgress, getTodayWorkout } from "@/lib/fitness-data";
import { loadCustomWorkouts, saveCustomWorkouts } from "@/lib/fitness-store";
import EditWorkoutDialog from "@/components/EditWorkoutDialog";
import type { WorkoutDay } from "@/lib/fitness-data";

const STORAGE_KEY = "workoutProgress";

interface WorkoutTabProps {
  onProgressChange: (completed: number, total: number) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function groupExercises(exercises: WorkoutDay["exercises"]) {
  const groups: { group: string; items: typeof exercises }[] = [];
  exercises.forEach((ex) => {
    const g = ex.group || "General";
    const last = groups[groups.length - 1];
    if (last && last.group === g) {
      last.items.push(ex);
    } else {
      groups.push({ group: g, items: [ex] });
    }
  });
  return groups;
}

// Workout categories for the filter
const CATEGORIES = ["All workouts", "Lower body", "Upper body"];

const WorkoutTab = ({ onProgressChange }: WorkoutTabProps) => {
  const [allWorkouts, setAllWorkouts] = useState<WorkoutDay[]>(() => loadCustomWorkouts());
  const todayDayIdx = (() => {
    const dayIndex = new Date().getDay();
    const dayMap = [6, 0, 1, 2, 3, 4, 5];
    return dayMap[dayIndex];
  })();
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayDayIdx);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadProgress(STORAGE_KEY));
  const [activeCategory, setActiveCategory] = useState("All workouts");

  const todayWorkout = allWorkouts[selectedDayIdx];

  useEffect(() => {
    saveProgress(STORAGE_KEY, checked);
    const todayW = allWorkouts[todayDayIdx];
    const total = todayW?.isRest ? 0 : (todayW?.exercises.length ?? 0);
    const completed = Object.values(checked).filter(Boolean).length;
    onProgressChange(completed, total);
  }, [checked, allWorkouts, todayDayIdx, onProgressChange]);

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (updated: WorkoutDay[]) => {
    saveCustomWorkouts(updated);
    setAllWorkouts(updated);
    setChecked({});
  };

  const completedCount = todayWorkout ? todayWorkout.exercises.filter((ex) => checked[ex.name]).length : 0;
  const totalCount = todayWorkout?.isRest ? 0 : (todayWorkout?.exercises.length ?? 0);
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const groups = todayWorkout && !todayWorkout.isRest ? groupExercises(todayWorkout.exercises) : [];

  // Calculate calories from workout
  const caloriesBurned = Math.round(538 * (pct / 100));

  return (
    <div className="px-5 pt-14 pb-6 space-y-5">
      {/* Header with avatar and greeting */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/30">
            <img src="/profile-avatar.png" alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-foreground uppercase tracking-wide" style={{ fontStyle: 'italic' }}>
              HI Manish
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-muted-foreground">Fitness Freak</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditWorkoutDialog workouts={allWorkouts} onSave={handleSave} />
          <button className="h-10 w-10 rounded-full bg-card border border-border/40 flex items-center justify-center">
            <img src="/profile-avatar.png" alt="Profile" className="h-full w-full object-cover rounded-full" />
          </button>
        </div>
      </div>

      {/* Progress Card - Lavender with stats */}
      <div className="animate-fade-up rounded-2xl overflow-hidden" style={{ background: 'hsl(270, 60%, 82%)' }}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Progress</p>
            <h2 className="text-xl font-extrabold text-black mt-1" style={{ fontStyle: 'italic' }}>
              {todayWorkout?.isRest ? "Rest Day" : todayWorkout?.type || "Workout"}
            </h2>
            <p className="text-[10px] text-black/60 font-medium mt-0.5">
              {todayWorkout?.isRest ? "Recovery" : "Cardio"} · {totalCount > 0 ? `${totalCount * 2} mins` : "Rest"}
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-black">{caloriesBurned}</span>
              <div className="flex flex-col">
                <Flame className="h-4 w-4 text-black/40" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-black/50 uppercase">CALORIES</p>
          </div>
          {/* Progress circle */}
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="5" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - pct / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-black/70">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Plan Section */}
      <div className="animate-fade-up">
        <h2 className="text-xl font-extrabold text-foreground mb-3" style={{ fontStyle: 'italic' }}>
          Your plan
        </h2>
        
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Workout Cards */}
      {todayWorkout?.isRest ? (
        <div className="rounded-2xl bg-card border border-border/40 p-8 text-center animate-fade-up">
          <div className="text-3xl mb-2">🧘</div>
          <p className="text-sm font-bold text-foreground">Rest Day</p>
          <p className="text-xs text-muted-foreground mt-1">Recovery is part of the journey</p>
        </div>
      ) : (
        <div className="space-y-4 stagger">
          {/* Lower body workout card */}
          <div className="animate-fade-up rounded-2xl overflow-hidden" style={{ background: 'hsl(270, 60%, 82%)' }}>
            <div className="flex items-stretch">
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold text-black" style={{ fontStyle: 'italic' }}>
                    Lower body workout
                  </h3>
                  <span className="text-[10px] font-bold text-black/50 bg-black/10 px-2.5 py-1 rounded-full">
                    30 mins
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-black/10 text-black/70 px-2 py-0.5 rounded-md">Cardio</span>
                  <span className="text-[10px] text-black/50">{todayWorkout.exercises.length} exercises</span>
                </div>
                <p className="text-[11px] text-black/60 mt-2 font-medium">
                  Glutes / Squats / Hamstrings
                </p>
              </div>
              <div className="w-28 relative">
                <img src="/lower-body.png" alt="Lower body" className="w-full h-full object-cover workout-card-img" />
              </div>
            </div>
          </div>

          {/* Upper body workout card */}
          <div className="animate-fade-up rounded-2xl overflow-hidden" style={{ background: 'hsl(72, 70%, 55%)' }}>
            <div className="flex items-stretch">
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold text-black" style={{ fontStyle: 'italic' }}>
                    Upper body workout
                  </h3>
                  <span className="text-[10px] font-bold text-black/50 bg-black/10 px-2.5 py-1 rounded-full">
                    20 mins
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-black/10 text-black/70 px-2 py-0.5 rounded-md">Strength</span>
                  <span className="text-[10px] text-black/50">{todayWorkout.exercises.length} exercises</span>
                </div>
                <p className="text-[11px] text-black/60 mt-2 font-medium">
                  Chest / Shoulders / Triceps
                </p>
              </div>
              <div className="w-28 relative">
                <img src="/upper-body.png" alt="Upper body" className="w-full h-full object-cover workout-card-img" />
              </div>
            </div>
          </div>

          {/* Exercise List (existing functionality preserved) */}
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-extrabold text-foreground" style={{ fontStyle: 'italic' }}>
              Today's Exercises
            </h3>
            {groups.map((g) => (
              <div key={g.group} className="animate-fade-up">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em]">{g.group}</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                </div>

                <div className="space-y-1.5">
                  {g.items.map((ex, idx) => {
                    const isDone = checked[ex.name];
                    return (
                      <button
                        key={ex.name + idx}
                        onClick={() => toggle(ex.name)}
                        className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 active:scale-[0.98] ${
                          isDone
                            ? "bg-primary/10 border border-primary/25"
                            : "bg-card border border-border/40 hover:border-primary/20"
                        }`}
                      >
                        <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          isDone ? "border-primary bg-primary" : "border-muted-foreground/20"
                        }`}>
                          {isDone && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-bold ${isDone ? "text-primary line-through" : "text-foreground"}`}>
                            {ex.name}
                          </span>
                        </div>
                        <span className={`text-xs font-bold shrink-0 px-2 py-1 rounded-lg ${
                          isDone ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {ex.sets}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTab;
