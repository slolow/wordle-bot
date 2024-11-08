export type PlayerStatsOfTheDay = {
  name: string;
  attempts: number | "X";
};

export type PlayerStats = {
  name: string;
  wins: number;
  playedGames: number;
  winsPerGames: number;
  totalOfAttempts: number;
  averageAttempts: number;
};
