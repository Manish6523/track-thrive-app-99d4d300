import { useState, useEffect } from "react";
import { Check, Clock } from "lucide-react";
import { loadProgress, saveProgress } from "@/lib/fitness-data";
import { loadCustomDiet, saveCustomDiet } from "@/lib/fitness-store";
import EditDietDialog from "@/components/EditDietDialog";
import type { Meal } from "@/lib/fitness-data";

const STORAGE_KEY = "dietProgress";

interface DietTabProps {
  onProgressChange: (completed: number, total: number) => void;
}

const DietTab = ({ onProgressChange }: DietTabProps) => {
  const [meals, setMeals] = useState<Meal[]>(() => loadCustomDiet());
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadProgress(STORAGE_KEY));

  useEffect(() => {
    saveProgress(STORAGE_KEY, checked);
    const completed = Object.values(checked).filter(Boolean).length;
    onProgressChange(completed, meals.length);
  }, [checked, meals.length, onProgressChange]);

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveMeals = (updated: Meal[]) => {
    saveCustomDiet(updated);
    setMeals(updated);
    setChecked({});
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const pct = meals.length === 0 ? 0 : Math.round((completedCount / meals.length) * 100);

  return (
    <div className="px-5 pt-12 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Diet</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {completedCount}/{meals.length} meals completed
          </p>
        </div>
        <EditDietDialog meals={meals} onSave={handleSaveMeals} />
      </div>

      {/* Progress */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nutrition</span>
          <span className="text-sm font-black text-[hsl(var(--chart-2))]">{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--chart-2))] to-[hsl(var(--chart-2))]/80 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-2.5">
        {meals.map((meal) => {
          const key = meal.time;
          const isDone = checked[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`w-full flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.98] ${
                isDone
                  ? "border-[hsl(var(--chart-2))]/30 bg-[hsl(var(--chart-2))]/8"
                  : "bg-card border-border/50 hover:border-border"
              }`}
            >
              <div className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                isDone ? "border-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2))]" : "border-muted-foreground/30"
              }`}>
                {isDone && <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isDone ? "text-[hsl(var(--chart-2))]" : "text-foreground"}`}>
                    {meal.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    <Clock className="h-2.5 w-2.5" /> {meal.time}
                  </span>
                </div>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDone ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                  {meal.food}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DietTab;
