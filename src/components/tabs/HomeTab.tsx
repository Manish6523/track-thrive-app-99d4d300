import { ChevronLeft, ChevronRight, Footprints, Target, Grid2X2 } from "lucide-react";
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
  const [activeFilter, setActiveFilter] = useState("All");

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

  // Calorie calculations
  const targetCal = 1200;
  const burnedCal = Math.round(targetCal * (workoutPct / 100) * 0.27);
  const remainingCal = targetCal - burnedCal;

  // Steps simulation based on workout progress
  const steps = Math.round(1840 + (workoutPct / 100) * 3000);

  const filters = ["All", "Running", "Cycling"];

  // Donut ring for calorie
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const targetPortion = 0.45;
  const burnedPortion = 0.25;
  const remainingPortion = 0.30;

  return (
    <div className="px-5 pt-14 pb-6 space-y-5 stagger">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold text-foreground tracking-tight" style={{ fontStyle: 'italic' }}>
            Your Activity
          </h1>
          <button className="h-10 w-10 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <Grid2X2 className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Month & Week Nav */}
      <div className="animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-foreground">{monthYear}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="h-8 w-8 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="h-8 w-8 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Week Calendar Row */}
        <div className="grid grid-cols-7 gap-1">
          {dayLabels.map((l, i) => (
            <div key={i} className="text-center text-[11px] font-bold text-muted-foreground mb-1.5">{l}</div>
          ))}
          {weekDays.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i} className="flex justify-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isToday
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-foreground/70 hover:bg-card"
                }`}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Challenge Card - Lime green background with workout image */}
      <div className="animate-fade-up rounded-2xl overflow-hidden relative" style={{ background: 'hsl(72, 70%, 55%)' }}>
        <div className="flex items-stretch">
          <div className="flex-1 p-4 flex flex-col justify-center">
            <p className="text-[15px] font-extrabold text-black" style={{ fontStyle: 'italic' }}>
              Today's Challenge
            </p>
            <p className="text-[11px] text-black/70 mt-1 font-medium">
              Do your plan before 9:00 AM
            </p>
          </div>
          <div className="w-24 h-24 relative">
            <img 
              src="/workout-hero.png" 
              alt="Workout" 
              className="w-full h-full object-cover workout-card-img"
            />
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="animate-fade-up flex gap-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === filter
                ? "bg-foreground text-background"
                : "bg-card border border-border/40 text-muted-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Steps & My Goals Row */}
      <div className="animate-fade-up grid grid-cols-2 gap-3">
        {/* Steps Card - Lime */}
        <div className="rounded-2xl p-4" style={{ background: 'hsl(72, 70%, 55%)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-black/70">Steps</span>
            <Footprints className="h-5 w-5 text-black/40" />
          </div>
          <p className="text-3xl font-black text-black">{steps.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-black/50 mt-1 uppercase">Steps</p>
        </div>

        {/* My Goals Card - Lavender */}
        <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'hsl(270, 60%, 82%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-black/50" />
            <span className="text-xs font-bold text-black/80">My Goals</span>
          </div>
          <p className="text-[10px] text-black/60 leading-relaxed">
            Keep it up, you can achieve your goals.
          </p>
          {/* Circular progress */}
          <div className="absolute bottom-3 right-3">
            <div className="relative h-12 w-12">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
                <circle
                  cx="25" cy="25" r="20" fill="none"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - overallPct / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-black/70">{overallPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calorie / Nutrition Breakdown Card */}
      <div className="animate-fade-up rounded-2xl bg-card border border-border/40 p-4">
        <div className="flex items-center gap-5">
          {/* Donut Chart */}
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              {/* Target ring - Lime */}
              <circle
                cx="50" cy="50" r={donutRadius} fill="none"
                stroke="hsl(72, 100%, 50%)"
                strokeWidth="8"
                strokeDasharray={donutCircumference}
                strokeDashoffset={donutCircumference * (1 - targetPortion)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              {/* Burned ring - Lavender */}
              <circle
                cx="50" cy="50" r={donutRadius} fill="none"
                stroke="hsl(270, 60%, 75%)"
                strokeWidth="8"
                strokeDasharray={donutCircumference}
                strokeDashoffset={donutCircumference * (1 - burnedPortion)}
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{ transform: `rotate(${targetPortion * 360}deg)`, transformOrigin: '50% 50%' }}
              />
              {/* Remaining ring - Mint */}
              <circle
                cx="50" cy="50" r={donutRadius} fill="none"
                stroke="hsl(160, 50%, 70%)"
                strokeWidth="8"
                strokeDasharray={donutCircumference}
                strokeDashoffset={donutCircumference * (1 - remainingPortion)}
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{ transform: `rotate(${(targetPortion + burnedPortion) * 360}deg)`, transformOrigin: '50% 50%' }}
              />
            </svg>
            {/* Center numbers */}
            <div className="absolute top-1 right-0 bg-primary text-primary-foreground text-[8px] font-bold rounded-full h-5 w-5 flex items-center justify-center">1</div>
            <div className="absolute top-8 right-0 text-secondary text-[8px] font-bold bg-secondary/20 rounded-full h-5 w-5 flex items-center justify-center">2</div>
            <div className="absolute bottom-2 right-2 text-[hsl(160,50%,70%)] text-[8px] font-bold bg-[hsl(160,50%,70%)]/20 rounded-full h-5 w-5 flex items-center justify-center">3</div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-sm font-bold text-foreground">{targetCal} Kcal</span>
              <span className="text-[10px] text-muted-foreground ml-auto">Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'hsl(270, 60%, 75%)' }} />
              <span className="text-sm font-bold text-foreground">{burnedCal} Kcal</span>
              <span className="text-[10px] text-muted-foreground ml-auto">Burned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'hsl(160, 50%, 70%)' }} />
              <span className="text-sm font-bold text-foreground">{remainingCal} Kcal</span>
              <span className="text-[10px] text-muted-foreground ml-auto">Remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
