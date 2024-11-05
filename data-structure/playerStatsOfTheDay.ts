export type PlayerStatsOfTheDay = {
  player: string;
  attempts: number | "X";
};

export type StatsOfTheDay = PlayerStatsOfTheDay[];
