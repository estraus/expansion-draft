import { Player, TeamData, teamData } from "@/data/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScoreTooltip } from "@/components/ScoreTooltip";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Target, UserCheck, Info, FileText, Activity } from "lucide-react";
import { useState, useMemo } from "react";

interface DraftPoolTableProps {
  expansionTeamId: string;
  protectedPlayers: Record<string, Set<string>>;
  draftedPlayers: Record<string, { playerId: string; fromTeamId: string }[]>;
  onDraftPlayer: (playerId: string, fromTeamId: string) => void;
}

type SortKey = "name" | "age" | "position" | "contractValue" | "aiScore" | "team";
type SortDir = "asc" | "desc";

function formatCurrency(value: number): string {
  return "$" + (value / 1_000_000).toFixed(1) + "M";
}

function getScoreColor(score: number): string {
  if (score >= 70) return "bg-score-high/20 text-score-high border-score-high/30";
  if (score >= 50) return "bg-score-mid/20 text-score-mid border-score-mid/30";
  return "bg-score-low/20 text-score-low border-score-low/30";
}

const expansionTeams: Record<string, string> = {
  sea: "Seattle Supersonics",
  lvn: "Las Vegas Aces",
};

function RosterSynergyBar({ draftedCount }: { draftedCount: number }) {
  const synergy = useMemo(() => {
    // Deterministic-ish random between 40-95 based on count
    const base = 40;
    const range = 55;
    const seed = (draftedCount * 7919 + 13) % 100;
    return Math.min(95, base + Math.round((seed / 100) * range));
  }, [draftedCount]);

  const synergyColor = synergy >= 75 ? "text-score-high" : synergy >= 55 ? "text-score-mid" : "text-score-low";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 shrink-0">
        <Activity className="h-3.5 w-3.5 text-accent" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Roster Synergy</span>
      </div>
      <Progress value={synergy} className="h-2 flex-1 bg-secondary" />
      <span className={cn("text-xs font-mono font-semibold whitespace-nowrap", synergyColor)}>
        {synergy}%
      </span>
    </div>
  );
}

export function DraftPoolTable({ expansionTeamId, protectedPlayers, draftedPlayers, onDraftPlayer }: DraftPoolTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("aiScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const teamName = expansionTeams[expansionTeamId] || "Expansion Team";
  const myDrafted = draftedPlayers[expansionTeamId] || [];
  const maxDraft = 15;

  // Collect all drafted player IDs across ALL expansion teams
  const allDraftedIds = new Set<string>();
  for (const picks of Object.values(draftedPlayers)) {
    for (const pick of picks) {
      allDraftedIds.add(pick.playerId);
    }
  }

  // Build the unprotected pool
  type PoolPlayer = Player & { teamId: string; teamName: string; teamAbbr: string };
  const pool: PoolPlayer[] = [];
  for (const [tid, team] of Object.entries(teamData)) {
    const protSet = protectedPlayers[tid] || new Set<string>();
    for (const p of team.players) {
      if (!protSet.has(p.id) && !allDraftedIds.has(p.id)) {
        pool.push({ ...p, teamId: tid, teamName: team.name, teamAbbr: team.abbreviation });
      }
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "position" || key === "team" ? "asc" : "desc");
    }
  };

  const sorted = [...pool].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return mul * a.name.localeCompare(b.name);
    if (sortKey === "position") return mul * a.position.localeCompare(b.position);
    if (sortKey === "team") return mul * a.teamName.localeCompare(b.teamName);
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

  // Drafted roster list
  const draftedRoster: (Player & { fromTeamAbbr: string })[] = myDrafted.map((d) => {
    const team = teamData[d.fromTeamId];
    const player = team?.players.find((p) => p.id === d.playerId);
    return { ...player!, fromTeamAbbr: team?.abbreviation || "?" };
  }).filter(Boolean);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="border-b border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{teamName}</h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Expansion Draft — Unprotected Player Pool
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" />
            <span className="font-mono text-sm font-semibold">
              {myDrafted.length} / {maxDraft}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={(myDrafted.length / maxDraft) * 100} className="h-2 flex-1 bg-secondary" />
          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
            {maxDraft - myDrafted.length} picks remaining
          </span>
        </div>

        {/* Roster Synergy Bar */}
        {myDrafted.length > 0 && (
          <RosterSynergyBar draftedCount={myDrafted.length} />
        )}

        {/* Drafted roster chips */}
        {draftedRoster.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {draftedRoster.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20"
              >
                <UserCheck className="h-2.5 w-2.5" />
                {p.name}
                <span className="text-accent/60">({p.fromTeamAbbr})</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="border-b border-border">
              <th className="text-left p-3"><SortHeader label="Player" sortKeyName="name" /></th>
              <th className="text-left p-3"><SortHeader label="Team" sortKeyName="team" /></th>
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
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Draft</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => (
              <tr
                key={player.id}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  i % 2 === 0 && "bg-secondary/30",
                  "hover:bg-secondary/60"
                )}
              >
                <td className="p-3">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-medium text-sm cursor-help inline-flex items-center gap-1">
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
                <td className="p-3">
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                    {player.teamAbbr}
                  </span>
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-mono border-accent/40 text-accent hover:bg-accent/15 hover:text-accent"
                    disabled={myDrafted.length >= maxDraft}
                    onClick={() => onDraftPlayer(player.id, player.teamId)}
                  >
                    Draft
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground font-mono text-sm">
              No unprotected players available. Protect players in Protection Mode first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
