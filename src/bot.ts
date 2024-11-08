// TODO: change tsconfig.json to use .ts extensions instead of .js for import. Even better import without extension

import {
  PlayerStats,
  PlayerStatsOfTheDay,
} from "./data-structure/dataTypes.js";
import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { getWinnersStatsOfTheDay } from "./getWinnersStatsOfTheDay.js";
import { createWinnersOfTheDayMessage } from "./messages/createWinnersOfTheDayMessage.js";
import { parseCsv } from "./parsers/csvParser.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { updatePlayerStats } from "./updatePlayerStats.js";
import { exportToCsv } from "./exporter/exportToCsv.js";
import { createTablePhoto } from "./messages/createTablePhoto.js";

const TOKEN: string | undefined = process.env.TOKEN;
const CHAT_ID: string | undefined = process.env.CHAT_ID;

if (!TOKEN) {
  throw new Error("you need to provide a TOKEN in an .env file!");
}
if (!CHAT_ID) {
  throw new Error("you need to provide a CHAT_ID in an .env file!");
}

// We need absolute path because node:fs throws an error when opening file with relative path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToPlayersStats = join(__dirname, "../data/playersStatsTest.csv");

const CRON_EXPRESSION: string = "* * * * *";

const WORDLE_MSG_START: string = "Wordle";

const bot: TelegramBot = new TelegramBot(TOKEN!, { polling: true });

let playersStatsOfTheDay: PlayerStatsOfTheDay[] = [];

bot.on("message", (msg: TelegramBot.Message) => {
  const chatId: string = msg.chat.id.toString();
  const sender: TelegramBot.User | undefined = msg.from;
  const messageText: string | undefined = msg.text;

  if (!sender || !messageText || chatId !== CHAT_ID) {
    return;
  }

  if (sender.is_bot) {
    bot
      .sendMessage(
        chatId,
        `🔎 ${sender.first_name} is a bot! It's result will be ignored 🔍`,
      )
      .catch((error) => console.error("bot message could not be send", error));
    return;
  }

  if (messageText.startsWith(WORDLE_MSG_START)) {
    const informationFromWordleMessage = messageText.split(" ");

    const numberOfAttempts = informationFromWordleMessage[2][0];

    const playerStatsOfTheDay: PlayerStatsOfTheDay = {
      player: sender.first_name,
      attempts:
        numberOfAttempts !== "X" ? Number(numberOfAttempts) : numberOfAttempts,
    };
    playersStatsOfTheDay.push(playerStatsOfTheDay);
  }
});

cron.schedule(CRON_EXPRESSION, async () => {
  if (playersStatsOfTheDay.length === 0) {
    bot
      .sendMessage(
        CHAT_ID,
        "🦦Unfortunately no one played today... shame on you! 🦦",
      )
      .catch((error) => console.error("bot message could not be send", error));
    return;
  }

  const playersStats: PlayerStats[] = await parseCsv(pathToPlayersStats).catch(
    (error) => {
      bot
        .sendMessage(
          CHAT_ID,
          "🏥I had an accident. I won't be available until some one fixes me. I will come back stronger 🦾! 🏥",
        )
        .catch((error) =>
          console.error("bot message could not be send", error),
        );
      console.error(
        `An error occurred while importing the data from ${pathToPlayersStats}`,
        error,
      );
      process.exit(1);
    },
  );

  const winnersStatsOfTheDay: PlayerStatsOfTheDay[] =
    getWinnersStatsOfTheDay(playersStatsOfTheDay);

  const updatedPlayersStats: PlayerStats[] = updatePlayerStats(
    winnersStatsOfTheDay,
    playersStatsOfTheDay,
    playersStats,
  );

  let hasExportError: boolean = false;
  exportToCsv(pathToPlayersStats, updatedPlayersStats).catch((error) => {
    hasExportError = true;
    console.error(
      `The updated player stats could not be exported to ${pathToPlayersStats}`,
      error,
    );
  });

  hasExportError
    ? bot
        .sendMessage(
          CHAT_ID,
          "😭 Unfortunately, due to a technical error, I won't be able to include the results in the overall" +
            "statistics today. Scusi my friends! 😭 \n\n Nevertheless here are the results for today: " +
            `\n\n ${createWinnersOfTheDayMessage(winnersStatsOfTheDay)}`,
        )
        .catch((error) => console.error("bot message could not be send", error))
    : bot
        .sendPhoto(CHAT_ID, createTablePhoto(playersStats), {
          caption: createWinnersOfTheDayMessage(winnersStatsOfTheDay),
        })
        .catch((error) =>
          console.error("bot photo message could not be send", error),
        );

  playersStatsOfTheDay = [];
});
