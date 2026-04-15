import { Flame, Dumbbell, UtensilsCrossed, Target, ChevronLeft, ChevronRight, Zap, Trophy } from "lucide-react";
import { getGreeting, getTodayWorkout } from "@/lib/fitness-data";
import { loadCustomDiet } from "@/lib/fitness-store";
import type { StreakData } from "@/lib/fitness-data";
import { useState } from "react";

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
  const workoutPct = workoutStats.total === 0 ? 0 : Math.round((workoutStats.completed / workoutStats.total) * 100);
  const dietPct = dietStats.total === 0 ? 0 : Math.round((dietStats.completed / dietStats.total) * 100);

  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const monthYear = startOfWeek.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  return (
    <div className="px-4 pt-12 pb-6 space-y-5 stagger">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-foreground">Your Activity</h1>
          {streak.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1.5 rounded-full">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-xs font-extrabold">{streak.currentStreak}🔥</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Week */}
      <div className="animate-fade-up rounded-2xl bg-card border border-border/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-foreground">{monthYear}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayLabels.map((l, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-muted-foreground mb-1">{l}</div>
          ))}
          {weekDays.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i} className="flex justify-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isToday
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground hover:bg-muted"
                }`}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Challenge Card */}
      <div className="animate-fade-up rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-foreground">Today's Challenge</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete all {overallTotal} tasks before midnight
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-primary">{overallPct}%</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="animate-fade-up grid grid-cols-2 gap-3">
        {/* Progress Ring Card */}
        <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col items-center">
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="55" cy="55" r={radius} fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-foreground">{overallPct}%</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-widest">Progress</p>
        </div>

        {/* Goals Card */}
        <div className="rounded-2xl bg-secondary/15 border border-secondary/20 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-secondary" />
              <span className="text-xs font-bold text-secondary">My Goals</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {overallPct === 100
                ? "All goals achieved! 🎉"
                : `${overallTotal - overallCompleted} tasks remaining today`}
            </p>
          </div>
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workout & Diet Progress */}
      <div className="animate-fade-up space-y-2.5">
        <ProgressRow
          icon={<Dumbbell className="h-4 w-4" />}
          label="Workout"
          sublabel={todayWorkout.type}
          pct={workoutPct}
          completed={workoutStats.completed}
          total={workoutStats.total}
          color="primary"
        />
        <ProgressRow
          icon={<UtensilsCrossed className="h-4 w-4" />}
          label="Diet"
          sublabel={`${mealsRemaining} meals left`}
          pct={dietPct}
          completed={dietStats.completed}
          total={dietStats.total}
          color="secondary"
        />
      </div>

      {/* Streak Banner */}
      {streak.currentStreak > 0 && (
        <div className="animate-fade-up rounded-2xl bg-gradient-to-r from-primary/10 via-card to-secondary/10 border border-border/40 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground">
              {streak.currentStreak} Day Streak {streak.currentStreak >= 7 ? "🏆" : "🔥"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {streak.currentStreak < 3 ? "Keep pushing!" : streak.currentStreak < 7 ? "You're on fire!" : "Unstoppable beast!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function ProgressRow({ icon, label, sublabel, pct, completed, total, color }: {
  icon: React.ReactNode; label: string; sublabel: string; pct: number; completed: number; total: number; color: "primary" | "secondary";
}) {
  const bgClass = color === "primary" ? "bg-primary/10" : "bg-secondary/10";
  const textClass = color === "primary" ? "text-primary" : "text-secondary";
  const barClass = color === "primary" ? "bg-primary" : "bg-secondary";
  const iconBg = color === "primary" ? "bg-primary/15" : "bg-secondary/15";

  return (
    <div className="rounded-2xl bg-card border border-border/40 p-3.5 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${textClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-sm font-bold text-foreground">{label}</span>
            <span className="text-[10px] text-muted-foreground ml-2">{sublabel}</span>
          </div>
          <span className={`text-xs font-extrabold ${textClass}`}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default HomeTab;
