import { useState, useRef, useEffect } from "react";
import { Pencil, Plus, Trash2, Save, ChevronUp, ChevronDown, Dumbbell, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { WorkoutDay, Exercise } from "@/lib/fitness-data";

interface EditWorkoutDialogProps {
  workouts: WorkoutDay[];
  onSave: (workouts: WorkoutDay[]) => void;
}

// ── Seamless input — looks like text, acts like input ──
function SeamlessInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  // Use a local draft so we don't lose cursor position on re-render
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  // Sync draft when value changes externally (e.g. opening dialog)
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <input
      ref={ref}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      className={`bg-transparent outline-none border-none w-full placeholder:text-muted-foreground/30 focus:text-primary transition-colors ${className}`}
    />
  );
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

  const addExercise = () => {
    const lastGroup = current?.exercises[current.exercises.length - 1]?.group || "";
    setData((prev) => {
      const next = [...prev];
      next[selectedDay] = {
        ...next[selectedDay],
        exercises: [...next[selectedDay].exercises, { name: "", sets: "3×10", group: lastGroup }],
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

  const updateWorkoutType = (value: string) => {
    setData((prev) => {
      const next = [...prev];
      next[selectedDay] = { ...next[selectedDay], type: value };
      return next;
    });
  };

  const handleSave = () => {
    onSave(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-border/40 bg-card hover:bg-muted text-foreground text-xs">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-background border-border/40 rounded-2xl p-0 gap-0">
        {/* ── Sticky Header ── */}
        <div className="shrink-0 bg-background border-b border-border/30 px-5 pt-5 pb-4">
          <DialogHeader>
            <DialogTitle className="text-foreground font-extrabold text-lg" style={{ fontStyle: 'italic' }}>
              Edit Workout
            </DialogTitle>
          </DialogHeader>

          {/* Day pills */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto hide-scrollbar">
            {data.map((day, i) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(i)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  i === selectedDay
                    ? "text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/40"
                }`}
                style={
                  i === selectedDay
                    ? { background: 'hsl(72, 100%, 50%)' }
                    : {}
                }
              >
                {day.day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        {current && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-4">
            {/* Workout type heading */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'hsl(270, 60%, 82%)' }}
              >
                <Dumbbell className="h-5 w-5 text-black/50" />
              </div>
              <div className="flex-1 min-w-0">
                <SeamlessInput
                  value={current.type}
                  onChange={updateWorkoutType}
                  placeholder="Workout type (e.g. Push)"
                  className="text-lg font-extrabold text-foreground"
                />
                <p className="text-[10px] text-muted-foreground">
                  {current.exercises.length} exercises · ↕ to reorder
                </p>
              </div>
            </div>

            {/* Exercise list — flat, no grouping to avoid re-mount */}
            <div className="space-y-2">
              {current.exercises.map((ex, i) => {
                // Show group divider when group changes
                const showGroupHeader =
                  ex.group && (i === 0 || current.exercises[i - 1]?.group !== ex.group);

                return (
                  <div key={`ex-${selectedDay}-${i}`}>
                    {showGroupHeader && (
                      <div className="flex items-center gap-2 mt-3 mb-2">
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, hsl(72, 100%, 50%, 0.3), transparent)' }} />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em]" style={{ color: 'hsl(72, 100%, 50%)' }}>
                          {ex.group}
                        </span>
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, hsl(72, 100%, 50%, 0.3), transparent)' }} />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 rounded-xl bg-card border border-border/30 p-2.5 group">
                      {/* Reorder arrows */}
                      <div className="flex flex-col shrink-0">
                        <button
                          onClick={() => moveExercise(i, "up")}
                          disabled={i === 0}
                          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveExercise(i, "down")}
                          disabled={i === current.exercises.length - 1}
                          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Exercise details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Name */}
                        <SeamlessInput
                          value={ex.name}
                          onChange={(v) => updateExercise(i, "name", v)}
                          placeholder="Exercise name"
                          className="text-sm font-bold text-foreground"
                        />
                        {/* Group tag */}
                        <div className="flex items-center">
                          <div
                            className="rounded-md px-1.5 py-0.5 inline-flex"
                            style={{ background: 'hsl(270, 60%, 82%, 0.2)' }}
                          >
                            <SeamlessInput
                              value={ex.group || ""}
                              onChange={(v) => updateExercise(i, "group", v)}
                              placeholder="group"
                              className="text-[10px] font-bold uppercase tracking-wide w-20"
                              key={`group-${selectedDay}-${i}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sets */}
                      <div className="shrink-0 w-16">
                        <div className="rounded-lg px-2 py-1" style={{ background: 'hsl(72, 100%, 50%, 0.1)' }}>
                          <SeamlessInput
                            value={ex.sets}
                            onChange={(v) => updateExercise(i, "sets", v)}
                            placeholder="sets"
                            className="text-xs font-bold text-center"
                            key={`sets-${selectedDay}-${i}`}
                          />
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeExercise(i)}
                        className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add exercise */}
            <button
              onClick={addExercise}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/30 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all text-xs font-bold"
            >
              <Plus className="h-4 w-4" />
              Add Exercise
            </button>
          </div>
        )}

        {/* ── Sticky Footer ── */}
        <div className="shrink-0 bg-background border-t border-border/30 px-5 py-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl border-border/40 text-xs h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 gap-1.5 rounded-xl text-xs font-bold h-11"
            style={{ background: 'hsl(72, 100%, 50%)', color: '#000' }}
          >
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkoutDialog;
