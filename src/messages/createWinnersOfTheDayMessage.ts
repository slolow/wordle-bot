import { PlayerStatsOfTheDay } from "../data-structure/dataTypes.js";

export const createWinnersOfTheDayMessage = (
  winnersStatsOfTheDay: PlayerStatsOfTheDay[],
): string => {
  const winners: string[] = winnersStatsOfTheDay.map(
    (playerStats: PlayerStatsOfTheDay) => playerStats.player,
  );

  if (winners.length === 0) {
    return "👎 No one won today. Bunch of looser.";
  }

  const attempts: number = <number>winnersStatsOfTheDay[0].attempts;

  return winners.length > 1
    ? `🏆 Today's winners are 🥁... ${winners.slice(0, -1).join(", ")} and ${winners[winners.length - 1]} with 
    ${attempts} attempts. Congrats my friends!`
    : `🏆 Today's winners is 🥁...${winners[0]} with ${attempts} attempts. Congrats my friend`;
};
