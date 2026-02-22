import { useState } from "react";
import { TeamData, ChatMessage, getMockResponse, teamData } from "@/data/teams";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppMode } from "@/components/TeamSidebar";

interface AIAssistantProps {
  team: TeamData | null;
  mode: AppMode;
  expansionTeamId: string;
  draftedPlayers: Record<string, { playerId: string; fromTeamId: string }[]>;
  protectedPlayers: Record<string, Set<string>>;
}

const expansionNames: Record<string, string> = {
  sea: "Seattle Supersonics",
  lvn: "Las Vegas Aces",
};

function buildDraftRecommendation(
  expansionTeamId: string,
  protectedPlayers: Record<string, Set<string>>,
  draftedPlayers: Record<string, { playerId: string; fromTeamId: string }[]>
): string {
  const allDraftedIds = new Set<string>();
  for (const picks of Object.values(draftedPlayers)) {
    for (const pick of picks) allDraftedIds.add(pick.playerId);
  }

  type PoolPlayer = { name: string; aiScore: number; position: string; contractValue: number; teamAbbr: string };
  const pool: PoolPlayer[] = [];
  for (const [tid, team] of Object.entries(teamData)) {
    const protSet = protectedPlayers[tid] || new Set<string>();
    for (const p of team.players) {
      if (!protSet.has(p.id) && !allDraftedIds.has(p.id)) {
        pool.push({ name: p.name, aiScore: p.aiScore, position: p.position, contractValue: p.contractValue, teamAbbr: team.abbreviation });
      }
    }
  }

  const sorted = pool.sort((a, b) => b.aiScore - a.aiScore).slice(0, 10);
  const teamName = expansionNames[expansionTeamId] || "Expansion Team";
  let rec = `**Draft Recommendations — ${teamName}**\n\nTop available players by AI Score:\n\n`;
  sorted.forEach((p, i) => {
    rec += `${i + 1}. **${p.name}** (${p.teamAbbr}) — ${p.position}, Score: ${p.aiScore}, $${(p.contractValue / 1e6).toFixed(1)}M\n`;
  });
  rec += `\n*Focus on high-score players with team-friendly contracts. Balance positional needs across your 15-man roster.*`;
  return rec;
}

export function AIAssistant({ team, mode, expansionTeamId, draftedPlayers, protectedPlayers }: AIAssistantProps) {
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");

  const chatKey = mode === "protection" ? (team?.id || "") : `draft-${expansionTeamId}`;
  const messages = chatHistories[chatKey] || [];

  const handleSend = () => {
    if (!input.trim() || !chatKey) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const assistantMsg: ChatMessage = { role: "assistant", content: getMockResponse(chatKey, input) };
    setChatHistories((prev) => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), userMsg, assistantMsg],
    }));
    setInput("");
  };

  if (mode === "protection" && !team) {
    return (
      <div className="w-80 border-l border-border bg-card flex items-center justify-center shrink-0">
        <p className="text-muted-foreground text-sm font-mono px-4 text-center">
          Select a team with data to view AI analysis.
        </p>
      </div>
    );
  }

  const recommendation = mode === "protection"
    ? team!.aiRecommendation
    : buildDraftRecommendation(expansionTeamId, protectedPlayers, draftedPlayers);

  const recTitle = mode === "protection" ? "Recommended Protections" : "Draft Recommendations";

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        {mode === "draft" ? <Target className="h-4 w-4 text-accent" /> : <Bot className="h-4 w-4 text-accent" />}
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI GM Assistant
        </h3>
      </div>

      {/* Recommendation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                {recTitle}
              </span>
            </div>
            <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-mono">
              {recommendation}
            </div>
          </div>

          {/* Chat messages */}
          {messages.length > 0 && (
            <div className="border-t border-border pt-3 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                Conversation
              </span>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-xs p-2 rounded",
                    msg.role === "user"
                      ? "bg-primary/10 text-primary ml-4"
                      : "bg-secondary text-secondary-foreground mr-4"
                  )}
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider block mb-1 opacity-60">
                    {msg.role === "user" ? "You" : "AI GM"}
                  </span>
                  {msg.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={mode === "protection" ? "Ask about this roster..." : "Ask about the draft pool..."}
            className="flex-1 bg-secondary text-sm rounded px-3 py-2 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
          />
          <Button size="icon" variant="ghost" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
