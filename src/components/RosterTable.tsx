import { Player, TeamData } from "@/data/teams";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScoreTooltip } from "@/components/ScoreTooltip";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Shield, AlertTriangle, Info, FileText } from "lucide-react";
import { useState } from "react";

interface RosterTableProps {
  team: TeamData | null;
  protectedPlayers: Set<string>;
  onToggleProtect: (playerId: string) => void;
}

type SortKey = "name" | "age" | "position" | "contractValue" | "aiScore";
type SortDir = "asc" | "desc";

function formatCurrency(value: number): string {
  return "$" + (value / 1_000_000).toFixed(1) + "M";
}

function getScoreColor(score: number): string {
  if (score >= 70) return "bg-score-high/20 text-score-high border-score-high/30";
  if (score >= 50) return "bg-score-mid/20 text-score-mid border-score-mid/30";
  return "bg-score-low/20 text-score-low border-score-low/30";
}

export function RosterTable({ team, protectedPlayers, onToggleProtect }: RosterTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("aiScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  if (!team) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground font-mono text-sm">No roster data available for this team.</p>
          <p className="text-muted-foreground/60 text-xs">Try selecting Bulls, Nuggets, or Knicks.</p>
        </div>
      </div>
    );
  }

  const protectedCount = team.players.filter((p) => protectedPlayers.has(p.id)).length;
  const maxProtected = 8;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "position" ? "asc" : "desc");
    }
  };

  const sorted = [...team.players].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return mul * a.name.localeCompare(b.name);
    if (sortKey === "position") return mul * a.position.localeCompare(b.position);
    return mul * ((a[sortKey] as number) - (b[sortKey] as number));
  });

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => handleSort(sortKeyName)}
      className={cn(
        "flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider hover:text-foreground transition-colors",
        sortKey === sortKeyName ? "text-primary" : "text-muted-foreground"
      )}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="border-b border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{team.name}</h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {team.conference} Conference • Expansion Draft Protection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm font-semibold">
              {protectedCount} / {maxProtected}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={(protectedCount / maxProtected) * 100} className="h-2 flex-1 bg-secondary" />
          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
            {maxProtected - protectedCount} slots remaining
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="border-b border-border">
              <th className="text-left p-3 w-8"></th>
              <th className="text-left p-3"><SortHeader label="Player" sortKeyName="name" /></th>
              <th className="text-left p-3"><SortHeader label="Age" sortKeyName="age" /></th>
              <th className="text-left p-3"><SortHeader label="Pos" sortKeyName="position" /></th>
              <th className="text-right p-3"><SortHeader label="Contract" sortKeyName="contractValue" /></th>
              <th className="text-center p-3">
                <div className="flex items-center justify-center gap-1">
                  <SortHeader label="PSV" sortKeyName="aiScore" />
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground/50 hover:text-accent cursor-help transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[220px] text-[11px]">
                        <p><strong>Projected Surplus Value</strong> — composite score (1–100) from a gradient-boosted model weighing efficiency, age, contract, and positional scarcity.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </th>
              <th className="text-center p-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Protect</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => {
              const isProtected = protectedPlayers.has(player.id);
              return (
                <tr
                  key={player.id}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    isProtected && "bg-[hsl(var(--protected-row)/0.08)]",
                    !isProtected && i % 2 === 0 && "bg-secondary/30",
                    "hover:bg-secondary/60"
                  )}
                >
                  <td className="p-3 text-center">
                    {isProtected && <Shield className="h-3.5 w-3.5 text-primary mx-auto" />}
                  </td>
                  <td className="p-3">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={cn("font-medium text-sm cursor-help inline-flex items-center gap-1", isProtected && "text-primary")}>
                            {player.name}
                            <FileText className="h-3 w-3 text-muted-foreground/40" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[240px]">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-accent mb-1">Scouting TL;DR</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed italic">"{player.scoutingTldr}"</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="p-3 font-mono text-sm text-muted-foreground">{player.age}</td>
                  <td className="p-3">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {player.position}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-sm">{formatCurrency(player.contractValue)}</td>
                  <td className="p-3 text-center">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            <Badge className={cn("font-mono text-xs border", getScoreColor(player.aiScore))}>
                              {player.aiScore}
                            </Badge>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="p-0 bg-card border-border shadow-xl z-50" sideOffset={8}>
                          <ScoreTooltip score={player.aiScore} weights={player.mlFeatureWeights} />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="p-3 text-center">
                    <Switch
                      checked={isProtected}
                      onCheckedChange={() => onToggleProtect(player.id)}
                      disabled={!isProtected && protectedCount >= maxProtected}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
