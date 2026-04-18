import { useRef } from "react";
import { Flame, Dumbbell, UtensilsCrossed, TrendingUp, ChevronRight, Sparkles, Trophy } from "lucide-react";
import { getGreeting, getTodayWorkout, type StreakData } from "@/lib/fitness-data";
import { loadCustomDiet } from "@/lib/fitness-store";
import { toast } from "sonner";

interface HomeTabProps {
  workoutStats: { completed: number; total: number };
  dietStats: { completed: number; total: number };
  streak: StreakData;
  overallCompleted: number;
  overallTotal: number;
}

const HomeTab = ({ workoutStats, dietStats, streak, overallCompleted, overallTotal }: HomeTabProps) => {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStreakTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      const current = localStorage.getItem("settingsTabVisible") === "true";
      const next = !current;
      localStorage.setItem("settingsTabVisible", String(next));
      window.dispatchEvent(new Event("settings-visibility-changed"));
      toast.success(next ? "Settings tab enabled" : "Settings tab hidden");
    }
  };

  const todayWorkout = getTodayWorkout();
  const customDiet = loadCustomDiet();
  const overallPct = overallTotal === 0 ? 0 : Math.round((overallCompleted / overallTotal) * 100);
  const workoutPct = workoutStats.total === 0 ? 0 : Math.round((workoutStats.completed / workoutStats.total) * 100);
  const dietPct = dietStats.total === 0 ? 0 : Math.round((dietStats.completed / dietStats.total) * 100);

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const greeting = getGreeting();

  // Donut for overall progress
  const ringR = 42;
  const ringC = 2 * Math.PI * ringR;

  const mealsRemaining = customDiet.length - dietStats.completed;
  const exercisesRemaining = todayWorkout.isRest ? 0 : todayWorkout.exercises.length - workoutStats.completed;

  return (
    <div className="px-5 pt-14 pb-6 space-y-5 stagger">
      {/* Greeting Header */}
      <div className="animate-fade-up flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(72, 100%, 50%)' }}>
            {greeting}
          </p>
          <h1 className="text-[26px] font-extrabold text-foreground mt-1 leading-tight" style={{ fontStyle: 'italic' }}>
            {dayName}
          </h1>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
        {streak.currentStreak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl" style={{ background: 'hsl(20, 90%, 55%)' }}>
            <Flame className="h-4 w-4 text-white" fill="white" />
            <span className="text-sm font-black text-white">{streak.currentStreak}</span>
          </div>
        )}
      </div>

      {/* Hero Progress Card with Donut */}
      <div className="animate-fade-up rounded-[28px] p-5 relative overflow-hidden" style={{ background: 'hsl(72, 70%, 55%)' }}>
        <div className="flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={ringR} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="9" />
              <circle
                cx="50" cy="50" r={ringR} fill="none"
                stroke="black"
                strokeWidth="9"
                strokeDasharray={ringC}
                strokeDashoffset={ringC * (1 - overallPct / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-black leading-none">{overallPct}%</span>
              <span className="text-[9px] font-bold text-black/60 uppercase mt-0.5">Today</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-black/60 uppercase tracking-wider">Daily Goal</p>
            <p className="text-lg font-extrabold text-black leading-tight mt-1" style={{ fontStyle: 'italic' }}>
              {overallPct === 100 ? "Crushed it!" : overallPct >= 50 ? "Keep going!" : "Let's start!"}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-black/70">
              <Trophy className="h-3.5 w-3.5" />
              <span>{overallCompleted}/{overallTotal} tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workout & Diet stat row */}
      <div className="animate-fade-up grid grid-cols-2 gap-3">
        {/* Workout */}
        <div className="rounded-2xl p-4 bg-card border border-border/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(72, 100%, 50%, 0.15)' }}>
              <Dumbbell className="h-4 w-4" style={{ color: 'hsl(72, 100%, 50%)' }} />
            </div>
            <span className="text-xs font-black text-foreground">{workoutPct}%</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Workout</p>
          <p className="text-base font-extrabold text-foreground mt-0.5 truncate">{todayWorkout.type}</p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-700 rounded-full"
              style={{ width: `${workoutPct}%`, background: 'hsl(72, 100%, 50%)' }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
            {todayWorkout.isRest ? "Rest day" : `${exercisesRemaining} left`}
          </p>
        </div>

        {/* Diet */}
        <div className="rounded-2xl p-4 bg-card border border-border/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(270, 60%, 75%, 0.18)' }}>
              <UtensilsCrossed className="h-4 w-4" style={{ color: 'hsl(270, 60%, 75%)' }} />
            </div>
            <span className="text-xs font-black text-foreground">{dietPct}%</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Diet</p>
          <p className="text-base font-extrabold text-foreground mt-0.5">Meals</p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-700 rounded-full"
              style={{ width: `${dietPct}%`, background: 'hsl(270, 60%, 75%)' }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{mealsRemaining} left</p>
        </div>
      </div>

      {/* Today's Workout Preview */}
      <div className="animate-fade-up rounded-2xl bg-card border border-border/40 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-border/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: 'hsl(72, 100%, 50%)' }} />
            <h3 className="text-sm font-extrabold text-foreground" style={{ fontStyle: 'italic' }}>Today's Plan</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: 'hsl(72, 100%, 50%, 0.15)', color: 'hsl(72, 100%, 50%)' }}>
            {todayWorkout.type}
          </span>
        </div>
        <div className="p-2">
          {todayWorkout.exercises.slice(0, 4).map((ex, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{ex.name}</p>
                {ex.group && <p className="text-[10px] text-muted-foreground font-medium">{ex.group}</p>}
              </div>
              {ex.sets && <span className="text-xs font-bold text-muted-foreground shrink-0">{ex.sets}</span>}
            </div>
          ))}
          {todayWorkout.exercises.length > 4 && (
            <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground flex items-center gap-1">
              +{todayWorkout.exercises.length - 4} more
              <ChevronRight className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>

      {/* Streak Banner */}
      <div className="animate-fade-up rounded-2xl p-4 flex items-center gap-4" style={{ background: 'hsl(270, 60%, 82%)' }}>
        <div className="h-12 w-12 rounded-2xl bg-black/10 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-black" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-black/60 uppercase tracking-wider">Best Streak</p>
          <p className="text-lg font-black text-black leading-tight">
            {streak.currentStreak} {streak.currentStreak === 1 ? "day" : "days"}
          </p>
        </div>
        <p className="text-[10px] text-black/60 font-bold max-w-[110px] text-right leading-snug">
          Complete every task to extend
        </p>
      </div>
    </div>
  );
};

export default HomeTab;
