import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Save, FolderOpen, Trash2, ChevronDown, Clock } from "lucide-react";
import { toast } from "sonner";

interface ScenarioManagerProps {
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}

function getSavedScenarios(): Record<string, { savedAt: number }> {
  try {
    return JSON.parse(localStorage.getItem("nba-scenarios") || "{}");
  } catch {
    return {};
  }
}

export function ScenarioManager({ onSave, onLoad, onDelete }: ScenarioManagerProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [scenarios, setScenarios] = useState<Record<string, { savedAt: number }>>(getSavedScenarios);

  const refreshScenarios = () => setScenarios(getSavedScenarios());

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    toast.success(`Scenario "${name.trim()}" saved`);
    setName("");
    setSaveOpen(false);
    refreshScenarios();
  };

  const handleLoad = (scenarioName: string) => {
    onLoad(scenarioName);
    toast.success(`Loaded "${scenarioName}"`);
  };

  const handleDelete = (e: React.MouseEvent, scenarioName: string) => {
    e.stopPropagation();
    onDelete(scenarioName);
    toast.success(`Deleted "${scenarioName}"`);
    refreshScenarios();
  };

  const scenarioList = Object.entries(scenarios).sort(([, a], [, b]) => b.savedAt - a.savedAt);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        onClick={() => { setSaveOpen(true); setName(""); }}
      >
        <Save className="h-3.5 w-3.5" />
        Save
      </Button>

      <DropdownMenu onOpenChange={(open) => { if (open) refreshScenarios(); }}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Load
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-popover border-border z-50">
          {scenarioList.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground font-mono">No saved scenarios yet.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Click "Save" to create one.</p>
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  Saved Scenarios
                </span>
              </div>
              <DropdownMenuSeparator />
              {scenarioList.map(([sName, meta]) => (
                <DropdownMenuItem
                  key={sName}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                  onClick={() => handleLoad(sName)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{sName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(meta.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={(e) => handleDelete(e, sName)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">Save Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground">Scenario Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder='e.g. "Vegas Focuses on Defense"'
              className="w-full bg-secondary text-sm rounded px-3 py-2 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setSaveOpen(false)} className="font-mono text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!name.trim()} className="font-mono text-xs">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
