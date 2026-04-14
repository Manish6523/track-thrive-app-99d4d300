import WeeklyChart from "@/components/WeeklyChart";
import WeightTracker from "@/components/WeightTracker";
import type { DayHistory } from "@/lib/fitness-data";

interface StatsTabProps {
  weeklyHistory: DayHistory[];
}

const StatsTab = ({ weeklyHistory }: StatsTabProps) => {
  return (
    <div className="px-5 pt-12 pb-6 space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Stats</h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">Track your progress over time</p>
      </div>
      <WeeklyChart history={weeklyHistory} />
      <WeightTracker />
    </div>
  );
};

export default StatsTab;
