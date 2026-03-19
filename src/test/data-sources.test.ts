import { describe, expect, it } from "vitest";
import { DEFAULT_SEASON, SEASONS, getSeason } from "@/config/data-sources";
import { parseCSV, parseEclectic, parseOOM, parseTQE } from "@/hooks/use-leaderboard";

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

  it("sorts OOM players by grand total and derives rank in app", () => {
    const rows = parseCSV([
      "header 1",
      "header 2",
      "2,player two,10,12,14,16,18,20,22,112,16.0,99",
      "1,player one,10,12,14,16,18,20,22,120,15.0,1",
    ].join("\n"));

    expect(parseOOM(rows).map((player) => ({
      screenName: player.screenName,
      grandTotal: player.grandTotal,
      rank: player.rank,
    }))).toEqual([
      {
        screenName: "player one",
        grandTotal: 120,
        rank: 1,
      },
      {
        screenName: "player two",
        grandTotal: 112,
        rank: 2,
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

  it("filters placeholder eclectic rows and assigns rank from sorted totals", () => {
    const rows = parseCSV([
      "Name,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,Score,Handicap,Total,count,holes locked %,average h/c,total,TQE completed,rank,",
      "player one,-1,,,,,,,,,,,,,,,,,,-1,10.5,-11.5,17,5.6%,10.5,-11.5,1,99,player one",
      " (),,,,,,,,,,,,,,,,,,,0,#N/A,#N/A,18,0.0%,#N/A,,#N/A,, ()",
      "player two,,,,,,,,,,,,,,,,,,,0,20.0,-20.0,18,0.0%,20.0,-20.0,1,,player two",
    ].join("\n"));

    expect(parseEclectic(rows)).toEqual([
      {
        screenName: "player two",
        holes: Array(18).fill(null),
        score: 0,
        handicap: 20,
        total: -20,
        holesLocked: "0.0%",
        rank: 1,
      },
      {
        screenName: "player one",
        holes: [-1, ...Array(17).fill(null)],
        score: -1,
        handicap: 10.5,
        total: -11.5,
        holesLocked: "5.6%",
        rank: 2,
      },
    ]);
  });
});
