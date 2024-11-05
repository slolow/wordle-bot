import { StatsOfTheDay } from "./data-structure/playerStatsOfTheDay";

export const createWinnersOfTheDayMessage = (
  winnersStatsOfTheDay: StatsOfTheDay,
) => {
  const winners = winnersStatsOfTheDay.map((playerStats) => playerStats.player);

  if (winners.length === 0) {
    return "👎 No one won today. Bunch of looser.";
  }

  const attempts = winnersStatsOfTheDay[0].attempts;

  return winners.length > 1
    ? `🏆 Today's winners are 🥁... ${winners.slice(0, -1).join(", ")} and ${winners[winners.length - 1]} with 
    ${attempts} attempts. Congrats my friends!`
    : `🏆 Today's winners is 🥁...${winners[0]} with ${attempts} attempts. Congrats my friend`;
};
