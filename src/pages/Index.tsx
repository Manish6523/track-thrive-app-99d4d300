import { useState, useCallback, useEffect, useRef, TouchEvent } from "react";
import { Home, Dumbbell, UtensilsCrossed, Timer, BarChart3 } from "lucide-react";
import HomeTab from "@/components/tabs/HomeTab";
import WorkoutTab from "@/components/tabs/WorkoutTab";
import ActiveWorkoutTab from "@/components/tabs/ActiveWorkoutTab";
import DietTab from "@/components/tabs/DietTab";
import StatsTab from "@/components/tabs/StatsTab";
import {
  loadStreak,
  updateStreak,
  loadWeeklyHistory,
  saveToWeeklyHistory,
} from "@/lib/fitness-data";

// Tab order: Home, Workout, Meal, Timer, Dashboard
const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "workout", label: "Workout", icon: Dumbbell },
  { id: "meal", label: "Meal", icon: UtensilsCrossed },
  { id: "timer", label: "Timer", icon: Timer },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
] as const;

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [workoutStats, setWorkoutStats] = useState({ completed: 0, total: 0 });
  const [dietStats, setDietStats] = useState({ completed: 0, total: 0 });
  const [streak, setStreak] = useState(() => loadStreak());
  const [weeklyHistory, setWeeklyHistory] = useState(() => loadWeeklyHistory());

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
  const workoutPct = workoutStats.total === 0 ? 0 : Math.round((workoutStats.completed / workoutStats.total) * 100);
  const dietPct = dietStats.total === 0 ? 0 : Math.round((dietStats.completed / dietStats.total) * 100);

  useEffect(() => {
    const isFullyComplete = overallTotal > 0 && overallCompleted === overallTotal;
    const newStreak = updateStreak(isFullyComplete);
    setStreak(newStreak);
    saveToWeeklyHistory(workoutPct, dietPct);
    setWeeklyHistory(loadWeeklyHistory());
  }, [overallCompleted, overallTotal, workoutPct, dietPct]);

  const slideDirection = activeTab > prevTab ? "slide-left" : "slide-right";

  // Timer tab is full-screen
  const isFullScreenTab = activeTab === 3;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div
        className={`flex-1 overflow-hidden ${isFullScreenTab ? '' : 'pb-24'}`}
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
          {activeTab === 3 && <ActiveWorkoutTab />}
          {activeTab === 4 && <StatsTab weeklyHistory={weeklyHistory} />}
        </div>
      </div>

      {/* ─── Bottom Navigation Bar (matches reference image) ─── */}
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
                  id={`nav-${tab.id}`}
                  onClick={() => switchTab(i)}
                  className="relative flex items-center justify-center transition-all duration-300"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'scale-105'
                        : 'scale-100'
                    }`}
                    style={
                      isActive
                        ? {
                            background: 'hsl(270, 50%, 80%)',
                            boxShadow: '0 2px 12px hsl(270 50% 80% / 0.35)',
                          }
                        : { background: 'transparent' }
                    }
                  >
                    <Icon
                      className="h-[20px] w-[20px] transition-all duration-300"
                      strokeWidth={isActive ? 2.4 : 1.6}
                      style={{
                        color: isActive
                          ? 'hsl(270, 20%, 20%)'
                          : 'hsl(0, 0%, 45%)',
                      }}
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
