import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, BarChart2, Table2, Trash2 } from "lucide-react";
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const WeightTracker = () => {
  const [entries, setEntries] = useState<WeightEntry[]>(loadWeightHistory);
  const [input, setInput] = useState("");
  const [view, setView] = useState<"chart" | "table">("chart");

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

  const deleteEntry = (date: string) => {
    const updated = entries.filter((e) => e.date !== date);
    saveWeightHistory(updated);
    setEntries(updated);
  };

  const last = entries.length > 0 ? entries[entries.length - 1] : null;
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;
  const diff = last && prev ? last.weight - prev.weight : 0;

  // Area chart data
  const chartEntries = entries.slice(-14);
  const weights = chartEntries.map((e) => e.weight);
  const minW = weights.length > 0 ? Math.min(...weights) - 1 : 0;
  const maxW = weights.length > 0 ? Math.max(...weights) + 1 : 100;
  const range = maxW - minW || 1;

  const chartW = 300;
  const chartH = 140;
  const padX = 4;
  const padTop = 10;
  const padBottom = 20;
  const plotH = chartH - padTop - padBottom;
  const plotW = chartW - padX * 2;

  const points = chartEntries.map((e, i) => {
    const x = padX + (chartEntries.length > 1 ? (i / (chartEntries.length - 1)) * plotW : plotW / 2);
    const y = padTop + plotH - ((e.weight - minW) / range) * plotH;
    return { x, y, entry: e };
  });

  const linePath = points.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = p.x - (p.x - prev.x) * 0.4;
    return `C${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
  }).join(" ");

  const areaPath = points.length > 0
    ? `${linePath} L${points[points.length - 1].x},${chartH - padBottom} L${points[0].x},${chartH - padBottom} Z`
    : "";

  return (
    <div className="rounded-2xl bg-card border">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setView("chart")}
              className={`p-1.5 rounded-md transition-all ${view === "chart" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-1.5 rounded-md transition-all ${view === "table" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
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
            className="text-sm rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && addWeight()}
          />
          <Button onClick={addWeight} size="sm" className="gap-1 shrink-0 rounded-xl">
            <Plus className="h-3.5 w-3.5" /> Log
          </Button>
        </div>

        {/* Area Chart View */}
        {view === "chart" && (
          <>
            {chartEntries.length > 1 ? (
              <div className="space-y-1">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-36" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#areaGrad)" />
                  {/* Line */}
                  <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Last point dot */}
                  {points.length > 0 && (
                    <circle
                      cx={points[points.length - 1].x}
                      cy={points[points.length - 1].y}
                      r="4"
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--background))"
                      strokeWidth="2"
                    />
                  )}
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between px-1">
                  {chartEntries.filter((_, i) => {
                    const step = Math.max(1, Math.floor(chartEntries.length / 5));
                    return i % step === 0 || i === chartEntries.length - 1;
                  }).map((e) => (
                    <span key={e.date} className="text-[9px] text-muted-foreground">
                      {formatDate(e.date).replace(" ", "\u00A0")}
                    </span>
                  ))}
                </div>
              </div>
            ) : chartEntries.length === 1 ? (
              <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                Log one more entry to see the chart
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                Start logging to see progress
              </div>
            )}
          </>
        )}

        {/* Table View */}
        {view === "table" && (
          <>
            {entries.length > 0 ? (
              <div className="max-h-52 overflow-y-auto space-y-1">
                {[...entries].reverse().map((e, i) => {
                  const prevEntry = entries[entries.length - 1 - i - 1];
                  const change = prevEntry ? e.weight - prevEntry.weight : 0;
                  return (
                    <div
                      key={e.date}
                      className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/50 text-sm"
                    >
                      <span className="text-muted-foreground text-xs">{formatDate(e.date)}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{e.weight} kg</span>
                        {change !== 0 && (
                          <span className={`text-xs flex items-center gap-0.5 ${change < 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                            {change > 0 ? "+" : ""}{change.toFixed(1)}
                          </span>
                        )}
                        <button
                          onClick={() => deleteEntry(e.date)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
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
