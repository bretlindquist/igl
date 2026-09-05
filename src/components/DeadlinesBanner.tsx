import { Clock } from "lucide-react";
import type { SeasonEvent } from "@/config/data-sources";

interface DeadlinesBannerProps {
  seasonLabel: string;
  events: SeasonEvent[];
}

const DeadlinesBanner = ({ seasonLabel, events }: DeadlinesBannerProps) => {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-accent" />
        <h3 className="font-display font-semibold text-sm text-foreground">
          {seasonLabel} Courses &amp; Entry Deadlines
        </h3>
      </div>
      <div className="mb-3 space-y-1 text-[11px] text-muted-foreground">
        <p>Green and Pin location - Odd TQE (1, 3, 5, 7) - Left / Left.</p>
        <p>Green and Pin location - Even TQE (2, 4, 6) - Right / Right.</p>
      </div>
      <div className="space-y-2">
        {events.map((d) => (
          <div key={d.label} className="flex items-start justify-between gap-3 text-xs">
            <div>
              <p className="font-display font-medium text-foreground">{d.label}: {d.course}</p>
              {d.koreanCourse ? (
                <p className="font-display text-muted-foreground">{d.koreanCourse}</p>
              ) : null}
              <p className="text-muted-foreground">Green / Pin: {d.setup}</p>
            </div>
            <span className="shrink-0 font-display font-medium text-accent">{d.deadline}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeadlinesBanner;
