import { useState, useCallback } from "react";
import { Activity, Dumbbell, UtensilsCrossed, Flame } from "lucide-react";
import WorkoutTable from "@/components/WorkoutTable";
import DietTable from "@/components/DietTable";
import ProgressCard from "@/components/ProgressCard";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Index = () => {
  const [workoutStats, setWorkoutStats] = useState({ completed: 0, total: 0 });
  const [dietStats, setDietStats] = useState({ completed: 0, total: 0 });

  const onWorkoutChange = useCallback((completed: number, total: number) => {
    setWorkoutStats({ completed, total });
  }, []);

  const onDietChange = useCallback((completed: number, total: number) => {
    setDietStats({ completed, total });
  }, []);

  const overallTotal = workoutStats.total + dietStats.total;
  const overallCompleted = workoutStats.completed + dietStats.completed;

  const today = new Date();
  const dayName = DAYS[today.getDay()];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Fitness Tracker</h1>
              <p className="text-xs text-muted-foreground">
                {dayName}, {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <ProgressCard
            title="Workout"
            completed={workoutStats.completed}
            total={workoutStats.total}
            icon={<Dumbbell className="h-5 w-5" />}
          />
          <ProgressCard
            title="Diet"
            completed={dietStats.completed}
            total={dietStats.total}
            icon={<UtensilsCrossed className="h-5 w-5" />}
          />
          <ProgressCard
            title="Overall"
            completed={overallCompleted}
            total={overallTotal}
            icon={<Flame className="h-5 w-5" />}
          />
        </div>

        {/* Workout */}
        <WorkoutTable onProgressChange={onWorkoutChange} />

        {/* Diet */}
        <DietTable onProgressChange={onDietChange} />
      </main>
    </div>
  );
};

export default Index;
