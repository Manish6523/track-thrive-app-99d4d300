import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Play, RotateCcw, ChevronRight, Flame } from "lucide-react";

interface ActiveWorkoutTabProps {
  onCalorieUpdate?: (calories: number) => void;
}

const ActiveWorkoutTab = ({ onCalorieUpdate }: ActiveWorkoutTabProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(90); // 1:30 rest timer
  const [currentSet, setCurrentSet] = useState(2);
  const [totalSets, setTotalSets] = useState(5);
  const [caloriesBurned, setCaloriesBurned] = useState(328);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setRestSeconds(90);
    setElapsedSeconds(0);
  }, []);

  const nextSet = useCallback(() => {
    if (currentSet < totalSets) {
      setCurrentSet(s => s + 1);
      setRestSeconds(90);
      setCaloriesBurned(c => c + Math.round(30 + Math.random() * 20));
    }
  }, [currentSet, totalSets]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
        setRestSeconds(s => Math.max(0, s - 1));
        // Burn calories while active
        if (Math.random() > 0.5) {
          setCaloriesBurned(c => c + 1);
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const elapsedFormatted = formatTime(elapsedSeconds);
  const restFormatted = formatTime(restSeconds);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-screen workout background image */}
      <div className="absolute inset-0">
        <img 
          src="/active-workout-bg.png" 
          alt="Active workout" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col h-screen px-5 pt-14 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <h1 className="text-xl font-extrabold text-white" style={{ fontStyle: 'italic' }}>
            Your Workout
          </h1>
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center"
          >
            {isRunning ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Calories burned - top right area */}
        <div className="flex justify-end mt-4 animate-fade-up">
          <div className="text-right bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-3 border border-white/10">
            <div className="flex items-center gap-1.5 justify-end">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="text-2xl font-black text-white">{caloriesBurned}</span>
            </div>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Kcal Burned</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Timer Section */}
        <div className="animate-fade-up">
          {/* Progress bars - lavender pill indicators */}
          <div className="flex gap-1.5 mb-6 justify-center">
            {Array.from({ length: totalSets }, (_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i < currentSet
                    ? "w-12 bg-secondary"
                    : i === currentSet
                    ? "w-8 bg-secondary/50"
                    : "w-6 bg-white/15"
                }`}
              />
            ))}
          </div>

          {/* Main timer display */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-6">
              {/* Elapsed time */}
              <div className="text-center">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Elapsed</p>
                <span className="text-2xl font-black text-white/70 tabular-nums">{elapsedFormatted}</span>
              </div>

              {/* REST timer - big center */}
              <div className={`text-center ${isRunning && restSeconds > 0 ? 'animate-timer-pulse' : ''}`}>
                <span className="text-7xl font-black text-white tabular-nums tracking-tight">
                  {restFormatted}
                </span>
              </div>

              {/* Sets */}
              <div className="text-center">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Set</p>
                <span className="text-2xl font-black text-white/70 tabular-nums">{currentSet}/{totalSets}</span>
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetTimer}
              className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/15 flex items-center justify-center transition-all active:scale-95"
            >
              <RotateCcw className="h-5 w-5 text-white/70" />
            </button>

            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              {isRunning ? (
                <Pause className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
              )}
            </button>

            <button
              onClick={nextSet}
              className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-lg border border-white/15 flex items-center justify-center transition-all active:scale-95"
            >
              <ChevronRight className="h-5 w-5 text-white/70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkoutTab;
