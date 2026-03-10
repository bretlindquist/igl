import { motion } from "framer-motion";
import RankBadge from "./RankBadge";

interface TQEPlayerCardProps {
  rank: number;
  name: string;
  displayName: string;
  gross: number;
  absoluteNet: number;
  compScore: number;
  handiBonus: number;
  finalPoints: number;
  index: number;
}

const TQEPlayerCard = ({ rank, name, displayName, gross, absoluteNet, compScore, handiBonus, finalPoints, index }: TQEPlayerCardProps) => {
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
            {finalPoints}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">pts</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 ml-11">
        <StatPill label="Gross" value={gross} />
        <StatPill label="Net" value={absoluteNet} />
        <StatPill label="Comp" value={compScore} />
        <StatPill label="HB" value={handiBonus} />
      </div>
    </motion.div>
  );
};

const StatPill = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-secondary/60 rounded-md px-2 py-1 text-center">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-xs font-display font-medium text-secondary-foreground">{value}</p>
  </div>
);

export default TQEPlayerCard;
