import { useState, useEffect } from "react";
import { Dumbbell, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { loadProgress, saveProgress } from "@/lib/fitness-data";
import { loadCustomWorkouts, saveCustomWorkouts } from "@/lib/fitness-store";
import { useIsMobile } from "@/hooks/use-mobile";
import EditWorkoutDialog from "./EditWorkoutDialog";
import type { WorkoutDay } from "@/lib/fitness-data";

const STORAGE_KEY = "workoutProgress";

interface WorkoutTableProps {
  onProgressChange: (completed: number, total: number) => void;
}

const WorkoutTable = ({ onProgressChange }: WorkoutTableProps) => {
  const isMobile = useIsMobile();
  const [workouts, setWorkouts] = useState<WorkoutDay[]>(() => loadCustomWorkouts());
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadProgress(STORAGE_KEY));
  const [viewMode, setViewMode] = useState<"table" | "card">(isMobile ? "card" : "table");

  const dayIndex = new Date().getDay();
  const dayMap = [6, 0, 1, 2, 3, 4, 5];
  const todayIdx = dayMap[dayIndex];
  const today = workouts[todayIdx];
  const totalExercises = today?.isRest ? 0 : (today?.exercises.length ?? 0);

  useEffect(() => {
    if (isMobile) setViewMode("card");
  }, [isMobile]);

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

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Dumbbell className="h-5 w-5" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Workout Plan</h2>
        </div>
        <div className="flex items-center gap-2">
          <EditWorkoutDialog workouts={workouts} onSave={handleSaveWorkouts} />
          <div className="flex gap-1 rounded-lg border p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Day</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Exercises</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((day, di) => (
                <tr key={day.day} className={`border-b last:border-0 transition-colors ${di === todayIdx ? "bg-primary/5" : ""}`}>
                  <td className="px-5 py-3 font-medium text-card-foreground whitespace-nowrap">
                    {day.day}
                    {di === todayIdx && (
                      <span className="ml-2 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Today</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${day.isRest ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                      {day.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {day.exercises.map((ex) => {
                        const key = `${day.day}-${ex.name}`;
                        const isDone = checked[key];
                        const isToday = di === todayIdx && !day.isRest;
                        return (
                          <button
                            key={key}
                            onClick={() => isToday && toggle(key)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                              isDone ? "border-success bg-success/10 text-success" : isToday ? "border-border hover:border-primary/40 text-card-foreground cursor-pointer" : "border-border text-muted-foreground cursor-default"
                            }`}
                          >
                            {isToday && <Checkbox checked={isDone} className="h-3.5 w-3.5 pointer-events-none" />}
                            {ex.name}
                            {ex.sets && <span className="text-muted-foreground">({ex.sets})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-2 p-3 sm:gap-3 sm:p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workouts.map((day, di) => (
            <div key={day.day} className={`rounded-xl border p-3 sm:p-4 transition-colors ${di === todayIdx ? "border-primary/40 bg-primary/5" : ""}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="font-semibold text-sm sm:text-base text-card-foreground">
                  {day.day}
                  {di === todayIdx && (
                    <span className="ml-2 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Today</span>
                  )}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${day.isRest ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  {day.type}
                </span>
              </div>
              <div className="space-y-1.5">
                {day.exercises.map((ex) => {
                  const key = `${day.day}-${ex.name}`;
                  const isDone = checked[key];
                  const isToday = di === todayIdx && !day.isRest;
                  return (
                    <button
                      key={key}
                      onClick={() => isToday && toggle(key)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-left text-xs sm:text-sm transition-all ${
                        isDone ? "bg-success/10 text-success" : isToday ? "hover:bg-muted/60 text-card-foreground cursor-pointer" : "text-muted-foreground cursor-default"
                      }`}
                    >
                      {isToday && <Checkbox checked={isDone} className="h-3.5 w-3.5 sm:h-4 sm:w-4 pointer-events-none" />}
                      <span>
                        {ex.name}
                        {ex.sets && <span className="ml-1 text-[10px] sm:text-xs text-muted-foreground">{ex.sets}</span>}
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

export default WorkoutTable;
