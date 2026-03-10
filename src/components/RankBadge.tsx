import { Trophy } from "lucide-react";

interface RankBadgeProps {
  rank: number;
}

const RankBadge = ({ rank }: RankBadgeProps) => {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/20">
        <Trophy className="w-4 h-4 text-gold" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-silver/20">
        <Trophy className="w-4 h-4 text-silver" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bronze/20">
        <Trophy className="w-4 h-4 text-bronze" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
      <span className="text-xs font-display font-semibold text-muted-foreground">{rank}</span>
    </div>
  );
};

export default RankBadge;
