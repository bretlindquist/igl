import { useQuery } from "@tanstack/react-query";
import type { SeasonConfig } from "@/config/data-sources";

export interface OOMPlayer {
  screenName: string;
  rounds: number[];
  grandTotal: number;
  appr: number;
  rank: number;
}

export interface TQEPlayer {
  screenName: string;
  gross: number;
  absoluteNet: number;
  compScore: number;
  handiBonus: number;
  finalPoints: number;
}

export interface EclecticPlayer {
  screenName: string;
  holes: (number | null)[];
  score: number;
  handicap: number;
  total: number;
  holesLocked: string;
  rank: number;
}

function parseOptionalNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "#N/A") return null;

  const parsed = parseFloat(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current.trim());
        current = "";
      } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        row.push(current.trim());
        current = "";
        if (row.some(c => c !== "")) rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }
  row.push(current.trim());
  if (row.some(c => c !== "")) rows.push(row);
  return rows;
}

async function fetchCSV(url: string): Promise<string[][]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const text = await res.text();
  return parseCSV(text);
}

export function parseOOM(rows: string[][]): OOMPlayer[] {
  const dataRows = rows.slice(2);
  return dataRows
    .filter(row => row.length >= 12 && row[1])
    .map(row => ({
      screenName: row[1],
      rounds: [
        parseFloat(row[2]) || 0,
        parseFloat(row[3]) || 0,
        parseFloat(row[4]) || 0,
        parseFloat(row[5]) || 0,
        parseFloat(row[6]) || 0,
        parseFloat(row[7]) || 0,
        parseFloat(row[8]) || 0,
      ],
      grandTotal: parseFloat(row[9]) || 0,
      appr: parseFloat(row[10]) || 0,
      rank: parseInt(row[11]) || 0,
    }));
}

export function parseTQE(rows: string[][]): TQEPlayer[] {
  const dataRows = rows.slice(2);
  return dataRows
    .filter(row => row.length >= 12 && row[0])
    .map(row => ({
      screenName: row[0],
      gross: parseFloat(row[1]) || 0,
      absoluteNet: parseFloat(row[2]) || 0,
      compScore: parseFloat(row[3]) || 0,
      handiBonus: parseFloat(row[10]) || 0,
      finalPoints: parseFloat(row[11]) || 0,
    }))
    .sort((a, b) => b.finalPoints - a.finalPoints);
}

export function parseEclectic(rows: string[][]): EclecticPlayer[] {
  const dataRows = rows.slice(1);
  const players = dataRows
    .map((row) => {
      if (row.length < 27) return null;

      const screenName = row[0]?.trim() ?? "";
      if (!screenName || screenName.includes("Grand Total") || screenName.replace(/\s/g, "") === "()") {
        return null;
      }

      const score = parseOptionalNumber(row[19]);
      const handicap = parseOptionalNumber(row[20]);
      const total = parseOptionalNumber(row[21]);

      if (score === null || handicap === null || total === null) {
        return null;
      }

      const holes: (number | null)[] = [];
      for (let i = 1; i <= 18; i++) {
        holes.push(parseOptionalNumber(row[i]));
      }

      return {
        screenName,
        holes,
        score,
        handicap,
        total,
        holesLocked: row[23] || "0%",
        rank: 0,
      };
    })
    .filter((player): player is EclecticPlayer => player !== null)
    .sort((a, b) => a.total - b.total);

  return players.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}

export function useOOMData(season: SeasonConfig) {
  return useQuery({
    queryKey: ["oom", season.id],
    queryFn: async () => {
      const rows = await fetchCSV(season.dataSources.oom);
      return parseOOM(rows);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTQEData(season: SeasonConfig, key: string) {
  return useQuery({
    queryKey: ["tqe", season.id, key],
    queryFn: async () => {
      const url = season.dataSources[key];
      if (!url) return [];
      const rows = await fetchCSV(url);
      return parseTQE(rows);
    },
    enabled: !!season.dataSources[key],
    staleTime: 5 * 60 * 1000,
  });
}

export function useEclecticData(season: SeasonConfig) {
  return useQuery({
    queryKey: ["eclectic", season.id],
    queryFn: async () => {
      const rows = await fetchCSV(season.dataSources.eclectic);
      return parseEclectic(rows);
    },
    staleTime: 5 * 60 * 1000,
  });
}
