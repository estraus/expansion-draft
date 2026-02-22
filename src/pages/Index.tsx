import { useState, useCallback } from "react";
import { teamData } from "@/data/teams";
import { TeamSidebar, AppMode } from "@/components/TeamSidebar";
import { RosterTable } from "@/components/RosterTable";
import { DraftPoolTable } from "@/components/DraftPoolTable";
import { AIAssistant } from "@/components/AIAssistant";
import { MethodologyModal } from "@/components/MethodologyModal";

const teamsWithData = Object.keys(teamData);

const Index = () => {
  const [mode, setMode] = useState<AppMode>("protection");
  const [selectedTeamId, setSelectedTeamId] = useState("chi");
  const [selectedExpansionTeamId, setSelectedExpansionTeamId] = useState("sea");
  const [protectedPlayers, setProtectedPlayers] = useState<Record<string, Set<string>>>({});
  const [draftedPlayers, setDraftedPlayers] = useState<Record<string, { playerId: string; fromTeamId: string }[]>>({});

  const currentTeam = teamData[selectedTeamId] || null;
  const currentProtected = protectedPlayers[selectedTeamId] || new Set<string>();

  const handleToggleProtect = useCallback(
    (playerId: string) => {
      setProtectedPlayers((prev) => {
        const current = new Set(prev[selectedTeamId] || []);
        if (current.has(playerId)) {
          current.delete(playerId);
        } else if (current.size < 8) {
          current.add(playerId);
        }
        return { ...prev, [selectedTeamId]: current };
      });
    },
    [selectedTeamId]
  );

  const handleDraftPlayer = useCallback(
    (playerId: string, fromTeamId: string) => {
      setDraftedPlayers((prev) => {
        const current = prev[selectedExpansionTeamId] || [];
        if (current.length >= 15) return prev;
        if (current.some((d) => d.playerId === playerId)) return prev;
        return { ...prev, [selectedExpansionTeamId]: [...current, { playerId, fromTeamId }] };
      });
    },
    [selectedExpansionTeamId]
  );

  const handleToggleMode = () => {
    setMode((m) => (m === "protection" ? "draft" : "protection"));
  };

  const handleSelectTeam = (teamId: string) => {
    if (mode === "protection") {
      setSelectedTeamId(teamId);
    } else {
      setSelectedExpansionTeamId(teamId);
    }
  };

  const protectedCounts: Record<string, number> = {};
  for (const [teamId, players] of Object.entries(protectedPlayers)) {
    protectedCounts[teamId] = players.size;
  }

  const draftedCounts: Record<string, number> = {};
  for (const [teamId, picks] of Object.entries(draftedPlayers)) {
    draftedCounts[teamId] = picks.length;
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Top nav bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-sidebar shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold tracking-tight text-foreground">NBA Expansion Draft Simulator</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/20">v1.0</span>
        </div>
        <MethodologyModal />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <TeamSidebar
          selectedTeamId={mode === "protection" ? selectedTeamId : selectedExpansionTeamId}
          onSelectTeam={handleSelectTeam}
          protectedCounts={protectedCounts}
          teamsWithData={teamsWithData}
          mode={mode}
          onToggleMode={handleToggleMode}
          draftedCounts={draftedCounts}
        />
        {mode === "protection" ? (
          <RosterTable
            team={currentTeam}
            protectedPlayers={currentProtected}
            onToggleProtect={handleToggleProtect}
          />
        ) : (
          <DraftPoolTable
            expansionTeamId={selectedExpansionTeamId}
            protectedPlayers={protectedPlayers}
            draftedPlayers={draftedPlayers}
            onDraftPlayer={handleDraftPlayer}
          />
        )}
        <AIAssistant team={mode === "protection" ? currentTeam : null} mode={mode} expansionTeamId={selectedExpansionTeamId} draftedPlayers={draftedPlayers} protectedPlayers={protectedPlayers} />
      </div>
    </div>
  );
};

export default Index;
