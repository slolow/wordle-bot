import { PlayerStats } from "./data-structure/dataTypes";

export const sortPlayerStatsFromWinnerToLoser = (
  playersStats: PlayerStats[],
) => {
  return playersStats.sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return b.winsPerGames - a.winsPerGames;
  });
};
