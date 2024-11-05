import { StatsOfTheDay } from "./data-structure/playerStatsOfTheDay";

export const getWinnersStatsOfTheDay = (statsOfTheDay: StatsOfTheDay) => {
  const possibleWinners: StatsOfTheDay = statsOfTheDay.filter(
    (playerStats) => playerStats.attempts !== "X",
  );

  const lowestAttempts = Math.min(
    // @ts-ignore. This ts warning can be ignored since possibleWinners.attempts can not be 'X'
    ...possibleWinners.map((playerStats) => playerStats.attempts),
  );

  return possibleWinners.filter(
    (playerStats) => playerStats.attempts === lowestAttempts,
  );
};
