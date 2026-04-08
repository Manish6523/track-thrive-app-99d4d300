import { useState } from "react";
import { Pencil, Plus, Trash2, Save } from "lucide-react";
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

  const addExercise = () => {
    setData((prev) => {
      const next = [...prev];
      next[selectedDay] = {
        ...next[selectedDay],
        exercises: [...next[selectedDay].exercises, { name: "", sets: "" }],
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

  const handleSave = () => {
    onSave(data);
    setOpen(false);
  };

  const current = data[selectedDay];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Workout Plan</DialogTitle>
        </DialogHeader>

        {/* Day selector */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.map((day, i) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
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
          <div className="space-y-3">
            <div className="flex gap-2">
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
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              {current.exercises.map((ex, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={ex.name}
                    onChange={(e) => updateExercise(i, "name", e.target.value)}
                    placeholder="Exercise name"
                    className="text-sm flex-1"
                  />
                  <Input
                    value={ex.sets}
                    onChange={(e) => updateExercise(i, "sets", e.target.value)}
                    placeholder="Sets"
                    className="text-sm w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => removeExercise(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={addExercise} className="gap-1.5 w-full">
              <Plus className="h-3.5 w-3.5" /> Add Exercise
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkoutDialog;
