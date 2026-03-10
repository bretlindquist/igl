export interface SeasonConfig {
  id: string;
  label: string;
  tabs: string[];
  dataSources: Record<string, string>;
  tqeNames: Record<string, string>;
  courseLegend: { num: string; name: string }[];
}

export const SEASONS: SeasonConfig[] = [
  {
    id: "spring-2026",
    label: "Spring 2026",
    tabs: ["OOM", "TQE-1", "TQE-2", "TQE-3", "Eclectic"],
    dataSources: {
      oom: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1778336569&output=csv",
      tqe1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1208158980&output=csv",
      tqe2: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1521728872&output=csv",
      tqe3: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1845609019&output=csv",
      eclectic: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1193845474&output=csv",
    },
    tqeNames: {
      tqe1: "Mauna Ocean Resort (Mauna/Ocean)",
      tqe2: "Turnberry Ailsa",
      tqe3: "TQE-3",
    },
    courseLegend: [
      { num: "R1", name: "Mauna Ocean" },
      { num: "R2", name: "Turnberry" },
      { num: "R3", name: "TBD" },
      { num: "R4", name: "Bugok CC" },
      { num: "R5", name: "TBD" },
      { num: "R6", name: "TBD" },
      { num: "R7", name: "TBD" },
    ],
  },
  {
    id: "fall-2025",
    label: "Fall 2025",
    tabs: ["OOM", "TQE-1", "TQE-2", "TQE-3", "TQE-4", "TQE-5", "TQE-6", "TQE-7", "Eclectic"],
    dataSources: {
      oom: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=1778336569&output=csv",
      tqe1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=1208158980&output=csv",
      tqe2: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=1521728872&output=csv",
      tqe3: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=1845609019&output=csv",
      tqe4: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=1340015654&output=csv",
      tqe5: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=1087142582&output=csv",
      tqe6: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=1087206475&output=csv",
      tqe7: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=639052434&output=csv",
      eclectic: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=1602664288&output=csv",
    },
    tqeNames: {
      tqe1: "Mission Hills Norman (L/L)",
      tqe2: "Purunsol [Lake/Mountain] (R/R)",
      tqe3: "St Andrews (L/L)",
      tqe4: "Tani CC (R/R)",
      tqe5: "Ariji CC (L/L)",
      tqe6: "Sophia Green (R/R)",
      tqe7: "Phoenix Resort [Phoenix] (L/L)",
    },
    courseLegend: [
      { num: "R1", name: "Mission Hills" },
      { num: "R2", name: "Purunsol" },
      { num: "R3", name: "St Andrews" },
      { num: "R4", name: "Tani CC" },
      { num: "R5", name: "Ariji CC" },
      { num: "R6", name: "Sophia Green" },
      { num: "R7", name: "Phoenix Resort" },
    ],
  },
];

export const DEFAULT_SEASON = SEASONS[0];

// Helper to get a season by id
export function getSeason(id: string): SeasonConfig {
  return SEASONS.find((s) => s.id === id) || DEFAULT_SEASON;
}
