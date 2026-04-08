import { Flame, Dumbbell, UtensilsCrossed, Target } from "lucide-react";
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
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-5 pt-14 pb-6 space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">{getGreeting()} 💪</h1>
      </div>

      {/* Overall Progress Ring */}
      <div className="flex items-center gap-5 rounded-2xl bg-card p-5 border">
        <div className="relative h-20 w-20 shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={`${overallPct} ${100 - overallPct}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{overallPct}%</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Today's Progress</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {overallCompleted} of {overallTotal} tasks done
          </p>
          {overallPct === 100 && (
            <p className="text-xs font-medium text-primary mt-1">All done! Great job! 🎉</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <QuickStat
          icon={<Target className="h-4.5 w-4.5" />}
          value={todayWorkout.type}
          label="Focus"
          color="text-primary"
        />
        <QuickStat
          icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
          value={String(mealsRemaining)}
          label="Meals Left"
          color="text-primary"
        />
        <QuickStat
          icon={<Flame className="h-4.5 w-4.5" />}
          value={String(streak.currentStreak)}
          label="Streak"
          color="text-destructive"
        />
      </div>

      {/* Workout & Diet Progress */}
      <div className="space-y-3">
        <ProgressRow
          icon={<Dumbbell className="h-4 w-4" />}
          label="Workout"
          completed={workoutStats.completed}
          total={workoutStats.total}
        />
        <ProgressRow
          icon={<UtensilsCrossed className="h-4 w-4" />}
          label="Diet"
          completed={dietStats.completed}
          total={dietStats.total}
        />
      </div>

      {/* Streak message */}
      {streak.currentStreak > 0 && (
        <div className="rounded-2xl bg-card border p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {streak.currentStreak} day streak! {streak.currentStreak >= 7 ? "🏆" : "🔥"}
            </p>
            <p className="text-xs text-muted-foreground">
              {streak.currentStreak < 3 ? "Keep it going!" : streak.currentStreak < 7 ? "You're on fire!" : "Unstoppable!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function QuickStat({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="rounded-2xl bg-card border p-3.5 text-center">
      <div className={`mx-auto mb-1.5 ${color}`}>{icon}</div>
      <p className="text-base font-bold text-foreground leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ProgressRow({ icon, label, completed, total }: { icon: React.ReactNode; label: string; completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="rounded-2xl bg-card border p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{completed}/{total}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default HomeTab;
