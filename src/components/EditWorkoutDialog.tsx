import { useState } from "react";
import { Pencil, Plus, Trash2, Save, ChevronUp, ChevronDown, FolderPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutDay, Exercise } from "@/lib/fitness-data";

interface EditWorkoutDialogProps {
  workouts: WorkoutDay[];
  onSave: (workouts: WorkoutDay[]) => void;
}

const EditWorkoutDialog = ({ workouts, onSave }: EditWorkoutDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<WorkoutDay[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setData(JSON.parse(JSON.stringify(workouts)));
    setOpen(isOpen);
  };

  const current = data[selectedDay];

  const updateExercise = (exIdx: number, field: keyof Exercise, value: string) => {
    setData((prev) => {
      const next = [...prev];
      next[selectedDay] = {
        ...next[selectedDay],
        exercises: next[selectedDay].exercises.map((ex, i) =>
          i === exIdx ? { ...ex, [field]: value } : ex
        ),
      };
      return next;
    });
  };

  const addExercise = (group?: string) => {
    setData((prev) => {
      const next = [...prev];
      next[selectedDay] = {
        ...next[selectedDay],
        exercises: [...next[selectedDay].exercises, { name: "", sets: "", group: group || "" }],
      };
      return next;
    });
  };

  const removeExercise = (exIdx: number) => {
    setData((prev) => {
      const next = [...prev];
      next[selectedDay] = {
        ...next[selectedDay],
        exercises: next[selectedDay].exercises.filter((_, i) => i !== exIdx),
      };
      return next;
    });
  };

  const moveExercise = (exIdx: number, direction: "up" | "down") => {
    setData((prev) => {
      const next = [...prev];
      const exercises = [...next[selectedDay].exercises];
      const targetIdx = direction === "up" ? exIdx - 1 : exIdx + 1;
      if (targetIdx < 0 || targetIdx >= exercises.length) return prev;
      [exercises[exIdx], exercises[targetIdx]] = [exercises[targetIdx], exercises[exIdx]];
      next[selectedDay] = { ...next[selectedDay], exercises };
      return next;
    });
  };

  const handleSave = () => {
    onSave(data);
    setOpen(false);
  };

  const groups = current
    ? [...new Set(current.exercises.map((e) => e.group).filter(Boolean))]
    : [];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-border/40 bg-card hover:bg-muted text-foreground text-xs">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border/40 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground font-extrabold text-lg">Edit Workout Plan</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {data.map((day, i) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(i)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                i === selectedDay
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {day.day.slice(0, 3)}
            </button>
          ))}
        </div>

        {current && (
          <div className="space-y-3 mt-2">
            <Input
              value={current.type}
              onChange={(e) =>
                setData((prev) => {
                  const next = [...prev];
                  next[selectedDay] = { ...next[selectedDay], type: e.target.value };
                  return next;
                })
              }
              placeholder="Workout type"
              className="text-sm rounded-xl bg-muted border-border/40 font-bold"
            />

            <div className="space-y-2">
              {current.exercises.map((ex, i) => {
                const showGroupHeader =
                  ex.group && (i === 0 || current.exercises[i - 1]?.group !== ex.group);
                return (
                  <div key={i}>
                    {showGroupHeader && (
                      <div className="flex items-center gap-2 mt-3 mb-1.5">
                        <div className="h-px flex-1 bg-border/40" />
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">{ex.group}</span>
                        <div className="h-px flex-1 bg-border/40" />
                      </div>
                    )}
                    <div className="flex gap-1.5 items-center bg-muted/50 rounded-xl p-2">
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button onClick={() => moveExercise(i, "up")} disabled={i === 0} className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => moveExercise(i, "down")} disabled={i === current.exercises.length - 1} className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex gap-1.5">
                          <Input value={ex.group || ""} onChange={(e) => updateExercise(i, "group", e.target.value)} placeholder="Group" className="text-xs w-20 rounded-lg bg-background border-border/30 h-8" />
                          <Input value={ex.name} onChange={(e) => updateExercise(i, "name", e.target.value)} placeholder="Exercise" className="text-xs flex-1 rounded-lg bg-background border-border/30 h-8" />
                          <Input value={ex.sets} onChange={(e) => updateExercise(i, "sets", e.target.value)} placeholder="Sets" className="text-xs w-20 rounded-lg bg-background border-border/30 h-8" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => removeExercise(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addExercise()} className="gap-1.5 flex-1 rounded-xl border-dashed border-border/40 text-muted-foreground text-xs">
                <Plus className="h-3 w-3" /> Exercise
              </Button>
              {groups.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => addExercise(current.exercises[current.exercises.length - 1]?.group || "")} className="gap-1.5 rounded-xl border-dashed border-primary/30 text-primary text-xs">
                  <FolderPlus className="h-3 w-3" /> To Group
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-border/40 text-xs">Cancel</Button>
          <Button onClick={handleSave} className="gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkoutDialog;
