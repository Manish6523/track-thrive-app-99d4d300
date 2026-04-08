import WeeklyChart from "@/components/WeeklyChart";
import WeightTracker from "@/components/WeightTracker";
import type { DayHistory } from "@/lib/fitness-data";

interface StatsTabProps {
  weeklyHistory: DayHistory[];
}

const StatsTab = ({ weeklyHistory }: StatsTabProps) => {
  return (
    <div className="px-5 pt-14 pb-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stats</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your progress over time</p>
      </div>
      <WeeklyChart history={weeklyHistory} />
      <WeightTracker />
    </div>
  );
};

export default StatsTab;
