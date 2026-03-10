import type { TQEPlayer } from "@/hooks/use-leaderboard";

interface TQETableProps {
  players: TQEPlayer[];
}

const TQETable = ({ players }: TQETableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 -mx-1">
      <table className="w-full text-xs font-body">
        <thead>
          <tr className="bg-card border-b border-border/50">
            <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-display font-semibold text-foreground whitespace-nowrap">#</th>
            <th className="sticky left-8 z-10 bg-card px-3 py-2 text-left font-display font-semibold text-foreground whitespace-nowrap min-w-[140px]">Name</th>
            <th className="px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap">Gross</th>
            <th className="px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap">Net</th>
            <th className="px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap">Comp</th>
            <th className="px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap">HB</th>
            <th className="px-2 py-2 text-center font-display font-semibold text-accent whitespace-nowrap">Points</th>
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
                <td className="px-2 py-2 text-center text-muted-foreground">{player.gross}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{player.absoluteNet}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{player.compScore}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{player.handiBonus}</td>
                <td className={`px-2 py-2 text-center font-display font-bold ${isTop3 ? "text-accent" : "text-foreground"}`}>{player.finalPoints}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TQETable;
