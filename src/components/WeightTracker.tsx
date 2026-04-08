import { useState } from "react";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const WeightTracker = () => {
  const [entries, setEntries] = useState<WeightEntry[]>(loadWeightHistory);
  const [input, setInput] = useState("");

  const addWeight = () => {
    const weight = parseFloat(input);
    if (isNaN(weight) || weight <= 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const updated = entries.filter((e) => e.date !== today);
    updated.push({ date: today, weight });
    updated.sort((a, b) => a.date.localeCompare(b.date));
    const trimmed = updated.slice(-30);
    saveWeightHistory(trimmed);
    setEntries(trimmed);
    setInput("");
  };

  const last = entries.length > 0 ? entries[entries.length - 1] : null;
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;
  const diff = last && prev ? last.weight - prev.weight : 0;

  const chartEntries = entries.slice(-14);
  const weights = chartEntries.map((e) => e.weight);
  const minW = weights.length > 0 ? Math.min(...weights) - 1 : 0;
  const maxW = weights.length > 0 ? Math.max(...weights) + 1 : 100;
  const range = maxW - minW || 1;

  return (
    <div className="rounded-2xl bg-card border">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Weight</h3>
          {last && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-foreground">{last.weight} kg</span>
              {diff !== 0 && (
                <span className={`flex items-center text-xs ${diff < 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                  {diff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {Math.abs(diff).toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Weight (kg)"
            className="text-sm rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && addWeight()}
          />
          <Button onClick={addWeight} size="sm" className="gap-1 shrink-0 rounded-xl">
            <Plus className="h-3.5 w-3.5" /> Log
          </Button>
        </div>

        {/* Chart */}
        {chartEntries.length > 1 ? (
          <div className="relative h-32 w-full">
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-muted-foreground pr-1">
              <span>{maxW.toFixed(0)}</span>
              <span>{minW.toFixed(0)}</span>
            </div>
            <div className="ml-7 h-full relative border-b border-l border-border rounded-bl">
              <svg className="w-full h-full" viewBox={`0 0 ${chartEntries.length - 1} 100`} preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  points={chartEntries
                    .map((e, i) => `${i},${100 - ((e.weight - minW) / range) * 100}`)
                    .join(" ")}
                />
                {chartEntries.map((e, i) => (
                  <circle
                    key={e.date}
                    cx={i}
                    cy={100 - ((e.weight - minW) / range) * 100}
                    r="3"
                    vectorEffect="non-scaling-stroke"
                    fill="hsl(var(--primary))"
                  />
                ))}
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
            {chartEntries.length === 1 ? "Log one more day to see your trend" : "Start logging to see progress"}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightTracker;
