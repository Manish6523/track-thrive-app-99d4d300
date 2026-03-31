export interface Exercise {
  name: string;
  sets: string;
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

export const WORKOUT_DATA: WorkoutDay[] = [
  {
    day: "Monday",
    type: "Push",
    isRest: false,
    exercises: [
      { name: "Bench Press", sets: "4×8-10" },
      { name: "Incline DB Press", sets: "3×10" },
      { name: "Shoulder Press", sets: "3×10" },
      { name: "Lateral Raise", sets: "3×12-15" },
      { name: "Tricep Pushdown", sets: "3×12" },
    ],
  },
  {
    day: "Tuesday",
    type: "Pull",
    isRest: false,
    exercises: [
      { name: "Lat Pulldown", sets: "4×8-10" },
      { name: "Seated Row", sets: "3×10" },
      { name: "Deadlift", sets: "3×6-8" },
      { name: "Dumbbell Curl", sets: "3×10" },
      { name: "Hammer Curl", sets: "3×12" },
    ],
  },
  {
    day: "Wednesday",
    type: "Legs",
    isRest: false,
    exercises: [
      { name: "Squats", sets: "4×8" },
      { name: "Leg Press", sets: "3×10" },
      { name: "Leg Curl", sets: "3×12" },
      { name: "Calf Raise", sets: "4×15" },
      { name: "Lunges", sets: "2×12 each" },
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
      { name: "Bench Press", sets: "4×8-10" },
      { name: "Incline DB Press", sets: "3×10" },
      { name: "Shoulder Press", sets: "3×10" },
      { name: "Lateral Raise", sets: "3×12-15" },
      { name: "Tricep Pushdown", sets: "3×12" },
    ],
  },
  {
    day: "Saturday",
    type: "Pull",
    isRest: false,
    exercises: [
      { name: "Lat Pulldown", sets: "4×8-10" },
      { name: "Seated Row", sets: "3×10" },
      { name: "Deadlift", sets: "3×6-8" },
      { name: "Dumbbell Curl", sets: "3×10" },
      { name: "Hammer Curl", sets: "3×12" },
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
