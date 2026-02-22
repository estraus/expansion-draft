import { useState, useRef, useEffect } from "react";
import { TeamData, ChatMessage, teamData } from "@/data/teams";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppMode } from "@/components/TeamSidebar";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface AIAssistantProps {
  team: TeamData | null;
  mode: AppMode;
  expansionTeamId: string;
  draftedPlayers: Record<string, { playerId: string; fromTeamId: string }[]>;
  protectedPlayers: Record<string, Set<string>>;
}

const expansionNames: Record<string, string> = {
  sea: "Seattle Supersonics",
  lvn: "Las Vegas Spades",
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gm-chat`;

function buildRosterContext(
  mode: AppMode,
  team: TeamData | null,
  protectedPlayers: Record<string, Set<string>>,
  draftedPlayers: Record<string, { playerId: string; fromTeamId: string }[]>,
  expansionTeamId: string
): string {
  const lines: string[] = [];
  lines.push(`Mode: ${mode === "protection" ? "Protection Mode" : "Expansion Draft Mode"}`);

  if (mode === "protection" && team) {
    const protSet = protectedPlayers[team.id] || new Set<string>();
    lines.push(`\nTeam: ${team.name} (${team.conference} Conference)`);
    lines.push(`Protected ${protSet.size}/8 players:\n`);
    for (const p of team.players) {
      const status = protSet.has(p.id) ? "PROTECTED" : "EXPOSED";
      lines.push(`- ${p.name} | ${p.position} | Age ${p.age} | $${(p.contractValue / 1e6).toFixed(1)}M | AI Score: ${p.aiScore} | ${status}`);
    }
  } else if (mode === "draft") {
    const teamName = expansionNames[expansionTeamId] || "Expansion Team";
    const myDrafted = draftedPlayers[expansionTeamId] || [];
    lines.push(`\nExpansion Team: ${teamName}`);
    lines.push(`Drafted ${myDrafted.length}/15 players:`);
    for (const d of myDrafted) {
      const t = teamData[d.fromTeamId];
      const p = t?.players.find((pl) => pl.id === d.playerId);
      if (p && t) lines.push(`- ${p.name} (from ${t.abbreviation}) | ${p.position} | Age ${p.age} | $${(p.contractValue / 1e6).toFixed(1)}M | Score: ${p.aiScore}`);
    }

    // Top 15 available
    const allDraftedIds = new Set<string>();
    for (const picks of Object.values(draftedPlayers)) {
      for (const pick of picks) allDraftedIds.add(pick.playerId);
    }
    const pool: { name: string; pos: string; age: number; val: number; score: number; abbr: string }[] = [];
    for (const [tid, t] of Object.entries(teamData)) {
      const protSet = protectedPlayers[tid] || new Set<string>();
      for (const p of t.players) {
        if (!protSet.has(p.id) && !allDraftedIds.has(p.id)) {
          pool.push({ name: p.name, pos: p.position, age: p.age, val: p.contractValue, score: p.aiScore, abbr: t.abbreviation });
        }
      }
    }
    pool.sort((a, b) => b.score - a.score);
    lines.push(`\nTop 15 available unprotected players:`);
    for (const p of pool.slice(0, 15)) {
      lines.push(`- ${p.name} (${p.abbr}) | ${p.pos} | Age ${p.age} | $${(p.val / 1e6).toFixed(1)}M | Score: ${p.score}`);
    }
    lines.push(`\nTotal unprotected pool: ${pool.length} players`);
  }
  return lines.join("\n");
}

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
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatKey = mode === "protection" ? (team?.id || "") : `draft-${expansionTeamId}`;
  const messages = chatHistories[chatKey] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatKey || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const question = input.trim();
    setInput("");
    setIsLoading(true);

    setChatHistories((prev) => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), userMsg],
    }));

    const rosterContext = buildRosterContext(mode, team, protectedPlayers, draftedPlayers, expansionTeamId);
    const chatMessages = [...(chatHistories[chatKey] || []), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages, rosterContext }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        toast.error(err.error || "AI request failed");
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        toast.error("No response stream");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";

      const upsertAssistant = (content: string) => {
        assistantSoFar = content;
        setChatHistories((prev) => {
          const history = prev[chatKey] || [];
          const last = history[history.length - 1];
          if (last?.role === "assistant") {
            return { ...prev, [chatKey]: history.map((m, i) => (i === history.length - 1 ? { ...m, content } : m)) };
          }
          return { ...prev, [chatKey]: [...history, { role: "assistant", content }] };
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              upsertAssistant(assistantSoFar);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              upsertAssistant(assistantSoFar);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      toast.error("Failed to connect to AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-accent ml-auto" />}
      </div>

      {/* Recommendation + Chat */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                {recTitle}
              </span>
            </div>
            <div className="text-xs leading-relaxed text-muted-foreground font-mono prose prose-invert prose-xs max-w-none [&_strong]:text-foreground [&_em]:text-muted-foreground/80 [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0">
              <ReactMarkdown>{recommendation}</ReactMarkdown>
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
                  <div className="prose prose-invert prose-xs max-w-none [&_strong]:text-foreground [&_em]:text-muted-foreground/80 [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
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
            disabled={isLoading}
          />
          <Button size="icon" variant="ghost" onClick={handleSend} disabled={!input.trim() || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
