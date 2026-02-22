import { FeatureWeight } from "@/data/teams";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Brain } from "lucide-react";

interface ScoreTooltipProps {
  score: number;
  weights: FeatureWeight[];
}

export function ScoreTooltip({ score, weights }: ScoreTooltipProps) {
  const positives = weights.filter((w) => w.impact > 0).slice(0, 4);
  const negatives = weights.filter((w) => w.impact < 0).slice(0, 4);
  const maxAbs = Math.max(...weights.map((w) => Math.abs(w.impact)), 1);

  return (
    <div className="w-72 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold">
            Model Explainability
          </span>
        </div>
        <span className="font-mono text-sm font-bold text-foreground">{score}</span>
      </div>

      {/* Positive drivers */}
      {positives.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-score-high" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-score-high">
              Positive Drivers
            </span>
          </div>
          {positives.map((w) => (
            <div key={w.feature} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-28 shrink-0 truncate">{w.feature}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-score-high/70 rounded-full transition-all"
                  style={{ width: `${(w.impact / maxAbs) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-score-high w-8 text-right shrink-0">
                +{w.impact}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Negative drivers */}
      {negatives.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-score-low" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-score-low">
              Negative Drivers
            </span>
          </div>
          {negatives.map((w) => (
            <div key={w.feature} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-28 shrink-0 truncate">{w.feature}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-score-low/70 rounded-full transition-all"
                  style={{ width: `${(Math.abs(w.impact) / maxAbs) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-score-low w-8 text-right shrink-0">
                {w.impact}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground/50 font-mono border-t border-border/50 pt-2">
        Feature weights from gradient-boosted ensemble model
      </p>
    </div>
  );
}
