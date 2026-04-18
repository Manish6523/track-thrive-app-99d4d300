import { useState, useCallback, useEffect, useRef, TouchEvent } from "react";
import { Home, Dumbbell, UtensilsCrossed, CalendarDays, BarChart3, Settings } from "lucide-react";
import HomeTab from "@/components/tabs/HomeTab";
import WorkoutTab from "@/components/tabs/WorkoutTab";
import DietTab from "@/components/tabs/DietTab";
import CalendarTab from "@/components/tabs/CalendarTab";
import StatsTab from "@/components/tabs/StatsTab";
import SettingsTab from "@/components/tabs/SettingsTab";
import {
  loadStreak,
  updateStreak,
  loadWeeklyHistory,
  saveToWeeklyHistory,
  saveDailySnapshot,
} from "@/lib/fitness-data";
import { loadCustomWorkouts, loadCustomDiet } from "@/lib/fitness-store";

const ALL_TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "workout", label: "Workout", icon: Dumbbell },
  { id: "meal", label: "Meal", icon: UtensilsCrossed },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const Index = () => {
  const [settingsVisible, setSettingsVisible] = useState(() => localStorage.getItem("settingsTabVisible") === "true");

  useEffect(() => {
    const handler = () => setSettingsVisible(localStorage.getItem("settingsTabVisible") === "true");
    window.addEventListener("settings-visibility-changed", handler);
    return () => window.removeEventListener("settings-visibility-changed", handler);
  }, []);

  const TABS = settingsVisible ? ALL_TABS : ALL_TABS.filter((t) => t.id !== "settings");

  const [activeTab, setActiveTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [workoutStats, setWorkoutStats] = useState({ completed: 0, total: 0 });
  const [dietStats, setDietStats] = useState({ completed: 0, total: 0 });
  const [streak, setStreak] = useState(() => loadStreak());
  const [weeklyHistory, setWeeklyHistory] = useState(() => loadWeeklyHistory());

  // If settings tab is hidden while user is on it, snap back to home.
  useEffect(() => {
    if (!settingsVisible && activeTab >= TABS.length) setActiveTab(0);
  }, [settingsVisible, activeTab, TABS.length]);


  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const switchTab = useCallback((newTab: number) => {
    if (newTab === activeTab || isAnimating) return;
    setPrevTab(activeTab);
    setActiveTab(newTab);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  }, [activeTab, isAnimating]);

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
    if (distance > 0 && activeTab < TABS.length - 1) switchTab(activeTab + 1);
    else if (distance < 0 && activeTab > 0) switchTab(activeTab - 1);
  };

  const onWorkoutChange = useCallback((completed: number, total: number) => {
    setWorkoutStats({ completed, total });
  }, []);
  const onDietChange = useCallback((completed: number, total: number) => {
    setDietStats({ completed, total });
  }, []);

  const overallTotal = workoutStats.total + dietStats.total;
  const overallCompleted = workoutStats.completed + dietStats.completed;
  const workoutPct = workoutStats.total === 0 ? 0 : Math.min(100, Math.round((workoutStats.completed / workoutStats.total) * 100));
  const dietPct = dietStats.total === 0 ? 0 : Math.min(100, Math.round((dietStats.completed / dietStats.total) * 100));

  useEffect(() => {
    // Streak qualifies when overall completion is > 70%
    const overallPct = overallTotal === 0 ? 0 : (overallCompleted / overallTotal) * 100;
    const qualifies = overallPct > 70;
    const newStreak = updateStreak(qualifies);
    setStreak(newStreak);
    saveToWeeklyHistory(workoutPct, dietPct);
    setWeeklyHistory(loadWeeklyHistory());

    // Save daily snapshot for calendar history
    const workouts = loadCustomWorkouts();
    const meals = loadCustomDiet();
    const dayIndex = new Date().getDay();
    const dayMap = [6, 0, 1, 2, 3, 4, 5];
    const todayWorkout = workouts[dayMap[dayIndex]];

    // Get completed exercise/meal names from localStorage
    const workoutProgress = JSON.parse(localStorage.getItem("workoutProgress") || "{}");
    const dietProgress = JSON.parse(localStorage.getItem("dietProgress") || "{}");
    const completedExercises = Object.entries(workoutProgress.checked || {})
      .filter(([_, v]) => v)
      .map(([k]) => k);
    const completedMeals = Object.entries(dietProgress.checked || {})
      .filter(([_, v]) => v)
      .map(([k]) => k);

    saveDailySnapshot({
      workoutPct,
      dietPct,
      workoutType: todayWorkout?.type || "Rest",
      completedExercises,
      completedMeals,
      totalExercises: todayWorkout?.isRest ? 0 : todayWorkout?.exercises.length || 0,
      totalMeals: meals.length,
    });
  }, [overallCompleted, overallTotal, workoutPct, dietPct]);

  const slideDirection = activeTab > prevTab ? "slide-left" : "slide-right";

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div
        className="flex-1 overflow-hidden pb-24"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div key={activeTab} className={`h-full overflow-y-auto animate-${slideDirection}`}>
          {activeTab === 0 && (
            <HomeTab workoutStats={workoutStats} dietStats={dietStats} streak={streak} overallCompleted={overallCompleted} overallTotal={overallTotal} />
          )}
          {activeTab === 1 && <WorkoutTab onProgressChange={onWorkoutChange} />}
          {activeTab === 2 && <DietTab onProgressChange={onDietChange} />}
          {activeTab === 3 && <CalendarTab />}
          {activeTab === 4 && <StatsTab weeklyHistory={weeklyHistory} />}
          {activeTab === 5 && <SettingsTab />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="max-w-md mx-auto px-5 pb-4">
          <div
            className="rounded-[28px] py-2.5 px-3 flex items-center justify-around"
            style={{
              background: 'rgba(28, 28, 30, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {TABS.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = activeTab === i;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(i)}
                  className="relative flex items-center justify-center transition-all duration-300"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-105' : 'scale-100'}`}
                    style={isActive ? { background: 'hsl(270, 50%, 80%)', boxShadow: '0 2px 12px hsl(270 50% 80% / 0.35)' } : { background: 'transparent' }}
                  >
                    <Icon
                      className="h-[20px] w-[20px] transition-all duration-300"
                      strokeWidth={isActive ? 2.4 : 1.6}
                      style={{ color: isActive ? 'hsl(270, 20%, 20%)' : 'hsl(0, 0%, 45%)' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
