import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Shield, ToggleRight, Target } from "lucide-react";

const steps = [
  {
    icon: Shield,
    title: "1. Protect Current Rosters",
    desc: "Navigate through all 30 NBA teams and toggle up to 8 players per team as \"Protected.\" These players are safe from the expansion draft.",
  },
  {
    icon: ToggleRight,
    title: "2. Switch to Expansion Mode",
    desc: "Use the mode toggle in the sidebar to enter Draft Mode. The sidebar switches to show the two expansion franchises: Seattle and Las Vegas.",
  },
  {
    icon: Target,
    title: "3. Draft New Teams",
    desc: "Select an expansion team and draft from the unprotected player pool. Each franchise drafts 15 players. Once a player is picked, they're removed from the pool.",
  },
];

const legendItems = [
  { symbol: "WS/48", desc: "Win Shares per 48 minutes — an advanced efficiency metric capturing a player's overall contribution per minute played." },
  { symbol: "Age", desc: "The age modifier (35 − Age) penalizes older players, weighting younger talent with more remaining prime years." },
  { symbol: "AAV", desc: "Average Annual Value of the player's contract. The logarithmic denominator discounts high-salary players, rewarding cost efficiency." },
  { symbol: "Wₚₒₛ", desc: "Positional scarcity weight — adjusts value based on how rare elite production is at each position (e.g., centers vs. guards)." },
];

export function MethodologyModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
          AI Methodology
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg tracking-tight">AI Methodology & Walkthrough</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 pt-2">
          {/* Walkthrough */}
          <section className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">How to Use the Simulator</h3>
            <div className="space-y-3">
              {steps.map((s) => (
                <div key={s.title} className="flex gap-3 items-start p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PSV Formula */}
          <section className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">Projected Surplus Value (PSV) Breakdown</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each player's PSV (1–100) is computed using a composite formula that balances on-court efficiency, age trajectory, contract value, and positional scarcity:
            </p>
            <div className="flex flex-col items-center gap-2 py-5 px-6 rounded-lg bg-secondary/60 border border-border/50">
              <div className="text-center font-mono text-sm leading-loose">
                <span className="text-foreground font-semibold">PSV</span>
                <span className="text-muted-foreground mx-2">=</span>
                <span className="inline-flex flex-col items-center mx-1 align-middle">
                  <span className="border-b border-muted-foreground/40 px-3 pb-1">
                    <span className="text-accent">WS/48</span>
                    <span className="text-muted-foreground mx-1">×</span>
                    <span className="text-foreground">(35 − Age)</span>
                  </span>
                  <span className="pt-1">
                    <span className="text-muted-foreground">ln(</span>
                    <span className="text-accent">AAV</span>
                    <span className="text-muted-foreground"> + 1)</span>
                  </span>
                </span>
                <span className="text-muted-foreground mx-2">×</span>
                <span className="text-foreground italic">W<sub>pos</sub></span>
              </div>
            </div>
          </section>

          {/* Legend */}
          <section className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">Variable Legend</h3>
            <div className="space-y-2">
              {legendItems.map((item) => (
                <div key={item.symbol} className="flex gap-3 items-start text-xs">
                  <span className="shrink-0 w-16 text-right font-mono text-accent font-semibold pt-0.5">
                    {item.symbol}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
