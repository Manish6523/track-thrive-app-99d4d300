import { useState } from "react";
import { Pencil, Plus, Trash2, Save, ChevronUp, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Meal } from "@/lib/fitness-data";

interface EditDietDialogProps {
  meals: Meal[];
  onSave: (meals: Meal[]) => void;
}

const EditDietDialog = ({ meals, onSave }: EditDietDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Meal[]>([]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setData(JSON.parse(JSON.stringify(meals)));
    setOpen(isOpen);
  };

  const updateMeal = (idx: number, field: keyof Meal, value: string) => {
    setData((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  const addMeal = () => setData((prev) => [...prev, { time: "", name: "", food: "" }]);

  const removeMeal = (idx: number) => setData((prev) => prev.filter((_, i) => i !== idx));

  const moveMeal = (idx: number, direction: "up" | "down") => {
    setData((prev) => {
      const next = [...prev];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  };

  const handleSave = () => { onSave(data); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-border/40 bg-card hover:bg-muted text-foreground text-xs">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border/40 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground font-extrabold text-lg">Edit Diet Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {data.map((meal, i) => (
            <div key={i} className="flex gap-1.5 items-center bg-muted/50 rounded-xl p-2">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveMeal(i, "up")} disabled={i === 0} className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => moveMeal(i, "down")} disabled={i === data.length - 1} className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex gap-1.5">
                  <Input value={meal.time} onChange={(e) => updateMeal(i, "time", e.target.value)} placeholder="Time" className="text-xs w-20 rounded-lg bg-background border-border/30 h-8" />
                  <Input value={meal.name} onChange={(e) => updateMeal(i, "name", e.target.value)} placeholder="Meal name" className="text-xs flex-1 rounded-lg bg-background border-border/30 h-8" />
                </div>
                <Input value={meal.food} onChange={(e) => updateMeal(i, "food", e.target.value)} placeholder="Food items" className="text-xs rounded-lg bg-background border-border/30 h-8" />
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => removeMeal(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addMeal} className="gap-1.5 w-full rounded-xl border-dashed border-border/40 text-muted-foreground text-xs">
          <Plus className="h-3 w-3" /> Add Meal
        </Button>

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

export default EditDietDialog;
