import { Flame, Zap, Trophy } from "lucide-react";

interface StreakCardProps {
  streak: number;
}

const StreakCard = ({ streak }: StreakCardProps) => {
  const getMessage = () => {
    if (streak === 0) return "Start your streak today!";
    if (streak < 3) return "Keep it going!";
    if (streak < 7) return "You're on fire!";
    return "Unstoppable! 🔥";
  };

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <Flame className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-card-foreground">
            {streak} {streak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {streak >= 7 ? (
          <Trophy className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Zap className="h-3.5 w-3.5 text-primary" />
        )}
        <span>{getMessage()}</span>
      </div>
    </div>
  );
};

export default StreakCard;
