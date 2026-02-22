import { useState, useCallback } from "react";
import { teamData } from "@/data/teams";
import { TeamSidebar, AppMode } from "@/components/TeamSidebar";
import { RosterTable } from "@/components/RosterTable";
import { DraftPoolTable } from "@/components/DraftPoolTable";
import { AIAssistant } from "@/components/AIAssistant";
import { MethodologyModal } from "@/components/MethodologyModal";
import { ScenarioManager } from "@/components/ScenarioManager";

const teamsWithData = Object.keys(teamData);

// Serialization helpers for Set-based state
interface SerializedState {
  protectedPlayers: Record<string, string[]>;
  draftedPlayers: Record<string, { playerId: string; fromTeamId: string }[]>;
  mode: AppMode;
  selectedTeamId: string;
  selectedExpansionTeamId: string;
}

function serializeState(
  protectedPlayers: Record<string, Set<string>>,
  draftedPlayers: Record<string, { playerId: string; fromTeamId: string }[]>,
  mode: AppMode,
  selectedTeamId: string,
  selectedExpansionTeamId: string
): SerializedState {
  const serialized: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(protectedPlayers)) {
    serialized[k] = Array.from(v);
  }
  return { protectedPlayers: serialized, draftedPlayers, mode, selectedTeamId, selectedExpansionTeamId };
}

function deserializeProtected(data: Record<string, string[]>): Record<string, Set<string>> {
  const result: Record<string, Set<string>> = {};
  for (const [k, v] of Object.entries(data)) {
    result[k] = new Set(v);
  }
  return result;
}

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

  const handleSaveScenario = (name: string) => {
    const state = serializeState(protectedPlayers, draftedPlayers, mode, selectedTeamId, selectedExpansionTeamId);
    const scenarios = JSON.parse(localStorage.getItem("nba-scenarios") || "{}");
    scenarios[name] = { ...state, savedAt: Date.now() };
    localStorage.setItem("nba-scenarios", JSON.stringify(scenarios));
  };

  const handleLoadScenario = (name: string) => {
    const scenarios = JSON.parse(localStorage.getItem("nba-scenarios") || "{}");
    const data = scenarios[name] as SerializedState | undefined;
    if (!data) return;
    setProtectedPlayers(deserializeProtected(data.protectedPlayers));
    setDraftedPlayers(data.draftedPlayers);
    setMode(data.mode);
    setSelectedTeamId(data.selectedTeamId);
    setSelectedExpansionTeamId(data.selectedExpansionTeamId);
  };

  const handleDeleteScenario = (name: string) => {
    const scenarios = JSON.parse(localStorage.getItem("nba-scenarios") || "{}");
    delete scenarios[name];
    localStorage.setItem("nba-scenarios", JSON.stringify(scenarios));
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
        <div className="flex items-center gap-2">
          <ScenarioManager
            onSave={handleSaveScenario}
            onLoad={handleLoadScenario}
            onDelete={handleDeleteScenario}
          />
          <MethodologyModal />
        </div>
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
