import { useState, useEffect } from "react";
import { Check, Flame } from "lucide-react";
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

const WorkoutTab = ({ onProgressChange }: WorkoutTabProps) => {
  const [allWorkouts, setAllWorkouts] = useState<WorkoutDay[]>(() => loadCustomWorkouts());
  const todayDayIdx = (() => {
    const dayIndex = new Date().getDay();
    const dayMap = [6, 0, 1, 2, 3, 4, 5];
    return dayMap[dayIndex];
  })();
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayDayIdx);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadProgress(STORAGE_KEY));

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

  return (
    <div className="px-4 pt-12 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Your Plan</p>
          <h1 className="text-xl font-extrabold text-foreground mt-0.5">Workout</h1>
        </div>
        <EditWorkoutDialog workouts={allWorkouts} onSave={handleSave} />
      </div>

      {/* Day Selector */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        {DAYS.map((d, i) => {
          const isSelected = i === selectedDayIdx;
          const isToday = i === todayDayIdx;
          return (
            <button
              key={d}
              onClick={() => setSelectedDayIdx(i)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : isToday
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-card text-muted-foreground border border-border/40 hover:border-border"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Progress Card */}
      {!todayWorkout?.isRest && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-transparent border border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{todayWorkout?.type || "Workout"}</p>
                <p className="text-[10px] text-muted-foreground">{completedCount}/{totalCount} exercises</p>
              </div>
            </div>
            <span className="text-2xl font-black text-primary">{pct}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Exercise Groups */}
      {todayWorkout?.isRest ? (
        <div className="rounded-2xl bg-card border border-border/40 p-8 text-center">
          <div className="text-3xl mb-2">🧘</div>
          <p className="text-sm font-bold text-foreground">Rest Day</p>
          <p className="text-xs text-muted-foreground mt-1">Recovery is part of the journey</p>
        </div>
      ) : (
        <div className="space-y-4 stagger">
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
      )}
    </div>
  );
};

export default WorkoutTab;
