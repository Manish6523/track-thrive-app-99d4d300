import { useState, useCallback, useEffect } from "react";
import { Activity, Dumbbell, UtensilsCrossed, Flame, Target, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import WorkoutTable from "@/components/WorkoutTable";
import DietTable from "@/components/DietTable";
import ProgressCard from "@/components/ProgressCard";
import StreakCard from "@/components/StreakCard";
import WeeklyChart from "@/components/WeeklyChart";
import WeightTracker from "@/components/WeightTracker";
import {
  getGreeting,
  getTodayWorkout,
  loadStreak,
  updateStreak,
  loadWeeklyHistory,
  saveToWeeklyHistory,
} from "@/lib/fitness-data";
import { loadCustomWorkouts, loadCustomDiet } from "@/lib/fitness-store";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Dashboard = () => {
  const [workoutStats, setWorkoutStats] = useState({ completed: 0, total: 0 });
  const [dietStats, setDietStats] = useState({ completed: 0, total: 0 });
  const [streak, setStreak] = useState(() => loadStreak());
  const [weeklyHistory, setWeeklyHistory] = useState(() => loadWeeklyHistory());
  const customDiet = loadCustomDiet();

  const onWorkoutChange = useCallback((completed: number, total: number) => {
    setWorkoutStats({ completed, total });
  }, []);

  const onDietChange = useCallback((completed: number, total: number) => {
    setDietStats({ completed, total });
  }, []);

  const overallTotal = workoutStats.total + dietStats.total;
  const overallCompleted = workoutStats.completed + dietStats.completed;
  const workoutPct = workoutStats.total === 0 ? 0 : Math.round((workoutStats.completed / workoutStats.total) * 100);
  const dietPct = dietStats.total === 0 ? 0 : Math.round((dietStats.completed / dietStats.total) * 100);

  useEffect(() => {
    const isFullyComplete = overallTotal > 0 && overallCompleted === overallTotal;
    const newStreak = updateStreak(isFullyComplete);
    setStreak(newStreak);
    saveToWeeklyHistory(workoutPct, dietPct);
    setWeeklyHistory(loadWeeklyHistory());
  }, [overallCompleted, overallTotal, workoutPct, dietPct]);

  const today = new Date();
  const dayName = DAYS[today.getDay()];
  const todayWorkout = getTodayWorkout();
  const mealsRemaining = customDiet.length - dietStats.completed;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {dayName}, {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="text-xs sm:text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            <Activity className="h-3.5 w-3.5" /> Tracker
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 sm:space-y-6 px-3 py-4 sm:px-6 sm:py-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{getGreeting()} 💪</h2>
          <p className="text-sm text-muted-foreground">
            Here's your progress overview for today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border bg-card p-3 sm:p-4 text-center">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-primary" />
            <p className="text-lg sm:text-xl font-bold text-card-foreground">{todayWorkout.type}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Today's Focus</p>
          </div>
          <div className="rounded-xl border bg-card p-3 sm:p-4 text-center">
            <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-primary" />
            <p className="text-lg sm:text-xl font-bold text-card-foreground">{mealsRemaining}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Meals Left</p>
          </div>
          <div className="rounded-xl border bg-card p-3 sm:p-4 text-center">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-destructive" />
            <p className="text-lg sm:text-xl font-bold text-card-foreground">{streak.currentStreak}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <ProgressCard title="Workout" completed={workoutStats.completed} total={workoutStats.total} icon={<Dumbbell className="h-4 w-4 sm:h-5 sm:w-5" />} />
          <ProgressCard title="Diet" completed={dietStats.completed} total={dietStats.total} icon={<UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5" />} />
          <ProgressCard title="Overall" completed={overallCompleted} total={overallTotal} icon={<Flame className="h-4 w-4 sm:h-5 sm:w-5" />} />
          <StreakCard streak={streak.currentStreak} />
        </div>

        {/* Weekly Chart */}
        <WeeklyChart history={weeklyHistory} />

        {/* Weight Tracker */}
        <WeightTracker />

        {/* Workout & Diet */}
        <WorkoutTable onProgressChange={onWorkoutChange} />
        <DietTable onProgressChange={onDietChange} />
      </main>
    </div>
  );
};

export default Dashboard;
