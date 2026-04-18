import { useState, useEffect } from "react";
import { Trash2, Save, Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface StorageEntry {
  key: string;
  value: string;
}

const SettingsTab = () => {
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const refresh = () => {
    const items: StorageEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) items.push({ key, value: localStorage.getItem(key) || "" });
    }
    items.sort((a, b) => a.key.localeCompare(b.key));
    setEntries(items);
  };

  useEffect(() => {
    refresh();
  }, []);

  const startEdit = (entry: StorageEntry) => {
    try {
      const parsed = JSON.parse(entry.value);
      setEditValue(JSON.stringify(parsed, null, 2));
    } catch {
      setEditValue(entry.value);
    }
    setEditingKey(entry.key);
  };

  const saveEdit = () => {
    if (!editingKey) return;
    try {
      // Validate JSON if it looks like JSON
      const trimmed = editValue.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        JSON.parse(trimmed);
      }
      localStorage.setItem(editingKey, editValue);
      toast.success(`Saved ${editingKey}`);
      setEditingKey(null);
      refresh();
    } catch (e) {
      toast.error("Invalid JSON — fix syntax before saving");
    }
  };

  const deleteKey = (key: string) => {
    if (!confirm(`Delete "${key}" from storage?`)) return;
    localStorage.removeItem(key);
    toast.success(`Deleted ${key}`);
    refresh();
  };

  const exportAll = () => {
    const data: Record<string, string> = {};
    entries.forEach((e) => (data[e.key] = e.value));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitness-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported backup");
  };

  const importAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        Object.entries(data).forEach(([k, v]) => {
          localStorage.setItem(k, v as string);
        });
        toast.success("Imported backup — reloading");
        setTimeout(() => window.location.reload(), 800);
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    if (!confirm("⚠️ Clear ALL local storage? This cannot be undone.")) return;
    localStorage.clear();
    toast.success("All data cleared");
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="px-5 pt-14 pb-6 space-y-5">
      <div className="animate-fade-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(72, 100%, 50%)' }}>
          Advanced
        </p>
        <h1 className="text-xl font-extrabold text-foreground mt-0.5" style={{ fontStyle: 'italic' }}>
          Storage Editor
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Edit raw localStorage values. Use to fix bad data (e.g. percentages above 100%).
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={exportAll} size="sm" variant="outline" className="flex-1 gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <label className="flex-1">
          <input type="file" accept=".json" onChange={importAll} className="hidden" />
          <Button size="sm" variant="outline" className="w-full gap-1.5" asChild>
            <span><Upload className="h-3.5 w-3.5" /> Import</span>
          </Button>
        </label>
        <Button onClick={clearAll} size="sm" variant="destructive" className="gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>

      <div className="space-y-3">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No data in storage</p>
        )}
        {entries.map((entry) => (
          <div key={entry.key} className="rounded-2xl bg-card border border-border/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-foreground truncate">{entry.key}</h3>
              <button
                onClick={() => deleteKey(entry.key)}
                className="text-destructive p-1 hover:opacity-70"
                aria-label={`Delete ${entry.key}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {editingKey === entry.key ? (
              <div className="space-y-2">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="font-mono text-xs min-h-[200px]"
                />
                <div className="flex gap-2">
                  <Button onClick={saveEdit} size="sm" className="flex-1 gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                  <Button onClick={() => setEditingKey(null)} size="sm" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => startEdit(entry)}
                className="w-full text-left"
              >
                <pre className="text-[10px] text-muted-foreground font-mono bg-background/40 rounded-lg p-2 overflow-hidden max-h-20 whitespace-pre-wrap break-all">
                  {entry.value.slice(0, 200)}{entry.value.length > 200 ? "…" : ""}
                </pre>
                <p className="text-[10px] text-primary font-bold mt-1.5">Tap to edit</p>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsTab;
