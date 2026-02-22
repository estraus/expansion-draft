import { useState } from "react";
import { TeamData, ChatMessage, getMockResponse } from "@/data/teams";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  team: TeamData | null;
}

export function AIAssistant({ team }: AIAssistantProps) {
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");

  const teamId = team?.id || "";
  const messages = chatHistories[teamId] || [];

  const handleSend = () => {
    if (!input.trim() || !teamId) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const assistantMsg: ChatMessage = { role: "assistant", content: getMockResponse(teamId, input) };
    setChatHistories((prev) => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), userMsg, assistantMsg],
    }));
    setInput("");
  };

  if (!team) {
    return (
      <div className="w-80 border-l border-border bg-card flex items-center justify-center shrink-0">
        <p className="text-muted-foreground text-sm font-mono px-4 text-center">
          Select a team with data to view AI analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Bot className="h-4 w-4 text-accent" />
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
                Recommended Protections
              </span>
            </div>
            <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-mono">
              {team.aiRecommendation}
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
            placeholder="Ask about this roster..."
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
