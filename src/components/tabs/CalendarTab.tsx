import { useState } from "react";
import { ChevronLeft, ChevronRight, Dumbbell, UtensilsCrossed, Check, X } from "lucide-react";
import { getSnapshotForDate, type DailySnapshot } from "@/lib/fitness-data";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

const CalendarTab = () => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const todayStr = today.toISOString().slice(0, 10);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
    setSnapshot(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
    setSnapshot(null);
  };

  const selectDate = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // Don't allow future dates
    if (dateStr > todayStr) return;
    setSelectedDate(dateStr);
    setSnapshot(getSnapshotForDate(dateStr));
  };

  // Check which days have data
  const getDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="px-5 pt-14 pb-6 space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(270, 60%, 75%)' }}>History</p>
        <h1 className="text-xl font-extrabold text-foreground mt-0.5" style={{ fontStyle: 'italic' }}>Calendar</h1>
      </div>

      {/* Month Navigation */}
      <div className="animate-fade-up rounded-2xl bg-card border border-border/40 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <button onClick={prevMonth} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-base font-bold text-foreground">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 px-3">
          {DAY_LABELS.map((l, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-muted-foreground/60 py-1">{l}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = getDateStr(day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isFuture = dateStr > todayStr;
            const daySnapshot = getSnapshotForDate(dateStr);
            const hasData = !!daySnapshot;
            const isComplete = daySnapshot && daySnapshot.workoutPct === 100 && daySnapshot.dietPct === 100;

            return (
              <button
                key={day}
                onClick={() => selectDate(day)}
                disabled={isFuture}
                className={`relative flex items-center justify-center h-10 w-10 mx-auto rounded-full text-sm font-bold transition-all ${
                  isSelected
                    ? "text-primary-foreground"
                    : isToday
                    ? "text-primary"
                    : isFuture
                    ? "text-muted-foreground/20"
                    : "text-foreground/80 hover:bg-muted"
                }`}
                style={
                  isSelected
                    ? { background: 'hsl(72, 100%, 50%)' }
                    : {}
                }
              >
                {day}
                {/* Activity indicator dot */}
                {hasData && !isSelected && (
                  <div
                    className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full"
                    style={{
                      background: isComplete ? 'hsl(72, 100%, 50%)' : 'hsl(270, 60%, 75%)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details (Read Only) */}
      {selectedDate && (
        <div className="animate-fade-up space-y-3">
          <h2 className="text-sm font-extrabold text-foreground" style={{ fontStyle: 'italic' }}>
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h2>

          {snapshot ? (
            <>
              {/* Progress Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-3.5" style={{ background: 'hsl(72, 70%, 55%)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="h-3.5 w-3.5 text-black/40" />
                    <span className="text-[10px] font-bold text-black/50 uppercase">Workout</span>
                  </div>
                  <p className="text-2xl font-black text-black">{snapshot.workoutPct}%</p>
                  <p className="text-[10px] text-black/50 font-bold">{snapshot.workoutType}</p>
                </div>
                <div className="rounded-2xl p-3.5" style={{ background: 'hsl(270, 60%, 82%)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-black/40" />
                    <span className="text-[10px] font-bold text-black/50 uppercase">Diet</span>
                  </div>
                  <p className="text-2xl font-black text-black">{snapshot.dietPct}%</p>
                  <p className="text-[10px] text-black/50 font-bold">{snapshot.completedMeals.length}/{snapshot.totalMeals} meals</p>
                </div>
              </div>

              {/* Completed Exercises */}
              {snapshot.completedExercises.length > 0 && (
                <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Dumbbell className="h-3.5 w-3.5 text-primary" /> Exercises
                  </h3>
                  <div className="space-y-1">
                    {snapshot.completedExercises.map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-foreground/80">{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Meals */}
              {snapshot.completedMeals.length > 0 && (
                <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-secondary" /> Meals
                  </h3>
                  <div className="space-y-1">
                    {snapshot.completedMeals.map((meal, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-secondary shrink-0" />
                        <span className="text-foreground/80">{meal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-card border border-border/40 p-8 text-center">
              <X className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-bold text-muted-foreground">No data recorded</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Nothing was tracked on this day</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarTab;
