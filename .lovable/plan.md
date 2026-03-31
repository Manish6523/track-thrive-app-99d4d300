

## Fitness Tracker — Mobile Optimization + Full Dashboard

### What's Changing

**1. Mobile-responsive improvements across all components**
- WorkoutTable: On small screens, default to card view instead of table; make exercise chips stack vertically
- DietTable: Add a card/list view for mobile (currently only table, which overflows on small screens)
- ProgressCards: Already responsive, minor padding tweaks for tight screens
- Header: Reduce padding/font sizes on mobile

**2. Full Dashboard features**
- **Streak counter**: Track consecutive days of completing all tasks, stored in localStorage
- **Weekly overview bar chart**: Simple visual showing completion % for last 7 days (stored in localStorage)
- **Quick stats row**: Today's workout type, meals remaining, current streak
- **Motivational greeting**: Time-based greeting (Good morning/afternoon/evening)

**3. localStorage enhancements**
- Already using localStorage for daily progress — will extend to store:
  - `streakData`: `{ currentStreak: number, lastCompletedDate: string }`
  - `weeklyHistory`: array of `{ date: string, workoutPct: number, dietPct: number }` (last 7 days)
- On each day's completion, update streak and weekly history

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/fitness-data.ts` | Add streak + weekly history load/save helpers |
| `src/components/StreakCard.tsx` | **New** — flame icon + streak count |
| `src/components/WeeklyChart.tsx` | **New** — simple 7-day bar chart using div bars (no library needed) |
| `src/components/DietTable.tsx` | Add mobile card view with toggle |
| `src/components/WorkoutTable.tsx` | Default to card view on mobile, improve card layout spacing |
| `src/components/ProgressCard.tsx` | Minor mobile padding adjustments |
| `src/pages/Index.tsx` | Add greeting, streak card, weekly chart section, wire up history saving |
| `src/index.css` | Add any needed mobile utility tweaks |

### Technical Approach

- Use the existing `useIsMobile()` hook to auto-switch views
- Weekly chart: Pure CSS bars (colored divs with dynamic height %) — no charting library needed
- Streak logic: Compare today's date with `lastCompletedDate`; if yesterday → increment, if today → no change, else → reset to 1
- All data stays in localStorage per the user's preference

