import { motion } from "framer-motion";
import RankBadge from "./RankBadge";

interface PlayerCardProps {
  rank: number;
  name: string;
  displayName: string;
  points: number;
  appr: number;
  index: number;
}

const PlayerCard = ({ rank, name, displayName, points, appr, index }: PlayerCardProps) => {
  const isTop3 = rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isTop3 ? "glass-card glow-green" : "bg-card/50"
      }`}
    >
      <RankBadge rank={rank} />
      <div className="flex-1 min-w-0">
        <p className={`font-display font-semibold text-sm truncate ${isTop3 ? "text-foreground" : "text-foreground/80"}`}>
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-display font-bold text-base ${isTop3 ? "text-gradient-gold" : "text-foreground"}`}>
          {points}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {appr.toFixed(1)} APPR
        </p>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
