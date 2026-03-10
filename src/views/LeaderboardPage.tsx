"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import DeadlinesBanner from "@/components/DeadlinesBanner";
import EclecticPlayerCard from "@/components/EclecticPlayerCard";
import EclecticTable from "@/components/EclecticTable";
import OOMTable from "@/components/OOMTable";
import PlayerCard from "@/components/PlayerCard";
import SearchBar from "@/components/SearchBar";
import SeasonSelector from "@/components/SeasonSelector";
import TabNav from "@/components/TabNav";
import TQEPlayerCard from "@/components/TQEPlayerCard";
import TQETable from "@/components/TQETable";
import ViewToggle from "@/components/ViewToggle";
import { DEFAULT_SEASON, SEASONS, getSeason } from "@/config/data-sources";
import { useEclecticData, useOOMData, useTQEData } from "@/hooks/use-leaderboard";

function parseName(screenName: string): { username: string; displayName: string } {
  const match = screenName.match(/^(.+?)\s*\((.+)\)$/);
  if (match) {
    return {
      username: match[1].trim(),
      displayName: screenName.replace(match[1].trim(), "").replace(/^\s*\(/, "").replace(/\)$/, ""),
    };
  }

  return { username: screenName, displayName: screenName };
}

function filterPlayers<T extends { screenName: string }>(players: T[], search: string): T[] {
  if (!search.trim()) {
    return players;
  }

  const terms = search
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

  return players.filter((player) =>
    terms.some((term) => player.screenName.toLowerCase().includes(term))
  );
}

function tabToTqeKey(tab: string): string {
  const match = tab.match(/^TQE-(\d+)$/);
  return match ? `tqe${match[1]}` : "";
}

export default function LeaderboardPage() {
  const [seasonId, setSeasonId] = useState(DEFAULT_SEASON.id);
  const [activeTab, setActiveTab] = useState("OOM");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const season = getSeason(seasonId);

  const handleSeasonChange = (id: string) => {
    const nextSeason = getSeason(id);
    setSeasonId(id);
    if (!nextSeason.tabs.includes(activeTab)) {
      setActiveTab("OOM");
    }
  };

  const oom = useOOMData(season);
  const tqeKey = tabToTqeKey(activeTab);
  const tqe = useTQEData(season, tqeKey);
  const eclectic = useEclecticData(season);

  const filteredOOM = useMemo(() => filterPlayers(oom.data ?? [], search), [oom.data, search]);
  const isTQE = activeTab.startsWith("TQE");
  const isEclectic = activeTab === "Eclectic";
  const filteredTQE = useMemo(() => filterPlayers(tqe.data ?? [], search), [tqe.data, search]);
  const filteredEclectic = useMemo(
    () => filterPlayers(eclectic.data ?? [], search),
    [eclectic.data, search]
  );

  const isLoading =
    activeTab === "OOM" ? oom.isLoading : isEclectic ? eclectic.isLoading : tqe.isLoading;

  const hasData =
    activeTab === "OOM"
      ? filteredOOM.length > 0
      : isEclectic
        ? filteredEclectic.length > 0
        : filteredTQE.some((player) => player.finalPoints > 0);

  const tqeName = isTQE ? season.tqeNames[tqeKey] || activeTab : "";
  const shellWidth = view === "table" ? "max-w-4xl" : "max-w-lg";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className={`container mx-auto px-4 py-3 ${shellWidth}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">
                ⛳ Itaewon Golf League
              </h1>
              <SeasonSelector seasonId={seasonId} onChange={handleSeasonChange} />
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle view={view} onChange={setView} />
              <div className="rounded-full bg-primary/10 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-widest text-primary">
                {season.id === SEASONS[0].id ? "Live" : "Archive"}
              </div>
            </div>
          </div>
          <TabNav tabs={season.tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      <main className={`container mx-auto space-y-4 px-4 py-4 ${shellWidth}`}>
        <SearchBar value={search} onChange={setSearch} />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {!isLoading && activeTab === "OOM" ? (
            <motion.div
              key={`oom-${view}-${seasonId}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <p className="px-1 font-display text-xs text-muted-foreground">
                Order of Merit - {filteredOOM.length} players
              </p>
              {view === "table" ? (
                <OOMTable players={filteredOOM} courseLegend={season.courseLegend} />
              ) : (
                filteredOOM.map((player, index) => {
                  const { username, displayName } = parseName(player.screenName);
                  return (
                    <PlayerCard
                      key={player.screenName}
                      rank={player.rank}
                      name={username}
                      displayName={displayName}
                      points={player.grandTotal}
                      appr={player.appr}
                      index={index}
                    />
                  );
                })
              )}
            </motion.div>
          ) : null}

          {!isLoading && isTQE && hasData ? (
            <motion.div
              key={`${activeTab}-${view}-${seasonId}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <p className="px-1 font-display text-xs text-muted-foreground">
                {activeTab}: {tqeName} - {filteredTQE.length} players
              </p>
              {view === "table" ? (
                <TQETable players={filteredTQE} />
              ) : (
                filteredTQE.map((player, index) => {
                  const { username, displayName } = parseName(player.screenName);
                  return (
                    <TQEPlayerCard
                      key={player.screenName}
                      rank={index + 1}
                      name={username}
                      displayName={displayName}
                      gross={player.gross}
                      absoluteNet={player.absoluteNet}
                      compScore={player.compScore}
                      handiBonus={player.handiBonus}
                      finalPoints={player.finalPoints}
                      index={index}
                    />
                  );
                })
              )}
            </motion.div>
          ) : null}

          {!isLoading && isTQE && !hasData ? (
            <motion.div
              key={`${activeTab}-empty-${seasonId}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <p className="mb-3 text-4xl">🏌️</p>
              <p className="font-display font-semibold text-foreground">Coming Soon</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Results will appear after the event
              </p>
            </motion.div>
          ) : null}

          {!isLoading && isEclectic && filteredEclectic.length > 0 ? (
            <motion.div
              key={`eclectic-${view}-${seasonId}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <p className="px-1 font-display text-xs text-muted-foreground">
                Eclectic Leaderboard - {filteredEclectic.length} players
              </p>
              {view === "table" ? (
                <EclecticTable players={filteredEclectic} />
              ) : (
                filteredEclectic.map((player, index) => {
                  const { username, displayName } = parseName(player.screenName);
                  return (
                    <EclecticPlayerCard
                      key={player.screenName}
                      rank={index + 1}
                      name={username}
                      displayName={displayName}
                      score={player.score}
                      handicap={player.handicap}
                      total={player.total}
                      holesLocked={player.holesLocked}
                      holes={player.holes}
                      index={index}
                    />
                  );
                })
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {season.id === SEASONS[0].id ? <DeadlinesBanner /> : null}

        <p className="pb-6 text-center font-display text-[10px] text-muted-foreground">
          Itaewon Golf League © 2026
        </p>
      </main>
    </div>
  );
}
