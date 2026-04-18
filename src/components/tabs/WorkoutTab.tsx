import { useState, useEffect } from "react";
import { Check, Zap } from "lucide-react";
import { loadProgress, saveProgress } from "@/lib/fitness-data";
import { loadCustomWorkouts, saveCustomWorkouts } from "@/lib/fitness-store";
import EditWorkoutDialog from "@/components/EditWorkoutDialog";
import type { WorkoutDay } from "@/lib/fitness-data";

const STORAGE_KEY = "workoutProgress";

interface WorkoutTabProps {
  onProgressChange: (completed: number, total: number) => void;
}

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

const WorkoutTab = ({ onProgressChange }: WorkoutTabProps) => {
  const [allWorkouts, setAllWorkouts] = useState<WorkoutDay[]>(() => loadCustomWorkouts());
  const todayDayIdx = (() => {
    const dayIndex = new Date().getDay();
    const dayMap = [6, 0, 1, 2, 3, 4, 5];
    return dayMap[dayIndex];
  })();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadProgress(STORAGE_KEY));

  const todayWorkout = allWorkouts[todayDayIdx];

  useEffect(() => {
    saveProgress(STORAGE_KEY, checked);
    const total = todayWorkout?.isRest ? 0 : (todayWorkout?.exercises.length ?? 0);
    const completed = Object.values(checked).filter(Boolean).length;
    onProgressChange(completed, total);
  }, [checked, todayWorkout, onProgressChange]);

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

  return (
    <div className="px-5 pt-14 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(72, 100%, 50%)' }}>
            Today's Session
          </p>
          <h1 className="text-xl font-extrabold text-foreground mt-0.5" style={{ fontStyle: 'italic' }}>
            Workout
          </h1>
        </div>
        <EditWorkoutDialog workouts={allWorkouts} onSave={handleSave} />
      </div>

      {/* Progress Card */}
      <div className="animate-fade-up rounded-2xl overflow-hidden" style={{ background: 'hsl(270, 60%, 82%)' }}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Progress</p>
            <h2 className="text-xl font-extrabold text-black mt-1" style={{ fontStyle: 'italic' }}>
              {todayWorkout?.isRest ? "Rest Day" : todayWorkout?.type || "Workout"}
            </h2>
            <p className="text-[11px] text-black/60 font-medium mt-0.5">
              {todayWorkout?.isRest ? "Recovery day" : `${completedCount} / ${totalCount} exercises`}
            </p>
            <div className="mt-3 h-2 rounded-full bg-black/10 overflow-hidden w-40">
              <div
                className="h-full rounded-full bg-black/40 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="relative h-20 w-20 shrink-0">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="5" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="rgba(0,0,0,0.55)"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - pct / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-black/80">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises */}
      {todayWorkout?.isRest ? (
        <div className="rounded-2xl bg-card border border-border/40 p-8 text-center animate-fade-up">
          <div className="text-3xl mb-2">🧘</div>
          <p className="text-sm font-bold text-foreground">Rest Day</p>
          <p className="text-xs text-muted-foreground mt-1">Recovery is part of the journey</p>
        </div>
      ) : (
        <div className="space-y-4 stagger">
          {groups.map((g) => (
            <div key={g.group} className="animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-3 w-3" style={{ color: 'hsl(72, 100%, 50%)' }} />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: 'hsl(72, 100%, 50%)' }}>{g.group}</span>
                <div className="h-px flex-1 bg-border/40" />
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
      )}
    </div>
  );
};

export default WorkoutTab;
