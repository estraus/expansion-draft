import { allTeams } from "@/data/teams";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Shield, Target, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

export type AppMode = "protection" | "draft";

const expansionTeams = [
  { id: "sea", name: "Seattle Supersonics", abbreviation: "SEA" },
  { id: "lvn", name: "Las Vegas Spades", abbreviation: "LVN" },
];

interface TeamSidebarProps {
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
  protectedCounts: Record<string, number>;
  teamsWithData: string[];
  mode: AppMode;
  onToggleMode: () => void;
  draftedCounts?: Record<string, number>;
}

export function TeamSidebar({
  selectedTeamId,
  onSelectTeam,
  protectedCounts,
  teamsWithData,
  mode,
  onToggleMode,
  draftedCounts = {},
}: TeamSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const eastern = allTeams.filter((t) => t.conference === "Eastern");
  const western = allTeams.filter((t) => t.conference === "Western");

  const renderTeam = (team: { id: string; name: string; abbreviation: string }, countLabel?: React.ReactNode) => {
    const isActive = selectedTeamId === team.id;

    return (
      <button
        key={team.id}
        onClick={() => onSelectTeam(team.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          "hover:bg-secondary",
          isActive && "bg-primary/15 text-primary border border-primary/30",
          !isActive && "text-muted-foreground"
        )}
      >
        <span className="font-mono text-xs w-8 shrink-0 font-semibold">{team.abbreviation}</span>
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left">{team.name}</span>
            {countLabel}
          </>
        )}
      </button>
    );
  };

  const renderProtectionTeam = (team: typeof allTeams[0]) => {
    const hasData = teamsWithData.includes(team.id);
    const count = protectedCounts[team.id] || 0;
    const countLabel = hasData && count > 0 ? (
      <span className="flex items-center gap-1 text-xs font-mono text-primary">
        <Shield className="h-3 w-3" />{count}
      </span>
    ) : hasData && count === 0 ? (
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
    ) : null;

    return renderTeam(team, countLabel);
  };

  const renderExpansionTeam = (team: typeof expansionTeams[0]) => {
    const count = draftedCounts[team.id] || 0;
    const countLabel = count > 0 ? (
      <span className="flex items-center gap-1 text-xs font-mono text-accent">
        <Target className="h-3 w-3" />{count}/15
      </span>
    ) : (
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
    );
    return renderTeam(team, countLabel);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r border-border bg-sidebar shrink-0 transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Mode toggle */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {mode === "protection" ? "Protection" : "Draft"}
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <button
          onClick={onToggleMode}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-mono transition-colors",
            mode === "draft"
              ? "bg-accent/15 text-accent border border-accent/30"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          {mode === "draft" ? (
            <ToggleRight className="h-4 w-4 shrink-0" />
          ) : (
            <ToggleLeft className="h-4 w-4 shrink-0" />
          )}
          {!collapsed && (
            <span className="truncate">{mode === "protection" ? "Switch to Draft" : "Switch to Protect"}</span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {mode === "protection" ? (
          <>
            <div>
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  Eastern
                </p>
              )}
              <div className="space-y-0.5">{eastern.map(renderProtectionTeam)}</div>
            </div>
            <div>
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  Western
                </p>
              )}
              <div className="space-y-0.5">{western.map(renderProtectionTeam)}</div>
            </div>
          </>
        ) : (
          <div>
            {!collapsed && (
              <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                Expansion Teams
              </p>
            )}
            <div className="space-y-0.5">{expansionTeams.map(renderExpansionTeam)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
