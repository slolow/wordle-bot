import {
  PlayerStats,
  PlayerStatsOfTheDay,
} from "../data-structure/dataTypes.js";
import { sortPlayerStatsFromWinnerToLoser } from "./sortPlayerStats.js";

const VALUE_X_ATTEMPTS_AS = 9;

const calcWins = (wins: number, isWinner: boolean): number =>
  isWinner ? wins + 1 : wins;

const calcPlayedGames = (playedGames: number): number => playedGames + 1;

const calcWinsPerGames = (wins: number, games: number): number =>
  Number((wins / games).toFixed(3));

const calcAttemptsOfTheDay = (attempts: number | "X"): number =>
  typeof attempts === "number" ? attempts : VALUE_X_ATTEMPTS_AS;

const calcTotalOfAttempts = (
  attempts: number | "X",
  totalOfAttempts: number,
): number => totalOfAttempts + calcAttemptsOfTheDay(attempts);

const calcAverageAttempts = (totalOfAttempts: number, games: number): number =>
  Number((totalOfAttempts / games).toFixed(3));

export const updatePlayersStats = (
  winnersStatsOfTheDay: PlayerStatsOfTheDay[],
  playersStatsOfTheDay: PlayerStatsOfTheDay[],
  playersStats: PlayerStats[],
): PlayerStats[] => {
  playersStatsOfTheDay.forEach((playerStatsOfTheDay: PlayerStatsOfTheDay) => {
    const playerStats: PlayerStats | undefined = playersStats.find(
      (playerStats: PlayerStats) =>
        playerStats.name === playerStatsOfTheDay.name,
    );

    const isWinner: boolean = winnersStatsOfTheDay.some(
      (winnerStatsOfTheDay: PlayerStatsOfTheDay) =>
        winnerStatsOfTheDay.name === playerStatsOfTheDay.name,
    );

    if (playerStats === undefined) {
      // add new player to playerStats
      const name: string = playerStatsOfTheDay.name;
      const wins: number = isWinner ? 1 : 0;
      const playedGames: number = 1;
      const winsPerGames: number = calcWinsPerGames(wins, playedGames);
      const totalOfAttempts: number = calcAttemptsOfTheDay(
        playerStatsOfTheDay.attempts,
      );
      const averageAttempts: number = totalOfAttempts;
      playersStats.push({
        name,
        wins,
        playedGames,
        winsPerGames,
        totalOfAttempts,
        averageAttempts,
      });
    } else {
      // update player in playerStats
      const wins: number = calcWins(playerStats.wins, isWinner);
      const playedGames: number = calcPlayedGames(playerStats.playedGames);
      const winsPerGames: number = calcWinsPerGames(wins, playedGames);
      const totalOfAttempts: number = calcTotalOfAttempts(
        playerStatsOfTheDay.attempts,
        playerStats.totalOfAttempts,
      );
      const averageAttempts: number = calcAverageAttempts(
        totalOfAttempts,
        playedGames,
      );
      playerStats.wins = wins;
      playerStats.playedGames = playedGames;
      playerStats.winsPerGames = winsPerGames;
      playerStats.totalOfAttempts = totalOfAttempts;
      playerStats.averageAttempts = averageAttempts;
    }
  });

  return sortPlayerStatsFromWinnerToLoser(playersStats);
};
