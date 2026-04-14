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
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-card-foreground">{pct}%</p>
        </div>
      </div>
      <Progress value={pct} className="h-2.5" />
      <p className="mt-2 text-[10px] text-muted-foreground font-medium">
        {completed} of {total} completed
      </p>
    </div>
  );
};

export default ProgressCard;
