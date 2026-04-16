import { useState, useRef, useEffect } from "react";
import { Pencil, Plus, Save, ChevronUp, ChevronDown, Dumbbell, X, Copy, ClipboardPaste, FileJson } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { WorkoutDay, Exercise } from "@/lib/fitness-data";

interface EditWorkoutDialogProps {
  workouts: WorkoutDay[];
  onSave: (workouts: WorkoutDay[]) => void;
}

function SeamlessInput({
  value, onChange, placeholder, className = "",
}: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  return (
    <input
      value={draft}
      onChange={(e) => { setDraft(e.target.value); onChange(e.target.value); }}
      placeholder={placeholder}
      className={`bg-transparent outline-none border-none w-full placeholder:text-muted-foreground/30 focus:text-primary transition-colors ${className}`}
    />
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EditWorkoutDialog = ({ workouts, onSave }: EditWorkoutDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<WorkoutDay[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [jsonText, setJsonText] = useState("");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setData(JSON.parse(JSON.stringify(workouts)));
    setOpen(isOpen);
    setShowCopyMenu(false);
    setShowJsonDialog(false);
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

  // ── Copy routine to another day ──
  const copyToDay = (targetDayIdx: number) => {
    if (targetDayIdx === selectedDay) return;
    setData((prev) => {
      const next = [...prev];
      next[targetDayIdx] = {
        ...next[targetDayIdx],
        type: next[selectedDay].type,
        isRest: next[selectedDay].isRest,
        exercises: JSON.parse(JSON.stringify(next[selectedDay].exercises)),
      };
      return next;
    });
    setShowCopyMenu(false);
    toast.success(`Copied to ${DAYS[targetDayIdx]}`);
  };

  // ── JSON Export ──
  const exportJson = () => {
    const json = JSON.stringify(data, null, 2);
    setJsonText(json);
    setShowJsonDialog(true);
  };

  // ── JSON Import ──
  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) || parsed.length !== 7) {
        toast.error("JSON must be an array of 7 workout days");
        return;
      }
      // Validate structure
      for (const day of parsed) {
        if (!day.day || !day.type || !Array.isArray(day.exercises)) {
          toast.error("Invalid workout format. Each day needs: day, type, exercises[]");
          return;
        }
      }
      setData(parsed);
      setShowJsonDialog(false);
      toast.success("Routine imported successfully!");
    } catch {
      toast.error("Invalid JSON format");
    }
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonText);
    toast.success("Copied to clipboard!");
  };

  const handleSave = () => {
    onSave(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-border/40 bg-card hover:bg-muted text-foreground text-xs">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-background border-border/40 rounded-2xl p-0 gap-0">
        {/* ── Header ── */}
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
                onClick={() => { setSelectedDay(i); setShowCopyMenu(false); }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  i === selectedDay
                    ? "text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/40"
                }`}
                style={i === selectedDay ? { background: 'hsl(72, 100%, 50%)' } : {}}
              >
                {day.day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Action buttons: Copy to day + JSON */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowCopyMenu(!showCopyMenu)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground bg-card border border-border/40 rounded-lg px-3 py-1.5 transition-all"
            >
              <Copy className="h-3 w-3" /> Copy to day
            </button>
            <button
              onClick={exportJson}
              className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground bg-card border border-border/40 rounded-lg px-3 py-1.5 transition-all"
            >
              <FileJson className="h-3 w-3" /> JSON
            </button>
          </div>

          {/* Copy to day menu */}
          {showCopyMenu && (
            <div className="mt-2 flex flex-wrap gap-1.5 animate-fade-up">
              {data.map((day, i) => i !== selectedDay && (
                <button
                  key={day.day}
                  onClick={() => copyToDay(i)}
                  className="rounded-lg px-3 py-1.5 text-[10px] font-bold bg-secondary/15 text-secondary hover:bg-secondary/25 transition-all border border-secondary/20"
                >
                  {day.day.slice(0, 3)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── JSON Dialog Overlay ── */}
        {showJsonDialog && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Export or paste a JSON array of 7 workout days. You can generate this with AI and paste it directly.
            </p>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-56 rounded-xl bg-muted border border-border/40 p-3 text-xs font-mono text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder='[{ "day": "Monday", "type": "Push", "isRest": false, "exercises": [{ "name": "Bench Press", "sets": "4×10", "group": "Chest" }] }, ...]'
            />
            <div className="flex gap-2">
              <Button onClick={copyJsonToClipboard} variant="outline" size="sm" className="flex-1 gap-1.5 rounded-xl text-xs">
                <Copy className="h-3 w-3" /> Copy
              </Button>
              <Button onClick={importJson} size="sm" className="flex-1 gap-1.5 rounded-xl text-xs font-bold" style={{ background: 'hsl(72, 100%, 50%)', color: '#000' }}>
                <ClipboardPaste className="h-3 w-3" /> Import
              </Button>
            </div>
            <button onClick={() => setShowJsonDialog(false)} className="w-full text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors py-1">
              ← Back to editor
            </button>
          </div>
        )}

        {/* ── Scrollable Body ── */}
        {!showJsonDialog && current && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'hsl(270, 60%, 82%)' }}>
                <Dumbbell className="h-5 w-5 text-black/50" />
              </div>
              <div className="flex-1 min-w-0">
                <SeamlessInput value={current.type} onChange={updateWorkoutType} placeholder="Workout type" className="text-lg font-extrabold text-foreground" />
                <p className="text-[10px] text-muted-foreground">{current.exercises.length} exercises · ↕ reorder</p>
              </div>
            </div>

            <div className="space-y-2">
              {current.exercises.map((ex, i) => {
                const showGroupHeader = ex.group && (i === 0 || current.exercises[i - 1]?.group !== ex.group);
                return (
                  <div key={`ex-${selectedDay}-${i}`}>
                    {showGroupHeader && (
                      <div className="flex items-center gap-2 mt-3 mb-2">
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, hsl(72, 100%, 50%, 0.3), transparent)' }} />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em]" style={{ color: 'hsl(72, 100%, 50%)' }}>{ex.group}</span>
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, hsl(72, 100%, 50%, 0.3), transparent)' }} />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 rounded-xl bg-card border border-border/30 p-2.5 group">
                      <div className="flex flex-col shrink-0">
                        <button onClick={() => moveExercise(i, "up")} disabled={i === 0} className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground disabled:opacity-20"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button onClick={() => moveExercise(i, "down")} disabled={i === current.exercises.length - 1} className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground disabled:opacity-20"><ChevronDown className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <SeamlessInput value={ex.name} onChange={(v) => updateExercise(i, "name", v)} placeholder="Exercise name" className="text-sm font-bold text-foreground" />
                        <div className="flex items-center">
                          <div className="rounded-md px-1.5 py-0.5 inline-flex" style={{ background: 'hsl(270, 60%, 82%, 0.2)' }}>
                            <SeamlessInput value={ex.group || ""} onChange={(v) => updateExercise(i, "group", v)} placeholder="group" className="text-[10px] font-bold uppercase tracking-wide w-20" key={`group-${selectedDay}-${i}`} />
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 w-16">
                        <div className="rounded-lg px-2 py-1" style={{ background: 'hsl(72, 100%, 50%, 0.1)' }}>
                          <SeamlessInput value={ex.sets} onChange={(v) => updateExercise(i, "sets", v)} placeholder="sets" className="text-xs font-bold text-center" key={`sets-${selectedDay}-${i}`} />
                        </div>
                      </div>
                      <button onClick={() => removeExercise(i)} className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 transition-all">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={addExercise} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/30 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all text-xs font-bold">
              <Plus className="h-4 w-4" /> Add Exercise
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        {!showJsonDialog && (
          <div className="shrink-0 bg-background border-t border-border/30 px-5 py-4 flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-xl border-border/40 text-xs h-11">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 gap-1.5 rounded-xl text-xs font-bold h-11" style={{ background: 'hsl(72, 100%, 50%)', color: '#000' }}>
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkoutDialog;
