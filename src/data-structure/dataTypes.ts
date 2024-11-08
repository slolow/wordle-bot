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

export type PlayerStats = {
  name: string;
  wins: number;
  playedGames: number;
  winsPerGames: number;
  totalOfAttempts: number;
  averageAttempts: number;
};
