import { useState, useEffect } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DIET_DATA, loadProgress, saveProgress } from "@/lib/fitness-data";

const STORAGE_KEY = "dietProgress";

interface DietTableProps {
  onProgressChange: (completed: number, total: number) => void;
}

const DietTable = ({ onProgressChange }: DietTableProps) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadProgress(STORAGE_KEY));

  useEffect(() => {
    saveProgress(STORAGE_KEY, checked);
    const completed = Object.values(checked).filter(Boolean).length;
    onProgressChange(completed, DIET_DATA.length);
  }, [checked, onProgressChange]);

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">Diet Plan</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-10 px-5 py-3"></th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Time</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Meal</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Food</th>
            </tr>
          </thead>
          <tbody>
            {DIET_DATA.map((meal) => {
              const key = meal.time;
              const isDone = checked[key];
              return (
                <tr
                  key={key}
                  onClick={() => toggle(key)}
                  className={`border-b last:border-0 cursor-pointer transition-colors ${
                    isDone ? "bg-success/5" : "hover:bg-muted/40"
                  }`}
                >
                  <td className="px-5 py-3">
                    <Checkbox checked={isDone} className="pointer-events-none" />
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap font-medium text-card-foreground">
                    {meal.time}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isDone
                          ? "bg-success/10 text-success"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {meal.name}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3 ${
                      isDone ? "text-success line-through" : "text-card-foreground"
                    }`}
                  >
                    {meal.food}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DietTable;
