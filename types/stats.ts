type StatsSection = {
  title: string;
  stats: StatsEntry[];
};

type StatsEntry = {
  label: string;
  value: string;
};

export type Statistics = StatsSection[];
