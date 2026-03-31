import { BarChart3 } from "lucide-react";
import type { DayHistory } from "@/lib/fitness-data";

interface WeeklyChartProps {
  history: DayHistory[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WeeklyChart = ({ history }: WeeklyChartProps) => {
  // Build last 7 days
  const days: { label: string; date: string; workoutPct: number; dietPct: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = history.find((h) => h.date === dateStr);
    days.push({
      label: DAY_LABELS[d.getDay()],
      date: dateStr,
      workoutPct: entry?.workoutPct ?? 0,
      dietPct: entry?.dietPct ?? 0,
    });
  }

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">Weekly Overview</h2>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
          <span>Workout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-success" style={{ backgroundColor: "hsl(var(--success))" }} />
          <span>Diet</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1.5 sm:gap-3 h-32">
        {days.map((day) => {
          const avg = Math.round((day.workoutPct + day.dietPct) / 2);
          const isToday = day.date === new Date().toISOString().slice(0, 10);
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{avg > 0 ? `${avg}%` : ""}</span>
              <div className="w-full flex gap-0.5 items-end h-20">
                <div
                  className="flex-1 rounded-t-sm bg-primary transition-all"
                  style={{ height: `${Math.max(day.workoutPct > 0 ? 8 : 0, day.workoutPct)}%` }}
                />
                <div
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max(day.dietPct > 0 ? 8 : 0, day.dietPct)}%`,
                    backgroundColor: "hsl(var(--success))",
                  }}
                />
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChart;
