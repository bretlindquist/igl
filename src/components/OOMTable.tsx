import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { OOMPlayer } from "@/hooks/use-leaderboard";

const GROUP_COLORS = [
  "bg-primary/10",   // Top 8 - gold tint
  "bg-accent/8",     // Next 8 - accent tint  
  "bg-secondary/40", // Next 8 - secondary tint
];

type SortKey = "rank" | "total" | "appr" | `round-${number}`;
type SortDir = "asc" | "desc";

interface OOMTableProps {
  players: OOMPlayer[];
  courseLegend: { num: string; name: string }[];
}

const OOMTable = ({ players, courseLegend }: OOMTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  };

  const sorted = useMemo(() => {
    const arr = [...players];
    arr.sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "rank") { va = a.rank; vb = b.rank; }
      else if (sortKey === "total") { va = a.grandTotal; vb = b.grandTotal; }
      else if (sortKey === "appr") { va = a.appr; vb = b.appr; }
      else { const idx = parseInt(sortKey.split("-")[1]); va = a.rounds[idx] ?? 0; vb = b.rounds[idx] ?? 0; }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [players, sortKey, sortDir]);

  const getGroupColor = (index: number) => {
    if (index < 8) return GROUP_COLORS[0];
    if (index < 16) return GROUP_COLORS[1];
    if (index < 24) return GROUP_COLORS[2];
    return "";
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="inline ml-0.5 h-3 w-3 opacity-30" />;
    return sortDir === "asc"
      ? <ArrowUp className="inline ml-0.5 h-3 w-3 text-accent" />
      : <ArrowDown className="inline ml-0.5 h-3 w-3 text-accent" />;
  };

  const thClick = "cursor-pointer select-none hover:text-foreground transition-colors";

  return (
    <div className="space-y-2">
      {/* Course legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[10px] font-body text-muted-foreground">
        {courseLegend.map((c) => (
          <span key={c.num}>
            <span className="font-display font-semibold text-foreground">{c.num}</span>{" "}
            {c.name}
          </span>
        ))}
      </div>

      {/* Group legend */}
      <div className="flex gap-3 px-1 text-[10px] font-body text-muted-foreground">
        <span className="flex items-center gap-1"><span className={`inline-block w-3 h-3 rounded-sm ${GROUP_COLORS[0]}`} /> Group A (1-8)</span>
        <span className="flex items-center gap-1"><span className={`inline-block w-3 h-3 rounded-sm ${GROUP_COLORS[1]}`} /> Group B (9-16)</span>
        <span className="flex items-center gap-1"><span className={`inline-block w-3 h-3 rounded-sm ${GROUP_COLORS[2]}`} /> Group C (17-24)</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50 -mx-1">
        <table className="w-full text-xs font-body">
          <thead>
            <tr className="bg-card border-b border-border/50">
              <th className={`sticky left-0 z-10 bg-card px-3 py-2 text-left font-display font-semibold text-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("rank")}># <SortIcon col="rank" /></th>
              <th className="sticky left-8 z-10 bg-card px-3 py-2 text-left font-display font-semibold text-foreground whitespace-nowrap min-w-[140px]">Name</th>
              {courseLegend.map((c, i) => (
                <th key={c.num} className={`px-3 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap min-w-[40px] ${thClick}`} onClick={() => handleSort(`round-${i}`)}>{c.num} <SortIcon col={`round-${i}`} /></th>
              ))}
              <th className={`px-3 py-2 text-center font-display font-semibold text-accent whitespace-nowrap ${thClick}`} onClick={() => handleSort("total")}>Total <SortIcon col="total" /></th>
              <th className={`px-3 py-2 text-center font-display font-medium text-muted-foreground whitespace-nowrap ${thClick}`} onClick={() => handleSort("appr")}>APPR <SortIcon col="appr" /></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => {
              const groupBg = getGroupColor(i);
              return (
                <tr
                  key={player.screenName}
                  className={`border-b border-border/30 ${groupBg}`}
                >
                  <td className={`sticky left-0 z-10 px-3 py-2 text-muted-foreground font-display ${groupBg || "bg-background"}`}>{player.rank}</td>
                  <td className={`sticky left-8 z-10 px-3 py-2 font-display font-medium text-foreground whitespace-nowrap ${groupBg || "bg-background"}`}>{player.screenName}</td>
                  {player.rounds.map((r, j) => (
                    <td key={j} className={`px-3 py-2 text-center min-w-[40px] ${r > 0 ? "text-primary font-medium" : "text-muted-foreground/40"}`}>
                      {r}
                    </td>
                  ))}
                  <td className={`px-3 py-2 text-center font-display font-bold ${i < 3 ? "text-accent" : "text-foreground"}`}>{player.grandTotal}</td>
                  <td className="px-3 py-2 text-center text-muted-foreground">{player.appr.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OOMTable;
