import { Clock } from "lucide-react";

const deadlines = [
  { label: "TQE-1", course: "Mauna Ocean Resort (Mauna/Ocean)", deadline: "8/3/2026", setup: "Left / Left" },
  { label: "TQE-2", course: "Turnberry (Ailsa)", deadline: "22/3/2026", setup: "Right / Right" },
  { label: "TQE-3", course: "Bay Hill", deadline: "5/4/2026", setup: "Left / Left" },
  { label: "TQE-4", course: "Bugok", deadline: "19/4/2026", setup: "Right / Right" },
  { label: "TQE-5", course: "TBD", deadline: "TBD", setup: "Left / Left" },
  { label: "TQE-6", course: "TBD", deadline: "TBD", setup: "Right / Right" },
  { label: "TQE-7", course: "TBD", deadline: "TBD", setup: "Left / Left" },
];

const DeadlinesBanner = () => {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-accent" />
        <h3 className="font-display font-semibold text-sm text-foreground">Entry Deadlines</h3>
      </div>
      <div className="mb-3 space-y-1 text-[11px] text-muted-foreground">
        <p>Green and Pin location - Odd TQE (1, 3, 5, 7) - Left / Left.</p>
        <p>Green and Pin location - Even TQE (2, 4, 6) - Right / Right.</p>
      </div>
      <div className="space-y-2">
        {deadlines.map((d) => (
          <div key={d.label} className="flex items-start justify-between gap-3 text-xs">
            <div>
              <p className="font-display font-medium text-foreground">{d.label}: {d.course}</p>
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
