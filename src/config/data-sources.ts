export interface SeasonConfig {
  id: string;
  label: string;
  tabs: string[];
  availableTabs: string[];
  dataSources: Record<string, string>;
  tqeNames: Record<string, string>;
  courseLegend: { num: string; name: string }[];
  schedule: SeasonEvent[];
}

export interface SeasonEvent {
  label: string;
  course: string;
  koreanCourse?: string;
  deadline: string;
  setup: "Left / Left" | "Right / Right";
}

const ALL_TABS = ["OOM", "TQE-1", "TQE-2", "TQE-3", "TQE-4", "TQE-5", "TQE-6", "TQE-7", "Eclectic"];

const AUTUMN_2026_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQREWXfgJ7aTDFeG_Z0pC0XEK3PhIwYhvDttIA6TgHsQ-gaPd2vcFVq1G9jE5IKbCq9AAMhuWiu6Egt/pub";

function csvUrl(base: string, gid: string): string {
  return `${base}?gid=${gid}&output=csv`;
}

export const SEASONS: SeasonConfig[] = [
  {
    id: "autumn-2026",
    label: "Autumn 2026",
    tabs: ALL_TABS,
    availableTabs: ["OOM", "TQE-1", "Eclectic"],
    dataSources: {
      oom: csvUrl(AUTUMN_2026_BASE, "1778336569"),
      tqe1: csvUrl(AUTUMN_2026_BASE, "1208158980"),
      eclectic: csvUrl(AUTUMN_2026_BASE, "1193845474"),
    },
    tqeNames: {
      tqe1: "D'Heights (Clark)",
      tqe2: "Eagle Ridge (Faldo)",
      tqe3: "Evian Resort",
    },
    courseLegend: [
      { num: "R1", name: "D'Heights (Clark)" },
      { num: "R2", name: "Eagle Ridge (Faldo)" },
      { num: "R3", name: "Evian Resort" },
    ],
    schedule: [
      {
        label: "TQE-1",
        course: "D'Heights (Clark)",
        koreanCourse: "디하이츠 (클라크)",
        deadline: "13/9/2026",
        setup: "Left / Left",
      },
      {
        label: "TQE-2",
        course: "Eagle Ridge (Faldo)",
        koreanCourse: "이글 리지 (팔도)",
        deadline: "27/9/2026",
        setup: "Right / Right",
      },
      {
        label: "TQE-3",
        course: "Evian Resort",
        koreanCourse: "에비앙 리조트",
        deadline: "11/10/2026",
        setup: "Left / Left",
      },
    ],
  },
  {
    id: "spring-2026",
    label: "Spring 2026",
    tabs: ALL_TABS,
    availableTabs: ALL_TABS,
    dataSources: {
      oom: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1778336569&output=csv",
      tqe1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1208158980&output=csv",
      tqe2: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1521728872&output=csv",
      tqe3: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1845609019&output=csv",
      tqe4: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1340015654&output=csv",
      tqe5: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1087142582&output=csv",
      tqe6: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1087206475&output=csv",
      tqe7: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=639052434&output=csv",
      eclectic: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ76ygkivaadAW5ln88ZUZpVSasm4WDsgLIn6ZupJrwhfafTYLgdYhrjmMizcKzA4Ikzr3t-3Zdzl-0/pub?gid=1193845474&output=csv",
    },
    tqeNames: {
      tqe1: "Mauna Ocean Resort (Mauna/Ocean)",
      tqe2: "Turnberry Ailsa",
      tqe3: "Bay Hill",
      tqe4: "Bugok",
      tqe5: "East Hill CC (Lake / Valley)",
      tqe6: "Leaders CC (Hill / Lake)",
      tqe7: "Alpine Chiang Mai (A / B) 알파인 치앙마이",
    },
    courseLegend: [
      { num: "R1", name: "Mauna Ocean" },
      { num: "R2", name: "Turnberry" },
      { num: "R3", name: "Bay Hill" },
      { num: "R4", name: "Bugok CC" },
      { num: "R5", name: "East Hill CC" },
      { num: "R6", name: "Leaders CC" },
      { num: "R7", name: "Alpine Chiang Mai" },
    ],
    schedule: [
      { label: "TQE-1", course: "Mauna Ocean Resort (Mauna/Ocean)", deadline: "8/3/2026", setup: "Left / Left" },
      { label: "TQE-2", course: "Turnberry (Ailsa)", deadline: "22/3/2026", setup: "Right / Right" },
      { label: "TQE-3", course: "Bay Hill", deadline: "5/4/2026", setup: "Left / Left" },
      { label: "TQE-4", course: "Bugok", deadline: "19/4/2026", setup: "Right / Right" },
      { label: "TQE-5", course: "East Hill CC (Lake / Valley)", deadline: "3/5/2026", setup: "Left / Left" },
      { label: "TQE-6", course: "Leaders CC (Hill / Lake)", deadline: "17/5/2026", setup: "Right / Right" },
      { label: "TQE-7", course: "Alpine Chiang Mai (A / B) 알파인 치앙마이", deadline: "31/5/2026", setup: "Left / Left" },
    ],
  },
  {
    id: "fall-2025",
    label: "Fall 2025",
    tabs: ALL_TABS,
    availableTabs: ALL_TABS,
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
    schedule: [],
  },
];

export const DEFAULT_SEASON = SEASONS[0];

// Helper to get a season by id
export function getSeason(id: string): SeasonConfig {
  return SEASONS.find((s) => s.id === id) || DEFAULT_SEASON;
}
