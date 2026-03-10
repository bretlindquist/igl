import { describe, expect, it } from "vitest";
import { DEFAULT_SEASON, SEASONS, getSeason } from "@/config/data-sources";
import { parseCSV, parseOOM, parseTQE } from "@/hooks/use-leaderboard";

describe("data sources", () => {
  it("falls back to the default season when the id is unknown", () => {
    expect(getSeason("missing-season")).toEqual(DEFAULT_SEASON);
    expect(SEASONS[0]).toEqual(DEFAULT_SEASON);
  });

  it("parses leaderboard CSV rows into OOM players", () => {
    const rows = parseCSV([
      "header 1",
      "header 2",
      "1,player one,10,12,14,16,18,20,22,112,16.0,1",
    ].join("\n"));

    expect(parseOOM(rows)).toEqual([
      {
        screenName: "player one",
        rounds: [10, 12, 14, 16, 18, 20, 22],
        grandTotal: 112,
        appr: 16,
        rank: 1,
      },
    ]);
  });

  it("sorts TQE players by final points descending", () => {
    const rows = parseCSV([
      "header 1",
      "header 2",
      "alice,80,70,65,0,0,0,0,0,0,2,14",
      "bob,79,69,66,0,0,0,0,0,0,1,18",
    ].join("\n"));

    expect(parseTQE(rows).map((player) => player.screenName)).toEqual(["bob", "alice"]);
  });
});
