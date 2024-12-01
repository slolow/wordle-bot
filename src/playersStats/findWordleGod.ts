import { PlayerStats } from "../data-structure/dataTypes.js";

export const findWordleGods = (
  updatedPlayersStats: PlayerStats[],
): PlayerStats[] => {
  if (updatedPlayersStats.length === 0) return [];

  const maxWins: number = Math.max(
    ...updatedPlayersStats.map((playerStats: PlayerStats) => playerStats.wins),
  );
  const allPlayersWithMaxWins: PlayerStats[] = updatedPlayersStats.filter(
    (playerStats: PlayerStats): boolean => playerStats.wins === maxWins,
  );

  if (allPlayersWithMaxWins.length === 1) return allPlayersWithMaxWins;

  const maxWinsPerGames: number = Math.max(
    ...allPlayersWithMaxWins.map(
      (playerStats: PlayerStats) => playerStats.winsPerGames,
    ),
  );
  return allPlayersWithMaxWins.filter(
    (playerStats: PlayerStats): boolean =>
      playerStats.winsPerGames === maxWinsPerGames,
  );
};
