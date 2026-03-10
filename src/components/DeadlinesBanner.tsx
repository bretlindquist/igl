import { Clock } from "lucide-react";

const deadlines = [
  { course: "Mauna Ocean Resort (Mauna/Ocean)", deadline: "8/3/2026" },
  { course: "Turnberry (Ailsa)", deadline: "22/3/2026" },
];

const DeadlinesBanner = () => {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-accent" />
        <h3 className="font-display font-semibold text-sm text-foreground">Entry Deadlines</h3>
      </div>
      <div className="space-y-2">
        {deadlines.map((d) => (
          <div key={d.course} className="flex items-center justify-between text-xs">
            <span className="text-secondary-foreground">{d.course}</span>
            <span className="font-display font-medium text-accent">{d.deadline}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeadlinesBanner;
