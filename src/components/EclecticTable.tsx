import type { EclecticPlayer } from "@/hooks/use-leaderboard";

interface EclecticTableProps {
  players: EclecticPlayer[];
}

const EclecticTable = ({ players }: EclecticTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 -mx-1">
      <table className="w-full text-xs font-body">
        <thead>
          <tr className="bg-card border-b border-border/50">
            <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-display font-semibold text-foreground whitespace-nowrap">#</th>
            <th className="sticky left-8 z-10 bg-card px-3 py-2 text-left font-display font-semibold text-foreground whitespace-nowrap min-w-[140px]">Name</th>
            {Array.from({ length: 18 }, (_, i) => (
              <th key={i} className="px-1.5 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap">{i + 1}</th>
            ))}
            <th className="px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap">Score</th>
            <th className="px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap">H&apos;cap</th>
            <th className="px-2 py-2 text-center font-display font-semibold text-accent whitespace-nowrap">Total</th>
            <th className="px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap">Locked</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => {
            const isTop3 = i < 3;
            return (
              <tr
                key={player.screenName}
                className={`border-b border-border/30 ${isTop3 ? "bg-primary/5" : i % 2 === 0 ? "bg-card/30" : ""}`}
              >
                <td className="sticky left-0 z-10 px-3 py-2 text-muted-foreground font-display bg-inherit">{i + 1}</td>
                <td className="sticky left-8 z-10 px-3 py-2 font-display font-medium text-foreground whitespace-nowrap bg-inherit">{player.screenName}</td>
                {player.holes.map((h, j) => (
                  <td key={j} className={`px-1.5 py-2 text-center ${
                    h === null ? "text-muted-foreground/30" :
                    h < 0 ? "text-primary font-medium" :
                    h > 0 ? "text-destructive font-medium" :
                    "text-muted-foreground"
                  }`}>
                    {h === null ? "·" : h > 0 ? `+${h}` : h}
                  </td>
                ))}
                <td className="px-2 py-2 text-center text-muted-foreground">{player.score}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{player.handicap}</td>
                <td className={`px-2 py-2 text-center font-display font-bold ${isTop3 ? "text-accent" : "text-foreground"}`}>{player.total}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{player.holesLocked}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EclecticTable;
