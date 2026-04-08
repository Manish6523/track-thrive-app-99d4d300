import { useState, useEffect } from "react";
import { Dumbbell, Check } from "lucide-react";
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

  return (
    <div className="px-5 pt-14 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workout</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {today?.isRest ? "Rest day — take it easy" : `${today?.type} day • ${completedCount}/${totalExercises} done`}
          </p>
        </div>
        <EditWorkoutDialog workouts={workouts} onSave={handleSaveWorkouts} />
      </div>

      {/* Today's Exercises */}
      {today && !today.isRest && (
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today's Exercises</p>
          {today.exercises.map((ex) => {
            const key = `${today.day}-${ex.name}`;
            const isDone = checked[key];
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`w-full flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
                  isDone ? "border-primary/30 bg-primary/5" : "bg-card"
                }`}
              >
                <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isDone ? "border-primary bg-primary" : "border-muted-foreground/30"
                }`}>
                  {isDone && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDone ? "text-primary line-through" : "text-foreground"}`}>
                    {ex.name}
                  </p>
                  {ex.sets && (
                    <p className="text-xs text-muted-foreground mt-0.5">{ex.sets}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {today?.isRest && (
        <div className="rounded-2xl bg-card border p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Dumbbell className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">Rest Day</p>
          <p className="text-sm text-muted-foreground mt-1">Recovery is part of the process</p>
        </div>
      )}

      {/* Weekly Plan */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Week</p>
        <div className="grid grid-cols-7 gap-1.5">
          {workouts.map((day, i) => (
            <div
              key={day.day}
              className={`rounded-xl p-2 text-center transition-all ${
                i === todayIdx
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border"
              }`}
            >
              <p className={`text-[10px] font-medium ${i === todayIdx ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {day.day.slice(0, 3)}
              </p>
              <p className={`text-[10px] font-semibold mt-0.5 ${i === todayIdx ? "" : day.isRest ? "text-muted-foreground" : "text-foreground"}`}>
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
