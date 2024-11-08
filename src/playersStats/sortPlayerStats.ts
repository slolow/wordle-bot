import { PlayerStats } from "../data-structure/dataTypes.js";

export const sortPlayerStatsFromWinnerToLoser = (
  playersStats: PlayerStats[],
) => {
  // sort first by wins. If equality sort by winsPerGames
  return playersStats.sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return b.winsPerGames - a.winsPerGames;
  });
};
