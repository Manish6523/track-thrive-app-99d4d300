import { useState, useEffect } from "react";
import { UtensilsCrossed, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DIET_DATA, loadProgress, saveProgress } from "@/lib/fitness-data";
import { useIsMobile } from "@/hooks/use-mobile";

const STORAGE_KEY = "dietProgress";

interface DietTableProps {
  onProgressChange: (completed: number, total: number) => void;
}

const DietTable = ({ onProgressChange }: DietTableProps) => {
  const isMobile = useIsMobile();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadProgress(STORAGE_KEY));
  const [viewMode, setViewMode] = useState<"table" | "card">(isMobile ? "card" : "table");

  useEffect(() => {
    if (isMobile) setViewMode("card");
  }, [isMobile]);

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
      <div className="flex items-center justify-between border-b p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Diet Plan</h2>
        </div>
        <div className="flex gap-1 rounded-lg border p-0.5">
          <button
            onClick={() => setViewMode("table")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "table"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "card"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
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
                          isDone ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
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
      ) : (
        <div className="grid gap-2 p-3 sm:p-5 sm:grid-cols-2">
          {DIET_DATA.map((meal) => {
            const key = meal.time;
            const isDone = checked[key];
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-start gap-3 rounded-xl border p-3 sm:p-4 text-left transition-all w-full ${
                  isDone
                    ? "border-success/30 bg-success/5"
                    : "hover:bg-muted/40"
                }`}
              >
                <Checkbox checked={isDone} className="mt-0.5 pointer-events-none" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{meal.time}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isDone ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {meal.name}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-snug ${
                      isDone ? "text-success line-through" : "text-card-foreground"
                    }`}
                  >
                    {meal.food}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DietTable;
