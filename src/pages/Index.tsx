import { useState, useCallback } from "react";
import { teamData } from "@/data/teams";
import { TeamSidebar } from "@/components/TeamSidebar";
import { RosterTable } from "@/components/RosterTable";
import { AIAssistant } from "@/components/AIAssistant";

const teamsWithData = Object.keys(teamData);

const Index = () => {
  const [selectedTeamId, setSelectedTeamId] = useState("chi");
  const [protectedPlayers, setProtectedPlayers] = useState<Record<string, Set<string>>>({});

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

  const protectedCounts: Record<string, number> = {};
  for (const [teamId, players] of Object.entries(protectedPlayers)) {
    protectedCounts[teamId] = players.size;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <TeamSidebar
        selectedTeamId={selectedTeamId}
        onSelectTeam={setSelectedTeamId}
        protectedCounts={protectedCounts}
        teamsWithData={teamsWithData}
      />
      <RosterTable
        team={currentTeam}
        protectedPlayers={currentProtected}
        onToggleProtect={handleToggleProtect}
      />
      <AIAssistant team={currentTeam} />
    </div>
  );
};

export default Index;
