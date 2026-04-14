import { useState, useEffect } from "react";
import { Dumbbell, Check, ChevronRight } from "lucide-react";
import { loadProgress, saveProgress } from "@/lib/fitness-data";
import { loadCustomWorkouts, saveCustomWorkouts } from "@/lib/fitness-store";
import EditWorkoutDialog from "@/components/EditWorkoutDialog";
import type { WorkoutDay } from "@/lib/fitness-data";

const STORAGE_KEY = "workoutProgress";

interface WorkoutTabProps {
  onProgressChange: (completed: number, total: number) => void;
}

const WorkoutTab = ({ onProgressChange }: WorkoutTabProps) => {
  const [workouts, setWorkouts] = useState<WorkoutDay[]>(() => loadCustomWorkouts());
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadProgress(STORAGE_KEY));

  const dayIndex = new Date().getDay();
  const dayMap = [6, 0, 1, 2, 3, 4, 5];
  const todayIdx = dayMap[dayIndex];
  const today = workouts[todayIdx];
  const totalExercises = today?.isRest ? 0 : (today?.exercises.length ?? 0);

  useEffect(() => {
    saveProgress(STORAGE_KEY, checked);
    const completed = Object.values(checked).filter(Boolean).length;
    onProgressChange(completed, totalExercises);
  }, [checked, totalExercises, onProgressChange]);

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveWorkouts = (updated: WorkoutDay[]) => {
    saveCustomWorkouts(updated);
    setWorkouts(updated);
    setChecked({});
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const pct = totalExercises === 0 ? 0 : Math.round((completedCount / totalExercises) * 100);

  return (
    <div className="px-5 pt-12 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Workout</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {today?.isRest ? "Rest day — take it easy 😴" : `${today?.type} day`}
          </p>
        </div>
        <EditWorkoutDialog workouts={workouts} onSave={handleSaveWorkouts} />
      </div>

      {/* Progress bar */}
      {!today?.isRest && (
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
            <span className="text-sm font-black text-primary">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">{completedCount} of {totalExercises} exercises completed</p>
        </div>
      )}

      {/* Today's Exercises */}
      {today && !today.isRest && (
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Today's Exercises</p>
          {today.exercises.map((ex, idx) => {
            const key = `${today.day}-${ex.name}`;
            const isDone = checked[key];
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.98] ${
                  isDone
                    ? "border-primary/30 bg-primary/8"
                    : "bg-card border-border/50 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-center text-xs font-black text-muted-foreground w-6">
                  {idx + 1}
                </div>
                <div className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone ? "border-primary bg-primary" : "border-muted-foreground/30"
                }`}>
                  {isDone && <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold transition-colors ${isDone ? "text-primary" : "text-foreground"}`}>
                    {ex.name}
                  </p>
                  {ex.sets && (
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{ex.sets}</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {today?.isRest && (
        <div className="rounded-3xl bg-card border border-border/50 p-10 text-center">
          <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-extrabold text-foreground">Rest Day</p>
          <p className="text-sm text-muted-foreground mt-1">Recovery is part of the process 💤</p>
        </div>
      )}

      {/* Weekly Plan */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">This Week</p>
        <div className="grid grid-cols-7 gap-1.5">
          {workouts.map((day, i) => (
            <div
              key={day.day}
              className={`rounded-2xl p-2.5 text-center transition-all ${
                i === todayIdx
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "bg-card border border-border/50"
              }`}
            >
              <p className={`text-[10px] font-bold ${i === todayIdx ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {day.day.slice(0, 3)}
              </p>
              <p className={`text-[10px] font-extrabold mt-0.5 ${i === todayIdx ? "" : day.isRest ? "text-muted-foreground" : "text-foreground"}`}>
                {day.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTab;
