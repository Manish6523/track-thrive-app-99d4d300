export interface Exercise {
  name: string;
  sets: string;
  group?: string;
}

export interface WorkoutDay {
  day: string;
  type: string;
  exercises: Exercise[];
  isRest: boolean;
}

export interface Meal {
  time: string;
  name: string;
  food: string;
}

export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string;
}

export interface DayHistory {
  date: string;
  workoutPct: number;
  dietPct: number;
}

export interface DailySnapshot {
  date: string;
  workoutPct: number;
  dietPct: number;
  workoutType: string;
  completedExercises: string[];
  completedMeals: string[];
  totalExercises: number;
  totalMeals: number;
}

export const WORKOUT_DATA: WorkoutDay[] = [
  {
    day: "Monday",
    type: "Push",
    isRest: false,
    exercises: [
      { name: "Bench Press", sets: "4×8-10", group: "Chest" },
      { name: "Incline DB Press", sets: "3×10", group: "Chest" },
      { name: "Shoulder Press", sets: "3×10", group: "Shoulders" },
      { name: "Lateral Raise", sets: "3×12-15", group: "Shoulders" },
      { name: "Tricep Pushdown", sets: "3×12", group: "Triceps" },
    ],
  },
  {
    day: "Tuesday",
    type: "Pull",
    isRest: false,
    exercises: [
      { name: "Lat Pulldown", sets: "4×8-10", group: "Back" },
      { name: "Seated Row", sets: "3×10", group: "Back" },
      { name: "Deadlift", sets: "3×6-8", group: "Back" },
      { name: "Dumbbell Curl", sets: "3×10", group: "Biceps" },
      { name: "Hammer Curl", sets: "3×12", group: "Biceps" },
    ],
  },
  {
    day: "Wednesday",
    type: "Legs",
    isRest: false,
    exercises: [
      { name: "Squats", sets: "4×8", group: "Quads" },
      { name: "Leg Press", sets: "3×10", group: "Quads" },
      { name: "Leg Curl", sets: "3×12", group: "Hamstrings" },
      { name: "Calf Raise", sets: "4×15", group: "Calves" },
      { name: "Lunges", sets: "2×12 each", group: "Quads" },
    ],
  },
  {
    day: "Thursday",
    type: "Rest",
    isRest: true,
    exercises: [{ name: "Light Cardio / Stretch", sets: "" }],
  },
  {
    day: "Friday",
    type: "Push",
    isRest: false,
    exercises: [
      { name: "Bench Press", sets: "4×8-10", group: "Chest" },
      { name: "Incline DB Press", sets: "3×10", group: "Chest" },
      { name: "Shoulder Press", sets: "3×10", group: "Shoulders" },
      { name: "Lateral Raise", sets: "3×12-15", group: "Shoulders" },
      { name: "Tricep Pushdown", sets: "3×12", group: "Triceps" },
    ],
  },
  {
    day: "Saturday",
    type: "Pull",
    isRest: false,
    exercises: [
      { name: "Lat Pulldown", sets: "4×8-10", group: "Back" },
      { name: "Seated Row", sets: "3×10", group: "Back" },
      { name: "Deadlift", sets: "3×6-8", group: "Back" },
      { name: "Dumbbell Curl", sets: "3×10", group: "Biceps" },
      { name: "Hammer Curl", sets: "3×12", group: "Biceps" },
    ],
  },
  {
    day: "Sunday",
    type: "Rest",
    isRest: true,
    exercises: [{ name: "Full Rest", sets: "" }],
  },
];

export const DIET_DATA: Meal[] = [
  { time: "7:30 AM", name: "Breakfast", food: "Oats + Milk + Banana + Peanut Butter" },
  { time: "11:00 AM", name: "Snack", food: "Fruit + Peanuts / Roasted Chana" },
  { time: "1:30 PM", name: "Lunch", food: "Roti + Rice + Dal + Protein Rotation + Curd" },
  { time: "4:00 PM", name: "Pre-workout", food: "Banana" },
  { time: "6:00 PM", name: "Post-workout", food: "Milk + Dates" },
  { time: "8:30 PM", name: "Dinner", food: "Roti + Sabzi (Paneer/Soya/Chole/Rajma) + Dal" },
  { time: "10:30 PM", name: "Before Bed", food: "Milk + Peanuts" },
];

const TODAY_KEY = () => new Date().toISOString().slice(0, 10);

export function loadProgress(key: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data._date !== TODAY_KEY()) {
      localStorage.removeItem(key);
      return {};
    }
    return data.checked || {};
  } catch {
    return {};
  }
}

export function saveProgress(key: string, checked: Record<string, boolean>) {
  localStorage.setItem(key, JSON.stringify({ _date: TODAY_KEY(), checked }));
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem("streakData");
    if (!raw) return { currentStreak: 0, lastCompletedDate: "" };
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, lastCompletedDate: "" };
  }
}

export function updateStreak(qualifies: boolean): StreakData {
  const streak = loadStreak();
  const today = TODAY_KEY();
  if (!qualifies) return streak;
  if (streak.lastCompletedDate === today) return streak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  let newStreak: StreakData;
  if (streak.lastCompletedDate === yesterdayKey) {
    newStreak = { currentStreak: streak.currentStreak + 1, lastCompletedDate: today };
  } else {
    newStreak = { currentStreak: 1, lastCompletedDate: today };
  }
  localStorage.setItem("streakData", JSON.stringify(newStreak));
  return newStreak;
}

export function loadWeeklyHistory(): DayHistory[] {
  try {
    const raw = localStorage.getItem("weeklyHistory");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveToWeeklyHistory(workoutPct: number, dietPct: number) {
  const history = loadWeeklyHistory();
  const today = TODAY_KEY();
  const existing = history.findIndex((h) => h.date === today);
  if (existing >= 0) {
    history[existing] = { date: today, workoutPct, dietPct };
  } else {
    history.push({ date: today, workoutPct, dietPct });
  }
  const trimmed = history.slice(-30);
  localStorage.setItem("weeklyHistory", JSON.stringify(trimmed));
}

// ── Daily Snapshots for Calendar ──
const SNAPSHOTS_KEY = "dailySnapshots";

export function loadDailySnapshots(): DailySnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDailySnapshot(snapshot: Omit<DailySnapshot, "date">) {
  const snapshots = loadDailySnapshots();
  const today = TODAY_KEY();
  const idx = snapshots.findIndex((s) => s.date === today);
  const full: DailySnapshot = { ...snapshot, date: today };
  if (idx >= 0) {
    snapshots[idx] = full;
  } else {
    snapshots.push(full);
  }
  // keep last 90 days
  const trimmed = snapshots.slice(-90);
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(trimmed));
}

export function getSnapshotForDate(date: string): DailySnapshot | null {
  const snapshots = loadDailySnapshots();
  return snapshots.find((s) => s.date === date) || null;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function getTodayWorkout(): WorkoutDay {
  const dayIndex = new Date().getDay();
  const dayMap = [6, 0, 1, 2, 3, 4, 5];
  return WORKOUT_DATA[dayMap[dayIndex]];
}
