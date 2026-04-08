import { Exercise, Meal, WorkoutDay, WORKOUT_DATA, DIET_DATA } from "./fitness-data";

const CUSTOM_WORKOUT_KEY = "customWorkoutData";
const CUSTOM_DIET_KEY = "customDietData";

export function loadCustomWorkouts(): WorkoutDay[] {
  try {
    const raw = localStorage.getItem(CUSTOM_WORKOUT_KEY);
    if (!raw) return WORKOUT_DATA;
    return JSON.parse(raw);
  } catch {
    return WORKOUT_DATA;
  }
}

export function saveCustomWorkouts(data: WorkoutDay[]) {
  localStorage.setItem(CUSTOM_WORKOUT_KEY, JSON.stringify(data));
}

export function loadCustomDiet(): Meal[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DIET_KEY);
    if (!raw) return DIET_DATA;
    return JSON.parse(raw);
  } catch {
    return DIET_DATA;
  }
}

export function saveCustomDiet(data: Meal[]) {
  localStorage.setItem(CUSTOM_DIET_KEY, JSON.stringify(data));
}
