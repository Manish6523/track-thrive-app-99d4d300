import { useState } from "react";
import { Pencil, Plus, Trash2, Save, ChevronUp, ChevronDown, Copy, ClipboardPaste, FileJson } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Meal } from "@/lib/fitness-data";

interface EditDietDialogProps {
  meals: Meal[];
  onSave: (meals: Meal[]) => void;
}

const EditDietDialog = ({ meals, onSave }: EditDietDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Meal[]>([]);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [jsonText, setJsonText] = useState("");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setData(JSON.parse(JSON.stringify(meals)));
    setOpen(isOpen);
    setShowJsonDialog(false);
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

  // ── JSON Export ──
  const exportJson = () => {
    setJsonText(JSON.stringify(data, null, 2));
    setShowJsonDialog(true);
  };

  // ── JSON Import ──
  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        toast.error("JSON must be an array of meals");
        return;
      }
      for (const meal of parsed) {
        if (!meal.time || !meal.name || !meal.food) {
          toast.error("Each meal needs: time, name, food");
          return;
        }
      }
      setData(parsed);
      setShowJsonDialog(false);
      toast.success("Diet plan imported!");
    } catch {
      toast.error("Invalid JSON format");
    }
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonText);
    toast.success("Copied to clipboard!");
  };

  const handleSave = () => { onSave(data); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-border/40 bg-card hover:bg-muted text-foreground text-xs">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-background border-border/40 rounded-2xl p-0 gap-0">
        {/* Header */}
        <div className="shrink-0 bg-background border-b border-border/30 px-5 pt-5 pb-4">
          <DialogHeader>
            <DialogTitle className="text-foreground font-extrabold text-lg" style={{ fontStyle: 'italic' }}>Edit Diet Plan</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-3">
            <button
              onClick={exportJson}
              className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground bg-card border border-border/40 rounded-lg px-3 py-1.5 transition-all"
            >
              <FileJson className="h-3 w-3" /> JSON Import/Export
            </button>
          </div>
        </div>

        {/* JSON View */}
        {showJsonDialog && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Export or paste a JSON array of meals. Generate with AI and paste directly.
            </p>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-56 rounded-xl bg-muted border border-border/40 p-3 text-xs font-mono text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder='[{ "time": "7:30 AM", "name": "Breakfast", "food": "Oats + Banana" }, ...]'
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

        {/* Meal editor */}
        {!showJsonDialog && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 space-y-2">
            {data.map((meal, i) => (
              <div key={i} className="flex gap-1.5 items-center rounded-xl bg-card border border-border/30 p-2.5">
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
                    <Input value={meal.time} onChange={(e) => updateMeal(i, "time", e.target.value)} placeholder="Time" className="text-xs w-20 rounded-lg bg-muted border-border/30 h-8" />
                    <Input value={meal.name} onChange={(e) => updateMeal(i, "name", e.target.value)} placeholder="Meal name" className="text-xs flex-1 rounded-lg bg-muted border-border/30 h-8" />
                  </div>
                  <Input value={meal.food} onChange={(e) => updateMeal(i, "food", e.target.value)} placeholder="Food items" className="text-xs rounded-lg bg-muted border-border/30 h-8" />
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => removeMeal(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            <button onClick={addMeal} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/30 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all text-xs font-bold">
              <Plus className="h-4 w-4" /> Add Meal
            </button>
          </div>
        )}

        {/* Footer */}
        {!showJsonDialog && (
          <div className="shrink-0 bg-background border-t border-border/30 px-5 py-4 flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-xl border-border/40 text-xs h-11">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 gap-1.5 rounded-xl text-xs font-bold h-11" style={{ background: 'hsl(72, 100%, 50%)', color: '#000' }}>
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditDietDialog;
