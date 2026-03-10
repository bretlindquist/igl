import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { TQEPlayer } from "@/hooks/use-leaderboard";

type SortKey = "rank" | "name" | "gross" | "net" | "comp" | "hb" | "points";
type SortDir = "asc" | "desc";

interface TQETableProps {
  players: TQEPlayer[];
}

const TQETable = ({ players }: TQETableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rankedPlayers = useMemo(
    () => players.map((player, index) => ({ ...player, rank: index + 1 })),
    [players]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "rank" || key === "name" ? "asc" : "desc");
  };

  const sorted = useMemo(() => {
    const data = [...rankedPlayers];
    data.sort((a, b) => {
      if (sortKey === "name") {
        return sortDir === "asc"
          ? a.screenName.localeCompare(b.screenName)
          : b.screenName.localeCompare(a.screenName);
      }

      const aValue =
        sortKey === "rank"
          ? a.rank
          : sortKey === "gross"
            ? a.gross
            : sortKey === "net"
              ? a.absoluteNet
              : sortKey === "comp"
                ? a.compScore
                : sortKey === "hb"
                  ? a.handiBonus
                  : a.finalPoints;
      const bValue =
        sortKey === "rank"
          ? b.rank
          : sortKey === "gross"
            ? b.gross
            : sortKey === "net"
              ? b.absoluteNet
              : sortKey === "comp"
                ? b.compScore
                : sortKey === "hb"
                  ? b.handiBonus
                  : b.finalPoints;
      return sortDir === "asc" ? aValue - bValue : bValue - aValue;
    });
    return data;
  }, [rankedPlayers, sortDir, sortKey]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="ml-0.5 inline h-3 w-3 opacity-30" />;
    }

    return sortDir === "asc" ? (
      <ArrowUp className="ml-0.5 inline h-3 w-3 text-accent" />
    ) : (
      <ArrowDown className="ml-0.5 inline h-3 w-3 text-accent" />
    );
  };

  const thClick = "cursor-pointer select-none hover:text-foreground transition-colors";

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 -mx-1">
      <table className="w-full text-xs font-body">
        <thead>
          <tr className="bg-card border-b border-border/50">
            <th className={`sticky left-0 z-10 bg-card px-3 py-2 text-left font-display font-semibold text-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("rank")}># <SortIcon column="rank" /></th>
            <th className={`sticky left-8 z-10 bg-card px-3 py-2 text-left font-display font-semibold text-foreground whitespace-nowrap min-w-[140px] ${thClick}`} onClick={() => handleSort("name")}>Name <SortIcon column="name" /></th>
            <th className={`px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("gross")}>Gross <SortIcon column="gross" /></th>
            <th className={`px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("net")}>Net <SortIcon column="net" /></th>
            <th className={`px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("comp")}>Comp <SortIcon column="comp" /></th>
            <th className={`px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("hb")}>HB <SortIcon column="hb" /></th>
            <th className={`px-2 py-2 text-center font-display font-semibold text-accent whitespace-nowrap ${thClick}`} onClick={() => handleSort("points")}>Points <SortIcon column="points" /></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((player, i) => {
            const isTop3 = player.rank <= 3;
            return (
              <tr
                key={player.screenName}
                className={`border-b border-border/30 ${isTop3 ? "bg-primary/5" : i % 2 === 0 ? "bg-card/30" : ""}`}
              >
                <td className="sticky left-0 z-10 px-3 py-2 text-muted-foreground font-display bg-inherit">{player.rank}</td>
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
