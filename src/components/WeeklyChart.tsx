import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
  const today = new Date().toISOString().slice(0, 10);

  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = history.find((h) => h.date === dateStr);
    chartData.push({
      day: DAY_LABELS[d.getDay()],
      workout: entry?.workoutPct ?? 0,
      diet: entry?.dietPct ?? 0,
      isToday: dateStr === today,
    });
  }

  return (
    <div className="rounded-2xl bg-card border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Weekly Overview</h3>
      <div className="flex gap-3 mb-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-[hsl(var(--chart-1))] inline-block" /> Workout
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-[hsl(var(--chart-2))] inline-block" /> Diet
        </span>
      </div>

      <ChartContainer config={chartConfig} className="h-32 w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value, index) => {
              const item = chartData[index];
              return item?.isToday ? `${value}` : value;
            }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent />}
          />
          <Bar dataKey="workout" fill="var(--color-workout)" radius={[4, 4, 0, 0]} barSize={14} />
          <Bar dataKey="diet" fill="var(--color-diet)" radius={[4, 4, 0, 0]} barSize={14} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default WeeklyChart;
