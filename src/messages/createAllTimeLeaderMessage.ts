import { PlayerStats } from "../data-structure/dataTypes.js";

export const createAllTimeLeaderMessage = (
  updatedPlayersStats: PlayerStats[],
): string =>
  `👑 Wordle god and all time leader is ${updatedPlayersStats[0].name} 👑`;
