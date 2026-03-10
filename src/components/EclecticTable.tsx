import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { EclecticPlayer } from "@/hooks/use-leaderboard";

type SortKey = "rank" | "name" | "score" | "handicap" | "total" | "locked" | `hole-${number}`;
type SortDir = "asc" | "desc";

interface EclecticTableProps {
  players: EclecticPlayer[];
}

const EclecticTable = ({ players }: EclecticTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir(key === "locked" ? "desc" : "asc");
  };

  const sorted = useMemo(() => {
    const data = [...players];
    data.sort((a, b) => {
      if (sortKey === "name") {
        return sortDir === "asc"
          ? a.screenName.localeCompare(b.screenName)
          : b.screenName.localeCompare(a.screenName);
      }

      if (sortKey.startsWith("hole-")) {
        const holeIndex = Number.parseInt(sortKey.split("-")[1], 10);
        const aValue = a.holes[holeIndex];
        const bValue = b.holes[holeIndex];

        if (aValue === null && bValue === null) {
          return 0;
        }
        if (aValue === null) {
          return 1;
        }
        if (bValue === null) {
          return -1;
        }

        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aValue =
        sortKey === "rank"
          ? a.rank
          : sortKey === "score"
            ? a.score
            : sortKey === "handicap"
              ? a.handicap
              : sortKey === "total"
                ? a.total
                : parseFloat(a.holesLocked) || 0;
      const bValue =
        sortKey === "rank"
          ? b.rank
          : sortKey === "score"
            ? b.score
            : sortKey === "handicap"
              ? b.handicap
              : sortKey === "total"
                ? b.total
                : parseFloat(b.holesLocked) || 0;
      return sortDir === "asc" ? aValue - bValue : bValue - aValue;
    });
    return data;
  }, [players, sortDir, sortKey]);

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
            {Array.from({ length: 18 }, (_, i) => (
              <th key={i} className={`px-1.5 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort(`hole-${i}`)}>{i + 1} <SortIcon column={`hole-${i}`} /></th>
            ))}
            <th className={`px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("score")}>Score <SortIcon column="score" /></th>
            <th className={`px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("handicap")}>H&apos;cap <SortIcon column="handicap" /></th>
            <th className={`px-2 py-2 text-center font-display font-semibold text-accent whitespace-nowrap ${thClick}`} onClick={() => handleSort("total")}>Total <SortIcon column="total" /></th>
            <th className={`px-2 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("locked")}>Locked <SortIcon column="locked" /></th>
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
                {player.holes.map((h, j) => (
                  <td key={j} className={`px-1.5 py-2 text-center ${
                    h === null ? "text-muted-foreground/30" :
                    h === -2 ? "text-gold font-semibold" :
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
