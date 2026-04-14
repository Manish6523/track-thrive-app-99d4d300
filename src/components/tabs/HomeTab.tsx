import { Flame, Dumbbell, UtensilsCrossed, Target, TrendingUp } from "lucide-react";
import { getGreeting, getTodayWorkout } from "@/lib/fitness-data";
import { loadCustomDiet } from "@/lib/fitness-store";
import type { StreakData } from "@/lib/fitness-data";

interface HomeTabProps {
  workoutStats: { completed: number; total: number };
  dietStats: { completed: number; total: number };
  streak: StreakData;
  overallCompleted: number;
  overallTotal: number;
}

const HomeTab = ({ workoutStats, dietStats, streak, overallCompleted, overallTotal }: HomeTabProps) => {
  const todayWorkout = getTodayWorkout();
  const customDiet = loadCustomDiet();
  const mealsRemaining = customDiet.length - dietStats.completed;
  const overallPct = overallTotal === 0 ? 0 : Math.round((overallCompleted / overallTotal) * 100);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // SVG ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  return (
    <div className="px-5 pt-12 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{dateStr}</p>
          <h1 className="text-2xl font-extrabold text-foreground mt-1">{getGreeting()} 💪</h1>
        </div>
        {streak.currentStreak > 0 && (
          <div className="flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1.5 rounded-full">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-bold">{streak.currentStreak}</span>
          </div>
        )}
      </div>

      {/* Progress Ring Card */}
      <div className="rounded-3xl bg-card border border-border/50 p-6 flex items-center gap-6">
        <div className="relative h-28 w-28 shrink-0">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{ filter: overallPct > 0 ? 'drop-shadow(0 0 6px hsl(24 95% 53% / 0.5))' : 'none' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-foreground">{overallPct}%</span>
            <span className="text-[9px] text-muted-foreground font-medium">COMPLETE</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-foreground">Today's Progress</p>
          <p className="text-xs text-muted-foreground mt-1">
            {overallCompleted} of {overallTotal} tasks done
          </p>
          {overallPct === 100 && (
            <div className="mt-3 flex items-center gap-1.5 text-primary text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              All done! Great job! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <QuickStat
          icon={<Target className="h-5 w-5" />}
          value={todayWorkout.type}
          label="Focus"
          accent
        />
        <QuickStat
          icon={<UtensilsCrossed className="h-5 w-5" />}
          value={String(mealsRemaining)}
          label="Meals Left"
        />
        <QuickStat
          icon={<Flame className="h-5 w-5" />}
          value={String(streak.currentStreak)}
          label="Streak"
          accent
        />
      </div>

      {/* Workout & Diet Progress Bars */}
      <div className="space-y-3">
        <ProgressRow
          icon={<Dumbbell className="h-4.5 w-4.5" />}
          label="Workout"
          completed={workoutStats.completed}
          total={workoutStats.total}
          color="primary"
        />
        <ProgressRow
          icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
          label="Diet"
          completed={dietStats.completed}
          total={dietStats.total}
          color="chart-2"
        />
      </div>

      {/* Streak Message */}
      {streak.currentStreak > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-primary/20 flex items-center justify-center glow-primary">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {streak.currentStreak} day streak! {streak.currentStreak >= 7 ? "🏆" : "🔥"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {streak.currentStreak < 3 ? "Keep it going!" : streak.currentStreak < 7 ? "You're on fire!" : "Unstoppable!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function QuickStat({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border/50 p-4 text-center ${accent ? 'bg-primary/8' : 'bg-card'}`}>
      <div className={`mx-auto mb-2 ${accent ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</div>
      <p className="text-lg font-black text-foreground leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ProgressRow({ icon, label, completed, total, color }: { icon: React.ReactNode; label: string; completed: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl bg-${color === 'primary' ? 'primary' : '[hsl(var(--chart-2))]'}/15 flex items-center justify-center ${color === 'primary' ? 'text-primary' : 'text-[hsl(var(--chart-2))]'} shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs font-bold text-muted-foreground">{completed}/{total}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${color === 'primary' ? 'bg-primary' : 'bg-[hsl(var(--chart-2))]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default HomeTab;
