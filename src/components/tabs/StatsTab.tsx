import WeeklyChart from "@/components/WeeklyChart";
import WeightTracker from "@/components/WeightTracker";
import type { DayHistory } from "@/lib/fitness-data";

interface StatsTabProps {
  weeklyHistory: DayHistory[];
}

const StatsTab = ({ weeklyHistory }: StatsTabProps) => {
  return (
    <div className="px-4 pt-12 pb-6 space-y-5">
      <div>
        <p className="text-[10px] font-bold text-[hsl(var(--chart-5))] uppercase tracking-[0.2em]">Analytics</p>
        <h1 className="text-xl font-extrabold text-foreground mt-0.5">Statistics</h1>
      </div>
      <WeeklyChart history={weeklyHistory} />
      <WeightTracker />
    </div>
  );
};

export default StatsTab;
