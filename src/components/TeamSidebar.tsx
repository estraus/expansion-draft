import { allTeams } from "@/data/teams";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useState } from "react";

interface TeamSidebarProps {
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
  protectedCounts: Record<string, number>;
  teamsWithData: string[];
}

export function TeamSidebar({ selectedTeamId, onSelectTeam, protectedCounts, teamsWithData }: TeamSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const eastern = allTeams.filter((t) => t.conference === "Eastern");
  const western = allTeams.filter((t) => t.conference === "Western");

  const renderTeam = (team: typeof allTeams[0]) => {
    const isActive = selectedTeamId === team.id;
    const hasData = teamsWithData.includes(team.id);
    const count = protectedCounts[team.id] || 0;

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
            {hasData && count > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono text-primary">
                <Shield className="h-3 w-3" />
                {count}
              </span>
            )}
            {hasData && count === 0 && (
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen border-r border-border bg-sidebar shrink-0 transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!collapsed && (
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Teams
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-secondary text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        <div>
          {!collapsed && (
            <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
              Eastern
            </p>
          )}
          <div className="space-y-0.5">{eastern.map(renderTeam)}</div>
        </div>
        <div>
          {!collapsed && (
            <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
              Western
            </p>
          )}
          <div className="space-y-0.5">{western.map(renderTeam)}</div>
        </div>
      </div>
    </div>
  );
}
