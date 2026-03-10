import { SEASONS } from "@/config/data-sources";
import { ChevronDown } from "lucide-react";

interface SeasonSelectorProps {
  seasonId: string;
  onChange: (id: string) => void;
}

const SeasonSelector = ({ seasonId, onChange }: SeasonSelectorProps) => {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={seasonId}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-xs text-muted-foreground font-display font-semibold pr-5 pl-1 py-0.5 cursor-pointer focus:outline-none hover:text-foreground transition-colors"
      >
        {SEASONS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
};

export default SeasonSelector;
