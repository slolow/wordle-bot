import { PlayerStats } from "../data-structure/dataTypes.js";

export const createWordleGodsMessage = (
  wordleGodsStats: PlayerStats[],
): string => {
  const wordleGods: string[] = wordleGodsStats.map(
    (wordleGodStats: PlayerStats) => wordleGodStats.name,
  );

  if (wordleGods.length === 0)
    return `❓We are still searching the wordle god!`;

  const wins: number = wordleGodsStats[0].wins;
  const playedGames: number = wordleGodsStats[0].playedGames;

  const singularOrPluralWin: string = wins === 1 ? "win" : "wins";
  const singularOrPluralGame: string = playedGames === 1 ? "game" : "games";

  return wordleGods.length > 1
    ? `👑 Wordle gods are ${wordleGods.slice(0, -1).join(", ")} and ${wordleGods[wordleGods.length - 1]} with ${wins} ${singularOrPluralWin} in ${playedGames} ${singularOrPluralGame}.`
    : `👑 Wordle god is ${wordleGods[0]} with ${wins} ${singularOrPluralWin} in ${playedGames} ${singularOrPluralGame}.`;
};
