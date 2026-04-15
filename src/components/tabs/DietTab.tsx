import { useState, useEffect } from "react";
import { Check, Clock, Apple } from "lucide-react";
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
    <div className="px-4 pt-12 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Nutrition</p>
          <h1 className="text-xl font-extrabold text-foreground mt-0.5">Diet Plan</h1>
        </div>
        <EditDietDialog meals={meals} onSave={handleSaveMeals} />
      </div>

      {/* Progress Card */}
      <div className="rounded-2xl bg-gradient-to-br from-secondary/15 to-transparent border border-secondary/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Apple className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Meals</p>
              <p className="text-[10px] text-muted-foreground">{completedCount}/{meals.length} completed</p>
            </div>
          </div>
          <span className="text-2xl font-black text-secondary">{pct}%</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Meal List */}
      <div className="space-y-1.5 stagger">
        {meals.map((meal, idx) => {
          const key = meal.time;
          const isDone = checked[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`animate-fade-up w-full flex items-center gap-3 rounded-xl p-3.5 text-left transition-all duration-200 active:scale-[0.98] ${
                isDone
                  ? "bg-secondary/10 border border-secondary/25"
                  : "bg-card border border-border/40 hover:border-secondary/20"
              }`}
            >
              <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                isDone ? "border-secondary bg-secondary" : "border-muted-foreground/20"
              }`}>
                {isDone && <Check className="h-3.5 w-3.5 text-secondary-foreground" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isDone ? "text-secondary line-through" : "text-foreground"}`}>
                    {meal.name}
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-medium">
                    <Clock className="h-2.5 w-2.5" /> {meal.time}
                  </span>
                </div>
                <p className={`text-[11px] mt-1 leading-relaxed ${isDone ? "text-muted-foreground/40 line-through" : "text-muted-foreground"}`}>
                  {meal.food}
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-muted-foreground/30 shrink-0">
                #{idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DietTab;
