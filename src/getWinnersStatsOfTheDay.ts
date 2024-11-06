import { PlayerStatsOfTheDay } from "./data-structure/dataTypes";

export const getWinnersStatsOfTheDay = (
  statsOfTheDay: PlayerStatsOfTheDay[],
): PlayerStatsOfTheDay[] => {
  const possibleWinners: PlayerStatsOfTheDay[] = statsOfTheDay.filter(
    (playerStats: PlayerStatsOfTheDay) => playerStats.attempts !== "X",
  );

  const lowestAttempts = Math.min(
    // @ts-ignore. This ts warning can be ignored since possibleWinners.attempts can not be 'X'
    ...possibleWinners.map(
      (playerStats: PlayerStatsOfTheDay) => playerStats.attempts,
    ),
  );

  return possibleWinners.filter(
    (playerStats: PlayerStatsOfTheDay) =>
      playerStats.attempts === lowestAttempts,
  );
};
