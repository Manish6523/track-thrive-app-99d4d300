import { useState, useCallback, useEffect, useRef, TouchEvent } from "react";
import { Home, Dumbbell, UtensilsCrossed, BarChart3 } from "lucide-react";
import HomeTab from "@/components/tabs/HomeTab";
import WorkoutTab from "@/components/tabs/WorkoutTab";
import DietTab from "@/components/tabs/DietTab";
import StatsTab from "@/components/tabs/StatsTab";
import {
  loadStreak,
  updateStreak,
  loadWeeklyHistory,
  saveToWeeklyHistory,
} from "@/lib/fitness-data";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "workout", label: "Workout", icon: Dumbbell },
  { id: "diet", label: "Diet", icon: UtensilsCrossed },
  { id: "stats", label: "Stats", icon: BarChart3 },
] as const;

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [workoutStats, setWorkoutStats] = useState({ completed: 0, total: 0 });
  const [dietStats, setDietStats] = useState({ completed: 0, total: 0 });
  const [streak, setStreak] = useState(() => loadStreak());
  const [weeklyHistory, setWeeklyHistory] = useState(() => loadWeeklyHistory());

  // Swipe handling
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) < minSwipeDistance) return;
    if (distance > 0 && activeTab < TABS.length - 1) {
      setActiveTab((p) => p + 1);
    } else if (distance < 0 && activeTab > 0) {
      setActiveTab((p) => p - 1);
    }
  };

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Content area */}
      <div
        className="flex-1 overflow-y-auto pb-20"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {activeTab === 0 && (
          <HomeTab
            workoutStats={workoutStats}
            dietStats={dietStats}
            streak={streak}
            overallCompleted={overallCompleted}
            overallTotal={overallTotal}
          />
        )}
        {activeTab === 1 && <WorkoutTab onProgressChange={onWorkoutChange} />}
        {activeTab === 2 && <DietTab onProgressChange={onDietChange} />}
        {activeTab === 3 && <StatsTab weeklyHistory={weeklyHistory} />}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t z-50 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === i;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 transition-all ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
