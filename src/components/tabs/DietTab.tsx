import { useState, useEffect } from "react";
import { UtensilsCrossed, Check, Clock } from "lucide-react";
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

  return (
    <div className="px-5 pt-14 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {completedCount}/{meals.length} meals completed
          </p>
        </div>
        <EditDietDialog meals={meals} onSave={handleSaveMeals} />
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
              className={`w-full flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
                isDone ? "border-primary/30 bg-primary/5" : "bg-card"
              }`}
            >
              <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                isDone ? "border-primary bg-primary" : "border-muted-foreground/30"
              }`}>
                {isDone && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDone ? "text-primary line-through" : "text-foreground"}`}>
                    {meal.name}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> {meal.time}
                  </span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isDone ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
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
