import { createWinnersOfTheDayMessage } from "./createWinnersOfTheDayMessage.js";
import { createWordleGodsMessage } from "./createWordleGodsMessage.js";
import {
  PlayerStats,
  PlayerStatsOfTheDay,
} from "../data-structure/dataTypes.js";

export const createResultsOfTheDayMessage = (
  winnersStatsOfTheDay: PlayerStatsOfTheDay[],
  wordleGodsStats: PlayerStats[],
): string => {
  const winnersOfTheDayMessage: string =
    createWinnersOfTheDayMessage(winnersStatsOfTheDay);
  const wordleGodsMessage: string = createWordleGodsMessage(wordleGodsStats);
  return `${winnersOfTheDayMessage}\n\n${wordleGodsMessage}`;
};
