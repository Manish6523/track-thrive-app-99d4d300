import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DayHistory } from "@/lib/fitness-data";

interface WeeklyChartProps {
  history: DayHistory[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const chartConfig = {
  workout: {
    label: "Workout",
    color: "hsl(var(--chart-1))",
  },
  diet: {
    label: "Diet",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const WeeklyChart = ({ history }: WeeklyChartProps) => {
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = history.find((h) => h.date === dateStr);
    chartData.push({
      day: DAY_LABELS[d.getDay()],
      workout: Math.min(100, Math.max(0, entry?.workoutPct ?? 0)),
      diet: Math.min(100, Math.max(0, entry?.dietPct ?? 0)),
    });
  }

  return (
    <div className="rounded-2xl bg-card border border-border/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold text-foreground">Weekly Overview</h3>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" /> Workout
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary inline-block" /> Diet
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: 160 }}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10, fontWeight: 700 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="workout" fill="var(--color-workout)" radius={[8, 8, 0, 0]} barSize={14} />
              <Bar dataKey="diet" fill="var(--color-diet)" radius={[8, 8, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default WeeklyChart;
