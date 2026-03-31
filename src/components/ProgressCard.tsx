import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  completed: number;
  total: number;
  icon: React.ReactNode;
}

const ProgressCard = ({ title, completed, total, icon }: ProgressCardProps) => {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-card-foreground">{pct}%</p>
        </div>
      </div>
      <Progress value={pct} className="h-2 sm:h-2.5" />
      <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
        {completed} of {total} completed
      </p>
    </div>
  );
};

export default ProgressCard;
