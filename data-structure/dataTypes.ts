export type PlayerStatsOfTheDay = {
  player: string;
  attempts: number | "X";
};

export type TodaysGame = {
  date: Date;
  gameNumber: number;
  playersStats: PlayerStatsOfTheDay[];
};

export type AllGames = TodaysGame[];
