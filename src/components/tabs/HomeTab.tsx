import { Flame, Dumbbell, UtensilsCrossed, Target, TrendingUp, Zap } from "lucide-react";
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
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  const workoutPct = workoutStats.total === 0 ? 0 : Math.round((workoutStats.completed / workoutStats.total) * 100);
  const dietPct = dietStats.total === 0 ? 0 : Math.round((dietStats.completed / dietStats.total) * 100);

  return (
    <div className="px-4 pt-10 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{dateStr}</p>
          <h1 className="text-[22px] font-black text-foreground mt-0.5">{getGreeting()} 💪</h1>
        </div>
        {streak.currentStreak > 0 && (
          <div className="flex items-center gap-1 bg-primary/12 text-primary px-3 py-1.5 rounded-xl">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-black">{streak.currentStreak}</span>
          </div>
        )}
      </div>

      {/* Progress Ring */}
      <div className="rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-border/30 p-5 flex items-center gap-5">
        <div className="relative h-[110px] w-[110px] shrink-0">
          <svg className="h-[110px] w-[110px] -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="7"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: overallPct > 0 ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))' : 'none' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-black text-foreground leading-none">{overallPct}%</span>
            <span className="text-[8px] text-muted-foreground font-bold tracking-widest mt-1">DONE</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-sm font-bold text-foreground">Daily Progress</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {overallCompleted}/{overallTotal} tasks completed
            </p>
          </div>
          {overallPct === 100 && (
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold bg-primary/10 px-3 py-1.5 rounded-lg w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              Perfect day! 🎉
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={<Target className="h-4 w-4" />} value={todayWorkout.type} label="Focus" accent />
        <StatCard icon={<UtensilsCrossed className="h-4 w-4" />} value={String(mealsRemaining)} label="Meals Left" />
        <StatCard icon={<Flame className="h-4 w-4" />} value={String(streak.currentStreak)} label="Streak" accent />
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        <ProgressBar
          icon={<Dumbbell className="h-4 w-4" />}
          label="Workout"
          pct={workoutPct}
          completed={workoutStats.completed}
          total={workoutStats.total}
          colorClass="bg-primary"
          iconBgClass="bg-primary/15 text-primary"
        />
        <ProgressBar
          icon={<UtensilsCrossed className="h-4 w-4" />}
          label="Diet"
          pct={dietPct}
          completed={dietStats.completed}
          total={dietStats.total}
          colorClass="bg-[hsl(var(--chart-2))]"
          iconBgClass="bg-[hsl(var(--chart-2))]/15 text-[hsl(var(--chart-2))]"
        />
      </div>

      {/* Streak banner */}
      {streak.currentStreak > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-primary/8 via-primary/5 to-transparent border border-primary/15 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-foreground">
              {streak.currentStreak} day streak {streak.currentStreak >= 7 ? "🏆" : "🔥"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {streak.currentStreak < 3 ? "Keep it going!" : streak.currentStreak < 7 ? "You're on fire!" : "Unstoppable!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border/30 p-3 text-center ${accent ? 'bg-primary/6' : 'bg-card'}`}>
      <div className={`mx-auto mb-1.5 ${accent ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</div>
      <p className="text-base font-black text-foreground leading-tight">{value}</p>
      <p className="text-[9px] text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ProgressBar({ icon, label, pct, completed, total, colorClass, iconBgClass }: {
  icon: React.ReactNode; label: string; pct: number; completed: number; total: number; colorClass: string; iconBgClass: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/30 p-3.5 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-bold text-foreground">{label}</span>
          <span className="text-[11px] font-bold text-muted-foreground">{completed}/{total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default HomeTab;
