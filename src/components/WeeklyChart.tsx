import type { DayHistory } from "@/lib/fitness-data";

interface WeeklyChartProps {
  history: DayHistory[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WeeklyChart = ({ history }: WeeklyChartProps) => {
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
    <div className="rounded-2xl bg-card border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Weekly Overview</h3>
      <div className="flex gap-3 mb-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary inline-block" /> Workout</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm inline-block" style={{ backgroundColor: "hsl(var(--success))" }} /> Diet</span>
      </div>

      <div className="flex items-end gap-2 h-28">
        {days.map((day) => {
          const isToday = day.date === new Date().toISOString().slice(0, 10);
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex gap-0.5 items-end h-20">
                <div
                  className="flex-1 rounded-t bg-primary transition-all"
                  style={{ height: `${Math.max(day.workoutPct > 0 ? 8 : 2, day.workoutPct)}%` }}
                />
                <div
                  className="flex-1 rounded-t transition-all"
                  style={{
                    height: `${Math.max(day.dietPct > 0 ? 8 : 2, day.dietPct)}%`,
                    backgroundColor: "hsl(var(--success))",
                  }}
                />
              </div>
              <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
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
