import { useState } from "react";
import { Pencil, Plus, Trash2, Save } from "lucide-react";
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

  const addMeal = () => {
    setData((prev) => [...prev, { time: "", name: "", food: "" }]);
  };

  const removeMeal = (idx: number) => {
    setData((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave(data);
    setOpen(false);
  };

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
          <DialogTitle>Edit Diet Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {data.map((meal, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1.5">
                <div className="flex gap-2">
                  <Input
                    value={meal.time}
                    onChange={(e) => updateMeal(i, "time", e.target.value)}
                    placeholder="Time"
                    className="text-sm w-24"
                  />
                  <Input
                    value={meal.name}
                    onChange={(e) => updateMeal(i, "name", e.target.value)}
                    placeholder="Meal name"
                    className="text-sm flex-1"
                  />
                </div>
                <Input
                  value={meal.food}
                  onChange={(e) => updateMeal(i, "food", e.target.value)}
                  placeholder="Food items"
                  className="text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive mt-0.5"
                onClick={() => removeMeal(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addMeal} className="gap-1.5 w-full">
          <Plus className="h-3.5 w-3.5" /> Add Meal
        </Button>

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

export default EditDietDialog;
