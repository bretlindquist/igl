import { motion } from "framer-motion";
import RankBadge from "./RankBadge";

interface EclecticPlayerCardProps {
  rank: number;
  name: string;
  displayName: string;
  score: number;
  handicap: number;
  total: number;
  holesLocked: string;
  holes: (number | null)[];
  index: number;
}

const EclecticPlayerCard = ({ rank, name, displayName, score, handicap, total, holesLocked, holes, index }: EclecticPlayerCardProps) => {
  const isTop3 = rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      className={`px-4 py-3 rounded-lg transition-colors ${
        isTop3 ? "glass-card glow-green" : "bg-card/50"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <RankBadge rank={rank} />
        <div className="flex-1 min-w-0">
          <p className={`font-display font-semibold text-sm truncate ${isTop3 ? "text-foreground" : "text-foreground/80"}`}>
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">{name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`font-display font-bold text-lg ${isTop3 ? "text-gradient-gold" : "text-foreground"}`}>
            {total}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">total</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 ml-11">
        <StatPill label="Score" value={String(score)} />
        <StatPill label="H'cap" value={String(handicap)} />
        <StatPill label="Locked" value={holesLocked} />
      </div>
      {/* Hole-by-hole mini grid */}
      <div className="mt-2 ml-11 grid grid-cols-9 gap-0.5">
        {holes.map((h, i) => (
          <div
            key={i}
            className={`text-center text-[9px] font-display rounded py-0.5 ${
              h === null ? "bg-secondary/30 text-muted-foreground/40" :
              h === -2 ? "bg-gold/20 text-gold" :
              h < 0 ? "bg-primary/20 text-primary" :
              h > 0 ? "bg-destructive/20 text-destructive" :
              "bg-secondary/50 text-muted-foreground"
            }`}
            title={`Hole ${i + 1}`}
          >
            {h === null ? "·" : h > 0 ? `+${h}` : h}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const StatPill = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-secondary/60 rounded-md px-2 py-1 text-center">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-xs font-display font-medium text-secondary-foreground">{value}</p>
  </div>
);

export default EclecticPlayerCard;
