import {
  AllGames,
  PlayerStats,
  PlayerStatsOfTheDay,
  TodaysGame,
} from "./data-structure/dataTypes";
import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
// TODO: change tsconfig.json to use .ts extensions instead of .js for import. Even better import without extension
import { getWinnersStatsOfTheDay } from "./getWinnersStatsOfTheDay.js";
import { createWinnersOfTheDayMessage } from "./createWinnersOfTheDayMessage.js";
import { createWinnerTableMessage } from "./createWinnerTableMessage.js";
import { parseCsv } from "./parsers/csvParser.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { updatePlayerStats } from "./updatePlayerStats.js";

const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TOKEN) {
  throw new Error("you need to provide a TOKEN in an .env file!");
}
if (!CHAT_ID) {
  throw new Error("you need to provide a CHAT_ID in an .env file!");
}

// node:fs throws an error when opening file with relative path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToPlayersStats = join(__dirname, "../data/playersStatsTest.csv");

const CRON_EXPRESSION = "* * * * *";

const WORDLE_MSG_START = "Wordle";

const bot = new TelegramBot(TOKEN!, { polling: true });

let gameNumber: number;
let playersStatsOfTheDay: PlayerStatsOfTheDay[] = [];
let todaysGame: TodaysGame;

// TODO: initialize this with stats coming from the Database
const allGames: AllGames = [];

const playersStats: PlayerStats[] = await parseCsv(pathToPlayersStats);

console.log("players stats before", playersStats);

bot.on("message", (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id.toString();
  const sender = msg.from;
  const messageText = msg.text;

  if (!sender || !messageText || chatId !== CHAT_ID) {
    return;
  }

  if (sender.is_bot) {
    bot
      .sendMessage(
        chatId,
        `${sender.first_name} ist ein Bot! Sein Resultat wird ignoriert`,
      )
      .catch((error) => console.error("bot message could not be send", error));
    return;
  }

  if (messageText.startsWith(WORDLE_MSG_START)) {
    const informationFromWordleMessage = messageText.split(" ");

    // depending on the users phone settings the gameNumber can be for example '1.223' or '1,223'
    gameNumber = Number(informationFromWordleMessage[1].replace(",", "."));
    const numberOfAttempts = informationFromWordleMessage[2][0];

    const playerStatsOfTheDay: PlayerStatsOfTheDay = {
      player: sender.first_name,
      attempts:
        numberOfAttempts !== "X" ? Number(numberOfAttempts) : numberOfAttempts,
    };
    //TODO write playerStatsOfTheDay to DB
    playersStatsOfTheDay.push(playerStatsOfTheDay);
  }
});

cron.schedule(CRON_EXPRESSION, () => {
  if (playersStatsOfTheDay.length === 0) {
    bot
      .sendMessage(
        CHAT_ID,
        "🦦Unfortunately no one played today... shame on you!",
      )
      .catch((error) => console.error("bot message could not be send", error));
    return;
  }

  const winnersStatsOfTheDay: PlayerStatsOfTheDay[] =
    getWinnersStatsOfTheDay(playersStatsOfTheDay);

  const updatedPlayersStats: PlayerStats[] = updatePlayerStats(
    winnersStatsOfTheDay,
    playersStatsOfTheDay,
    playersStats,
  );

  console.log("players stats after", updatedPlayersStats);

  // TODO: write todaysGame to db
  todaysGame = {
    date: new Date(),
    gameNumber: gameNumber,
    playersStats: playersStatsOfTheDay,
  };

  // TODO: write allGames to db
  allGames.push(todaysGame);

  bot
    .sendMessage(CHAT_ID, createWinnersOfTheDayMessage(winnersStatsOfTheDay))
    .then(() =>
      setTimeout(
        () =>
          bot.sendMessage(
            CHAT_ID,
            createWinnerTableMessage(updatedPlayersStats),
          ),
        1000,
      ),
    )
    .catch((error) => console.error("bot message could not be send", error));

  playersStatsOfTheDay = [];
  todaysGame = {
    date: new Date(),
    gameNumber: 0,
    playersStats: [],
  };
});
