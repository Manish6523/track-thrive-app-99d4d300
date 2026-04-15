import { useState, useEffect } from "react";
import { Dumbbell, Check, Sparkles, Trophy } from "lucide-react";
import { loadProgress, saveProgress } from "@/lib/fitness-data";
import { loadCustomWorkouts, saveCustomWorkouts } from "@/lib/fitness-store";
import EditWorkoutDialog from "@/components/EditWorkoutDialog";
import type { WorkoutDay, Exercise } from "@/lib/fitness-data";

const STORAGE_KEY = "workoutProgress";

interface WorkoutTabProps {
  onProgressChange: (completed: number, total: number) => void;
}

/** Group exercises by their `group` field, preserving order of first appearance */
function groupExercises(exercises: Exercise[]): { group: string; items: { exercise: Exercise; originalIdx: number }[] }[] {
  const groups: { group: string; items: { exercise: Exercise; originalIdx: number }[] }[] = [];
  const groupMap = new Map<string, number>();
  exercises.forEach((ex, idx) => {
    const g = ex.group || "Exercises";
    if (groupMap.has(g)) {
      groups[groupMap.get(g)!].items.push({ exercise: ex, originalIdx: idx });
    } else {
      groupMap.set(g, groups.length);
      groups.push({ group: g, items: [{ exercise: ex, originalIdx: idx }] });
    }
  });
  return groups;
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
  const exerciseGroups = today && !today.isRest ? groupExercises(today.exercises) : [];

  return (
    <div className="px-4 pt-10 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
            {today?.day}
          </p>
          <h1 className="text-2xl font-black text-foreground mt-0.5">
            {today?.isRest ? "Rest Day" : today?.type}
          </h1>
        </div>
        <EditWorkoutDialog workouts={workouts} onSave={handleSaveWorkouts} />
      </div>

      {/* Progress */}
      {!today?.isRest && (
        <div className="rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Progress</p>
                <p className="text-[10px] text-muted-foreground">{completedCount}/{totalExercises} done</p>
              </div>
            </div>
            <span className="text-xl font-black text-primary">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Grouped Exercises */}
      {today && !today.isRest && (
        <div className="space-y-4">
          {exerciseGroups.map((group) => (
            <div key={group.group}>
              {/* Group heading */}
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <span className="text-[10px] font-extrabold text-primary/80 uppercase tracking-[0.2em]">
                  {group.group}
                </span>
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-[10px] text-muted-foreground font-medium">{group.items.length}</span>
              </div>
              <div className="space-y-1.5">
                {group.items.map(({ exercise: ex, originalIdx: idx }) => {
                  const key = `${today.day}-${ex.name}`;
                  const isDone = checked[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      className={`w-full flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-300 active:scale-[0.98] ${
                        isDone
                          ? "bg-primary/10 border border-primary/25"
                          : "bg-card border border-border/30 hover:border-border/60"
                      }`}
                    >
                      <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isDone ? "border-primary bg-primary shadow-lg shadow-primary/25" : "border-muted-foreground/25"
                      }`}>
                        {isDone && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold transition-colors ${isDone ? "text-primary" : "text-foreground"}`}>
                          {ex.name}
                        </p>
                        {ex.sets && (
                          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{ex.sets}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/50 shrink-0">
                        #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rest Day */}
      {today?.isRest && (
        <div className="rounded-3xl bg-gradient-to-br from-card to-card/80 border border-border/30 p-10 text-center">
          <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl font-black text-foreground">Rest Day</p>
          <p className="text-sm text-muted-foreground mt-1.5">Recovery is part of the process 💤</p>
        </div>
      )}

      {/* Weekly Plan */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Weekly Schedule</p>
        <div className="grid grid-cols-7 gap-1">
          {workouts.map((day, i) => (
            <div
              key={day.day}
              className={`rounded-xl p-2 text-center transition-all ${
                i === todayIdx
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card border border-border/30"
              }`}
            >
              <p className={`text-[9px] font-bold ${i === todayIdx ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {day.day.slice(0, 2)}
              </p>
              <p className={`text-[9px] font-extrabold mt-0.5 ${i === todayIdx ? "" : day.isRest ? "text-muted-foreground/50" : "text-foreground"}`}>
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
