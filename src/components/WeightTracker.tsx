import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, BarChart2, Table2, Trash2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface WeightEntry {
  date: string;
  weight: number;
}

const STORAGE_KEY = "weightHistory";

function loadWeightHistory(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWeightHistory(entries: WeightEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const chartConfig = {
  weight: {
    label: "Weight",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

const WeightTracker = () => {
  const [entries, setEntries] = useState<WeightEntry[]>(loadWeightHistory);
  const [input, setInput] = useState("");
  const [view, setView] = useState<"chart" | "table">("chart");

  const today = new Date().toISOString().slice(0, 10);

  const addWeight = () => {
    const weight = parseFloat(input);
    if (isNaN(weight) || weight <= 0) return;
    const updated = entries.filter((e) => e.date !== today);
    updated.push({ date: today, weight });
    updated.sort((a, b) => a.date.localeCompare(b.date));
    const trimmed = updated.slice(-30);
    saveWeightHistory(trimmed);
    setEntries(trimmed);
    setInput("");
  };

  const deleteEntry = (date: string) => {
    if (date !== today) return;
    const updated = entries.filter((e) => e.date !== date);
    saveWeightHistory(updated);
    setEntries(updated);
  };

  const last = entries.length > 0 ? entries[entries.length - 1] : null;
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;
  const diff = last && prev ? last.weight - prev.weight : 0;

  const chartEntries = entries.slice(-14);
  const chartData = chartEntries.map((e) => ({
    date: formatDate(e.date),
    weight: e.weight,
  }));

  return (
    <div className="rounded-2xl bg-card border border-border/40">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-extrabold text-foreground">Weight</h3>
            {last && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-black text-foreground">{last.weight} kg</span>
                {diff !== 0 && (
                  <span className={`flex items-center gap-0.5 text-xs font-bold ${diff < 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                    {diff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {Math.abs(diff).toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center bg-muted rounded-xl p-0.5">
            <button
              onClick={() => setView("chart")}
              className={`p-2 rounded-lg transition-all ${view === "chart" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2 rounded-lg transition-all ${view === "table" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              <Table2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Weight (kg)"
            className="text-sm rounded-xl bg-muted border-border/40"
            onKeyDown={(e) => e.key === "Enter" && addWeight()}
          />
          <Button onClick={addWeight} size="sm" className="gap-1.5 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Plus className="h-3.5 w-3.5" /> Log
          </Button>
        </div>

        {/* Chart View */}
        {view === "chart" && (
          <>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(value) => value.split(" ")[1] || value}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area
                    dataKey="weight"
                    type="natural"
                    fill="var(--color-weight)"
                    fillOpacity={0.2}
                    stroke="var(--color-weight)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                Start logging to see progress
              </div>
            )}
          </>
        )}

        {/* Table View */}
        {view === "table" && (
          <>
            {entries.length > 0 ? (
              <div className="max-h-52 overflow-y-auto space-y-1.5">
                {[...entries].reverse().map((e, i) => {
                  const prevEntry = entries[entries.length - 1 - i - 1];
                  const change = prevEntry ? e.weight - prevEntry.weight : 0;
                  const isToday = e.date === today;
                  return (
                    <div
                      key={e.date}
                      className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm ${
                        isToday ? "bg-primary/8 border border-primary/20" : "bg-muted/50"
                      }`}
                    >
                      <span className="text-muted-foreground text-xs font-medium">{formatDate(e.date)}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground">{e.weight} kg</span>
                        {change !== 0 && (
                          <span className={`text-xs font-bold flex items-center gap-0.5 ${change < 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                            {change > 0 ? "+" : ""}{change.toFixed(1)}
                          </span>
                        )}
                        {isToday && (
                          <button
                            onClick={() => deleteEntry(e.date)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                No entries yet
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WeightTracker;
